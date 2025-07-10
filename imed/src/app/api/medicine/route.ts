// no external SDK—use fetch directly

import { authOptions } from "@/lib/auth";
import { saveRecommendation } from "@/lib/services/turso-medicine-service";
import { getServerSession } from "next-auth";
import { db } from '@/lib/db';
import { conditions } from '@/lib/db/schema/medicines';
import { v4 as uuidv4 } from 'uuid';

// AI settings interface
interface AISettings {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  promptTemplate: string;
  apiKey?: string;
}

// Medicine type interfaces
interface Medicine {
  name: string;
  prescription: boolean;
  description: string;
  allowedAgeGroups?: ("child"|"adult"|"old")[];
  dose?: string;
  quantity?: string;
}

interface MedicineRecommendation {
  medicines: Medicine[];
  doctorVisit: string;
  advice: string;
  emergency: boolean;
}

interface MedicineDatabase {
  [key: string]: MedicineRecommendation;
}

// Helper function to detect emergency conditions
function detectEmergency(symptoms: string): boolean {
  const emergencyKeywords = [
    "heart attack", "chest pain", "stroke", "can't breathe", "cannot breathe",
    "severe allergic reaction", "anaphylaxis", "unconscious", "unresponsive",
    "seizure", "overdose", "suicide", "bleeding heavily", "gunshot", "stab",
    "cancer", "tumor", "brain tumor", "meningitis", "pulmonary embolism",
    "appendicitis", "sepsis", "blood poisoning", "blood clot"
  ];
  
  const lowerCaseSymptoms = symptoms.toLowerCase();
  return emergencyKeywords.some(keyword => lowerCaseSymptoms.includes(keyword));
}

// Helper function to detect gibberish or nonsensical input
function isValidSymptomInput(text: string): boolean {
  if (!text || text.length < 3) return false;
  
  // Check if input is just random characters
  const randomCharPattern = /^[a-z]{1,3}[0-9]*$/i;
  if (randomCharPattern.test(text.replace(/\s/g, ''))) {
    return false;
  }
  
  // Check for common conversational phrases that aren't symptoms
  const conversationalPhrases = [
    "hey", "hello", "hi ", "how are you", "what are you", "what is this", 
    "test", "testing", "just testing", "asdf", "qwerty", "upto"
  ];
  
  for (const phrase of conversationalPhrases) {
    if (text.toLowerCase().includes(phrase)) {
      return false;
    }
  }
  
  // Check for extremely short words that might be gibberish
  const words = text.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 2 && text.length < 10) {
    return false;
  }
  
  // Check for common medical terms to ensure it's somewhat related to symptoms
  const medicalTerms = [
    "pain", "ache", "sore", "hurt", "fever", "cough", "cold", "flu", 
    "headache", "nausea", "vomit", "dizzy", "tired", "fatigue", "sick",
    "throat", "nose", "eye", "ear", "stomach", "back", "chest", "head",
    "skin", "rash", "itch", "swelling", "breath", "breathing", "sneeze",
    "runny", "congestion", "diarrhea", "constipation", "blood", "pressure",
    "heart", "attack", "stroke", "diabetes", "asthma", "allergic"
  ];
  
  // If at least one medical term is found, consider it valid
  let hasMedicalTerm = false;
  for (const term of medicalTerms) {
    if (text.toLowerCase().includes(term)) {
      hasMedicalTerm = true;
      break;
    }
  }
  
  // For longer inputs, we still want at least one medical term
  if (!hasMedicalTerm) {
    return false;
  }
  
  // Default to true if it passes all checks
  return true;
}

// Default AI settings if none are provided
const DEFAULT_AI_SETTINGS: AISettings = {
  model: "mistralai/mistral-7b-instruct:free",
  temperature: 0.7,
  topP: 0.95,
  maxTokens: 500,
  promptTemplate: `
You are an AI medical assistant providing medicine recommendations based on symptoms. Your task is to analyze the symptoms and provide appropriate medicine recommendations.

Patient Information:
- Symptoms: {{symptoms}}
- Age: {{age}}
- Gender: {{gender}}
- Pre-existing conditions: {{preExistingConditions}}
- Severity: {{severity}}

Respond ONLY with a valid JSON object in the following format, and nothing else:
{
  "Possible Condition": "...",
  "Medicines JSON": [
    { "name": "...", "prescription": true/false, "description": "...", "dose": "...", "quantity": "..." }
  ]
}
Do not include any markdown, explanations, or extra text.
`,
};

// Prefer explicit OPENROUTER_API_KEY but fall back to OPENAI_API_KEY for backward-compat
const DEFAULT_OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || "";

// Medicine database for common conditions
const medicineDB: MedicineDatabase = {
  "COLD": {
    medicines: [
      {
        name: "Acetaminophen (Tylenol)",
        prescription: false,
        description: "Reduces fever and relieves pain",
        allowedAgeGroups: ["child", "adult", "old"],
        dose: "500mg",
        quantity: "1-2 tablets every 4-6 hours"
      },
      {
        name: "Dextromethorphan (Robitussin DM)",
        prescription: false,
        description: "Suppresses cough",
        allowedAgeGroups: ["adult", "old"],
        dose: "10-20mg",
        quantity: "every 4 hours as needed"
      },
      {
        name: "Pseudoephedrine (Sudafed)",
        prescription: false,
        description: "Relieves nasal congestion",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Guaifenesin (Mucinex)",
        prescription: false,
        description: "Expectorant to help clear mucus",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "Only if symptoms persist beyond 7-10 days or worsen significantly",
    advice: "Rest, stay hydrated, use a humidifier, and consider zinc supplements within 24 hours of symptom onset",
    emergency: false
  },
  "FLU": {
    medicines: [
      {
        name: "Oseltamivir (Tamiflu)",
        prescription: true,
        description: "Antiviral that can shorten flu duration if taken early (within 48 hours)",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Ibuprofen (Advil)",
        prescription: false,
        description: "Reduces fever and relieves body aches",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Acetaminophen (Tylenol)",
        prescription: false,
        description: "Alternative to ibuprofen for pain and fever",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Phenylephrine (Sudafed PE)",
        prescription: false,
        description: "Nasal decongestant",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "Recommended if symptoms are severe, especially for high-risk individuals (elderly, pregnant, immunocompromised)",
    advice: "Rest, stay hydrated, isolate to prevent spreading, and consider antiviral medication if diagnosed early",
    emergency: false
  },
  "HEADACHE": {
    medicines: [
      {
        name: "Ibuprofen (Advil, Motrin)",
        prescription: false,
        description: "Anti-inflammatory that relieves pain and reduces inflammation",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Acetaminophen (Tylenol)",
        prescription: false,
        description: "Pain reliever with fewer gastrointestinal side effects",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Aspirin",
        prescription: false,
        description: "Pain relief and anti-inflammatory, avoid in children",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Sumatriptan (Imitrex)",
        prescription: true,
        description: "Specifically for migraine headaches",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Rizatriptan (Maxalt)",
        prescription: true,
        description: "Fast-acting migraine medication",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "If headaches are severe, recurring, sudden onset, or accompanied by fever, vision changes, or neck stiffness",
    advice: "Rest in a quiet, dark room, stay hydrated, apply cold or warm compress, and maintain regular sleep schedule",
    emergency: false
  },
  "MIGRAINE": {
    medicines: [
      {
        name: "Sumatriptan (Imitrex)",
        prescription: true,
        description: "First-line treatment for acute migraine attacks",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Rizatriptan (Maxalt)",
        prescription: true,
        description: "Fast-dissolving triptan for migraines",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Ibuprofen (high dose)",
        prescription: false,
        description: "600-800mg can be effective for mild migraines",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Excedrin Migraine",
        prescription: false,
        description: "Combination of acetaminophen, aspirin, and caffeine",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "For diagnosis, prevention strategies, or if over-the-counter medications are ineffective",
    advice: "Dark, quiet room; cold compress; avoid triggers like certain foods, stress, or lack of sleep",
    emergency: false
  },
  "STOMACHACHE": {
    medicines: [
      {
        name: "Bismuth subsalicylate (Pepto-Bismol)",
        prescription: false,
        description: "Treats indigestion, upset stomach, and mild diarrhea",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Famotidine (Pepcid)",
        prescription: false,
        description: "Reduces stomach acid production for heartburn",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Omeprazole (Prilosec)",
        prescription: false,
        description: "Proton pump inhibitor for acid reflux and heartburn",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Simethicone (Gas-X)",
        prescription: false,
        description: "Relieves gas and bloating",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Loperamide (Imodium)",
        prescription: false,
        description: "For diarrhea symptoms",
        allowedAgeGroups: ["child", "adult", "old"]
      }
    ],
    doctorVisit: "If pain is severe, persistent (>24 hours), or accompanied by fever, vomiting, or blood in stool",
    advice: "Avoid spicy or fatty foods, eat smaller meals, stay hydrated with clear fluids, and consider the BRAT diet",
    emergency: false
  },
  "ALLERGIES": {
    medicines: [
      {
        name: "Cetirizine (Zyrtec)",
        prescription: false,
        description: "24-hour non-drowsy antihistamine for allergy symptoms",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Loratadine (Claritin)",
        prescription: false,
        description: "Non-drowsy antihistamine alternative",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Fexofenadine (Allegra)",
        prescription: false,
        description: "Non-drowsy, fast-acting antihistamine",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Fluticasone (Flonase)",
        prescription: false,
        description: "Nasal spray for congestion, sneezing, and runny nose",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Benadryl (Diphenhydramine)",
        prescription: false,
        description: "For severe allergic reactions (causes drowsiness)",
        allowedAgeGroups: ["child", "adult", "old"]
      }
    ],
    doctorVisit: "If over-the-counter medications don't provide relief or for allergy testing",
    advice: "Avoid known allergens, use air purifiers, keep windows closed during high pollen days, and shower after outdoor activities",
    emergency: false
  },
  "SORE_THROAT": {
    medicines: [
      {
        name: "Throat lozenges with menthol",
        prescription: false,
        description: "Provides temporary relief and keeps throat moist",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Ibuprofen (Advil)",
        prescription: false,
        description: "Reduces inflammation and pain",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Acetaminophen (Tylenol)",
        prescription: false,
        description: "Pain relief alternative",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Chloraseptic spray",
        prescription: false,
        description: "Topical anesthetic for immediate relief",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Amoxicillin",
        prescription: true,
        description: "Antibiotic for bacterial infections (strep throat)",
        allowedAgeGroups: ["child", "adult", "old"]
      }
    ],
    doctorVisit: "If severe pain, difficulty swallowing, fever >101°F, or white patches on throat",
    advice: "Gargle with warm salt water, drink warm liquids, use a humidifier, and rest your voice",
    emergency: false
  },
  "COUGH": {
    medicines: [
      {
        name: "Dextromethorphan (Robitussin DM)",
        prescription: false,
        description: "Cough suppressant for dry coughs",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Guaifenesin (Mucinex)",
        prescription: false,
        description: "Expectorant to help loosen mucus",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Honey",
        prescription: false,
        description: "Natural cough suppressant (not for children under 1 year)",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Codeine cough syrup",
        prescription: true,
        description: "For severe, persistent coughs",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "If cough persists >3 weeks, produces blood, or is accompanied by fever and weight loss",
    advice: "Stay hydrated, use a humidifier, avoid irritants like smoke, and try honey for natural relief",
    emergency: false
  },
  "DIARRHEA": {
    medicines: [
      {
        name: "Loperamide (Imodium)",
        prescription: false,
        description: "Slows down intestinal movement to reduce diarrhea",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Bismuth subsalicylate (Pepto-Bismol)",
        prescription: false,
        description: "Reduces inflammation and kills bacteria",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Oral rehydration solution",
        prescription: false,
        description: "Prevents dehydration from fluid loss",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Probiotics",
        prescription: false,
        description: "Helps restore healthy gut bacteria",
        allowedAgeGroups: ["child", "adult", "old"]
      }
    ],
    doctorVisit: "If severe dehydration, blood in stool, fever >101.3°F, or symptoms persist >3 days",
    advice: "Stay hydrated with clear fluids, follow the BRAT diet, avoid dairy and fatty foods, and rest",
    emergency: false
  },
  "CONSTIPATION": {
    medicines: [
      {
        name: "Polyethylene glycol (Miralax)",
        prescription: false,
        description: "Osmotic laxative that draws water into intestines",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Docusate (Colace)",
        prescription: false,
        description: "Stool softener for gentle relief",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Senna (Senokot)",
        prescription: false,
        description: "Stimulant laxative for short-term use",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Psyllium husk (Metamucil)",
        prescription: false,
        description: "Fiber supplement to promote regularity",
        allowedAgeGroups: ["child", "adult", "old"]
      }
    ],
    doctorVisit: "If constipation persists >3 days, severe abdominal pain, or rectal bleeding",
    advice: "Increase fiber intake, drink more water, exercise regularly, and establish a routine",
    emergency: false
  },
  "NAUSEA": {
    medicines: [
      {
        name: "Meclizine (Dramamine)",
        prescription: false,
        description: "For motion sickness and vertigo-related nausea",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Ginger supplements",
        prescription: false,
        description: "Natural anti-nausea remedy",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Ondansetron (Zofran)",
        prescription: true,
        description: "Powerful anti-nausea medication",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Promethazine (Phenergan)",
        prescription: true,
        description: "For severe nausea and vomiting",
        allowedAgeGroups: ["child", "adult", "old"]
      }
    ],
    doctorVisit: "If accompanied by severe abdominal pain, signs of dehydration, or persistent vomiting",
    advice: "Eat small, bland meals; avoid strong odors; stay hydrated with small sips of clear fluids",
    emergency: false
  },
  "INSOMNIA": {
    medicines: [
      {
        name: "Melatonin",
        prescription: false,
        description: "Natural sleep aid to regulate sleep-wake cycle",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Diphenhydramine (Benadryl)",
        prescription: false,
        description: "Antihistamine with sedating effects",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Doxylamine (Unisom)",
        prescription: false,
        description: "Sleep aid for short-term use",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Zolpidem (Ambien)",
        prescription: true,
        description: "Prescription sleep medication",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "If insomnia persists >2 weeks or significantly impacts daily functioning",
    advice: "Maintain regular sleep schedule, avoid caffeine late in day, create comfortable sleep environment, and limit screen time before bed",
    emergency: false
  },
  "ANXIETY": {
    medicines: [
      {
        name: "L-theanine supplements",
        prescription: false,
        description: "Natural amino acid for relaxation",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Magnesium supplements",
        prescription: false,
        description: "May help reduce anxiety symptoms",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Lorazepam (Ativan)",
        prescription: true,
        description: "Short-term anxiety relief",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Sertraline (Zoloft)",
        prescription: true,
        description: "SSRI antidepressant for long-term anxiety management",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "If anxiety significantly impacts daily life, work, or relationships",
    advice: "Practice deep breathing, regular exercise, limit caffeine, consider meditation or therapy, and maintain social connections",
    emergency: false
  },
  "BACK_PAIN": {
    medicines: [
      {
        name: "Ibuprofen (Advil)",
        prescription: false,
        description: "Anti-inflammatory for muscle and joint pain",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Naproxen (Aleve)",
        prescription: false,
        description: "Longer-lasting anti-inflammatory",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Acetaminophen (Tylenol)",
        prescription: false,
        description: "Pain relief without anti-inflammatory effects",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Topical analgesics (Aspercreme, Bengay)",
        prescription: false,
        description: "Localized pain relief",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Muscle relaxants (Cyclobenzaprine)",
        prescription: true,
        description: "For muscle spasms",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "If pain radiates down legs, loss of bladder control, or severe pain after injury",
    advice: "Apply ice for acute injuries, heat for muscle tension, gentle stretching, and maintain good posture",
    emergency: false
  },
  "UTI": {
    medicines: [
      {
        name: "Cranberry supplements",
        prescription: false,
        description: "May help prevent bacterial adhesion",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Phenazopyridine (AZO)",
        prescription: false,
        description: "Urinary pain relief",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Trimethoprim-sulfamethoxazole (Bactrim)",
        prescription: true,
        description: "First-line antibiotic for UTIs",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Nitrofurantoin (Macrobid)",
        prescription: true,
        description: "Alternative antibiotic for UTIs",
        allowedAgeGroups: ["child", "adult", "old"]
      }
    ],
    doctorVisit: "Strongly recommended for proper diagnosis and antibiotic treatment",
    advice: "Drink plenty of water, urinate frequently, wipe front to back, and avoid irritating products",
    emergency: false
  },
  "EAR_PAIN": {
    medicines: [
      {
        name: "Acetaminophen (Tylenol)",
        prescription: false,
        description: "Pain reliever for mild ear pain and fever",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Ibuprofen (Advil)",
        prescription: false,
        description: "Anti-inflammatory pain relief",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Antipyrine/Benzocaine otic drops (Auralgan)",
        prescription: true,
        description: "Analgesic ear drops for acute otitis media",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Amoxicillin",
        prescription: true,
        description: "First-line antibiotic for bacterial ear infection",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Ofloxacin otic drops",
        prescription: true,
        description: "Antibiotic ear drops for swimmer's ear",
        allowedAgeGroups: ["child", "adult", "old"]
      }
    ],
    doctorVisit: "If severe pain, drainage, hearing loss, or no improvement in 48-72 h",
    advice: "Keep ear dry, apply warm compress, use pain relievers as directed, and avoid inserting objects in the ear",
    emergency: false
  },

  // Emergency conditions
  "HEART_ATTACK": {
    medicines: [
      {
        name: "Aspirin (chewable)",
        prescription: false,
        description: "EMERGENCY: Chew 325mg aspirin immediately if not allergic",
        allowedAgeGroups: ["adult", "old"]
      },
      {
        name: "Nitroglycerin",
        prescription: true,
        description: "If prescribed for heart condition, take as directed",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "EMERGENCY: Contact hospital immediately",
    advice: "Call emergency services immediately. If conscious, chew aspirin and rest in comfortable position",
    emergency: true
  },
  "STROKE": {
    medicines: [
      {
        name: "Do not give any medication",
        prescription: false,
        description: "EMERGENCY: No medications should be given",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "EMERGENCY: Contact hospital immediately",
    advice: "Call emergency services immediately. Note time of symptom onset. Do not give food, water, or medication",
    emergency: true
  },
  "SEVERE_ALLERGIC_REACTION": {
    medicines: [
      {
        name: "Epinephrine auto-injector (EpiPen)",
        prescription: true,
        description: "EMERGENCY: Use immediately if available",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Benadryl (Diphenhydramine)",
        prescription: false,
        description: "25-50mg if conscious and able to swallow",
        allowedAgeGroups: ["child", "adult", "old"]
      }
    ],
    doctorVisit: "EMERGENCY: Contact hospital immediately",
    advice: "Use EpiPen if available, call emergency services, avoid trigger if known, and monitor breathing",
    emergency: true
  },
  "ASTHMA_ATTACK": {
    medicines: [
      {
        name: "Albuterol inhaler (Rescue inhaler)",
        prescription: true,
        description: "EMERGENCY: Use rescue inhaler as prescribed",
        allowedAgeGroups: ["child", "adult", "old"]
      },
      {
        name: "Prednisone",
        prescription: true,
        description: "Oral corticosteroid for severe attacks",
        allowedAgeGroups: ["adult", "old"]
      }
    ],
    doctorVisit: "EMERGENCY if severe: difficulty speaking, blue lips/fingers, or rescue inhaler not helping",
    advice: "Use rescue inhaler, sit upright, stay calm, avoid triggers, and seek immediate help if not improving",
    emergency: true
  }
};

export async function POST(req: Request) {
  try {
    // Debug header to help with CORS and to trace request flow
    console.log("API endpoint hit");
    
    // Parse the request body
    const data = await req.json();
    console.log("Request data:", JSON.stringify(data));
    
    const { prompt, aiSettings, forceAI } = data;
    
    // Use provided AI settings or defaults
    const currentAISettings: AISettings = {
      ...DEFAULT_AI_SETTINGS,
      ...(aiSettings || {})
    };
    
    // Validate input
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      console.log("Invalid prompt:", prompt);
      return new Response("Please provide symptom information", { status: 400 });
    }
    
    console.log("Raw prompt:", prompt);
    
    // Parse the input to extract specific information
    const symptomsText = prompt.toLowerCase();
    
    // Extract symptoms more reliably
    let symptoms = "";
    const symptomMatch = symptomsText.match(/symptoms:\s*([^]*?)(?=(age:|gender:|pre-existing|severity:|$))/i);
    if (symptomMatch) {
      symptoms = symptomMatch[1].trim();
      console.log("Extracted symptoms via regex:", symptoms);
    } else if (prompt.includes("Symptoms:")) {
      // Fallback method - try to extract symptoms from the line after "Symptoms:"
      const lines = prompt.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes("symptoms:")) {
          symptoms = lines[i].substring(lines[i].indexOf(":") + 1).trim();
          if (i + 1 < lines.length && !lines[i + 1].includes(":")) {
            symptoms += " " + lines[i + 1].trim();
          }
          console.log("Fallback symptoms extraction:", symptoms);
          break;
        }
      }
    } else {
      // If no structured format is found, use the entire prompt as symptoms
      symptoms = prompt.trim();
      console.log("Using entire prompt as symptoms:", symptoms);
    }
    console.log("Final parsed symptoms:", symptoms);
    
    // Check for gibberish or nonsensical input
    if (!isValidSymptomInput(symptoms)) {
      console.log("Detected gibberish or invalid symptom input:", symptoms);
      return new Response("Please provide valid symptom information. Your input appears to be incomplete or invalid.", { status: 400 });
    }
    
    // Extract severity more reliably
    let severity = "normal";
    const severityMatch = symptomsText.match(/severity:\s*([^]*?)(?=$)/i);
    if (severityMatch) {
      severity = severityMatch[1].trim().toLowerCase();
      console.log("Extracted severity via regex:", severity);
    } else if (prompt.includes("Severity:")) {
      // Fallback method - try to extract severity from the line after "Severity:"
      const lines = prompt.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes("severity:")) {
          severity = lines[i].substring(lines[i].indexOf(":") + 1).trim().toLowerCase();
          console.log("Fallback severity extraction:", severity);
          break;
        }
      }
    }
    console.log("Final parsed severity:", severity);
    
    // Extract pre-existing conditions
    let preExistingText = "";
    const preExistingMatch = symptomsText.match(/pre-existing conditions:\s*([^]*?)(?=(age:|gender:|symptoms:|severity:|$))/i);
    if (preExistingMatch) {
      preExistingText = preExistingMatch[1].trim().toLowerCase();
      console.log("Extracted pre-existing conditions:", preExistingText);
    }
    
    // Extract age and gender
    const age = data.age || "Not specified";
    const gender = data.gender || "Not specified";
    
    // Check if this is a potential emergency
    const isEmergency = detectEmergency(symptoms + " " + preExistingText);
    if (isEmergency) {
      console.log("EMERGENCY CONDITION DETECTED");
    }
    
    // Enhanced function to determine which condition matches symptoms
    function determineCondition(symptoms: string): string {
      console.log("Enhanced condition analysis for:", symptoms);
      
      const lowerSymptoms = symptoms.toLowerCase();
      
      // Create symptom scoring system for better accuracy
      const conditionScores: { [key: string]: number } = {};
      
      // Common condition patterns with weighted scoring
      const commonPatterns = {
        "COLD": [
          "runny nose", "stuffy nose", "sore throat", "sneezing", "congestion", 
          "post nasal drip", "mild fever", "cold symptoms", "rhinitis", "nasal discharge"
        ],
        "FLU": [
          "flu", "influenza", "high fever", "body aches", "muscle aches", "chills",
          "fatigue", "weakness", "fever and aches", "flu symptoms", "severe fatigue"
        ],
        "HEADACHE": [
          "headache", "head pain", "head ache", "pressure in head", "temple pain",
          "forehead pain", "tension headache", "throbbing pain"
        ],
        "MIGRAINE": [
          "migraine", "severe headache", "throbbing headache", "light sensitivity", 
          "sound sensitivity", "nausea with headache", "visual aura", "one sided headache"
        ],
        "STOMACHACHE": [
          "stomach ache", "stomach pain", "abdominal pain", "belly pain", "indigestion",
          "heartburn", "acid reflux", "upset stomach", "digestive issues"
        ],
        "ALLERGIES": [
          "allergies", "seasonal allergies", "hay fever", "sneezing", "itchy eyes",
          "watery eyes", "runny nose allergies", "pollen", "allergic rhinitis"
        ]
      };
      
      // Score common conditions
      for (const [condition, patterns] of Object.entries(commonPatterns)) {
        let score = 0;
        for (const pattern of patterns) {
          if (lowerSymptoms.includes(pattern)) {
            // Give higher scores to more specific/longer patterns
            score += pattern.split(' ').length;
          }
        }
        if (score > 0) {
          conditionScores[condition] = score;
        }
      }
      
      // Additional contextual scoring based on symptom combinations
      if (lowerSymptoms.includes("runny nose") && lowerSymptoms.includes("sore throat")) {
        conditionScores["COLD"] = (conditionScores["COLD"] || 0) + 3;
      }
      if (lowerSymptoms.includes("fever") && lowerSymptoms.includes("body aches")) {
        conditionScores["FLU"] = (conditionScores["FLU"] || 0) + 3;
      }
      if (lowerSymptoms.includes("throbbing") && lowerSymptoms.includes("headache")) {
        conditionScores["MIGRAINE"] = (conditionScores["MIGRAINE"] || 0) + 2;
      }
      
      // Find the highest scoring condition
      if (Object.keys(conditionScores).length === 0) {
        return "UNKNOWN";
      }
      
      const sortedConditions = Object.entries(conditionScores)
        .sort(([,a], [,b]) => b - a);
      
      const topCondition = sortedConditions[0][0];
      const topScore = sortedConditions[0][1];
      
      console.log("Condition scores:", conditionScores);
      console.log("Selected condition:", topCondition, "with score:", topScore);
      
      return topCondition;
    }
    
    // Always use AI for recommendations, regardless of condition
    const condition = "UNKNOWN";
    
    // Always use OpenRouter/API for recommendations
    try {
      // Use the provided API key if available
      const apiKey = currentAISettings.apiKey || DEFAULT_OPENROUTER_KEY;
      
      // Check if we have a valid API key
      if (!apiKey || apiKey === "your_openrouter_api_key_here") {
        return new Response(
          JSON.stringify({ error: "No API key provided. Please add your OpenRouter API key in the admin settings or .env.local file." }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      console.log("Using OR key:", apiKey.substring(0, 10) + "...");
      
      // Build prompt
      let aiPrompt = currentAISettings.promptTemplate
        .replace("{{symptoms}}", symptoms)
        .replace("{{age}}", age)
        .replace("{{gender}}", gender)
        .replace("{{preExistingConditions}}", preExistingText || "None")
        .replace("{{severity}}", severity);

      if (isEmergency) {
        aiPrompt = `EMERGENCY CONDITION DETECTED: The symptoms described may indicate a serious medical emergency.\n\n${aiPrompt}\n\nIMPORTANT: Since this appears to be a potential medical emergency, emphasize that the patient should seek IMMEDIATE medical attention.`;
      }

      console.log("Sending prompt to OpenRouter:", aiPrompt.substring(0,200)+"...");
      
      const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "IMED",
          "Accept": "application/json" // Ensure we get JSON responses
        },
        body: JSON.stringify({
          model: currentAISettings.model || "mistralai/mistral-7b-instruct:free",
          messages: [{ role: "user", content: aiPrompt }],
          temperature: currentAISettings.temperature ?? 0.7,
          max_tokens: currentAISettings.maxTokens ?? 500,
        }),
        cache: "no-store" // Prevent caching issues
      });

      if (!orResponse.ok) {
        const errText = await orResponse.text();
        console.error("OpenRouter API error", orResponse.status, errText);
        return new Response(
          JSON.stringify({ error: `OpenRouter error ${orResponse.status}` }),
          { status: orResponse.status, headers: { "Content-Type": "application/json" } }
        );
      }

      // Process successful response
      try {
        const orJson = await orResponse.json();
        const aiResponse = orJson.choices?.[0]?.message?.content?.trim() || "";
        
        // Format the final response
        const formattedResponse = `
**MEDICAL DISCLAIMER: This is AI-generated information and should not replace professional medical advice. Always consult a healthcare provider.**

${aiResponse}

${isEmergency ? "**⚠️ IMPORTANT: The symptoms you've described may indicate a serious medical condition. Please seek immediate medical attention. ⚠️**" : ""}

**Remember: Always consult with a qualified healthcare professional before taking any medication.**
`;
        
        // Save recommendation for authenticated users
        try {
          const session = await getServerSession(authOptions);
          const userId = session?.user && ((session.user as any).id ?? (session.user as any).uid ?? (session.user as any).sub);
          if (userId) {
            // Always auto-generate a new condition for each recommendation
            let conditionId = uuidv4();
            let conditionName = `AI Condition: ${symptoms.substring(0, 50)} - ${conditionId}`; // Use the generated UUID
            let conditionDescription = "Condition auto-generated by AI based on symptoms.";
            const severityValue: "mild" | "moderate" | "severe" = "mild"; // or use your logic

            await db.insert(conditions).values({
              id: conditionId,
              name: conditionName,
              description: conditionDescription,
              symptoms: JSON.stringify([symptoms]),
              severity: severityValue,
              requiresDoctorVisit: false,
              isEmergency: false,
              advice: "",
              createdAt: new Date(),
              updatedAt: new Date()
            } as any).returning();
            console.log("Auto-created new condition:", { conditionId, conditionName });

            // Now save the recommendation with the valid conditionId
            console.log("Saving recommendation with:", {
              userId,
              conditionId,
              symptoms,
              age,
              gender,
              severity,
              recommendation: formattedResponse,
            });
            if (userId && conditionId && symptoms) {
              await saveRecommendation({
                userId,
                conditionId,
                symptoms,
                age,
                gender,
                severity,
                recommendation: formattedResponse,
                createdAt: new Date(),
              });
            } else {
              console.warn("Not saving recommendation: missing userId, conditionId, or symptoms", { userId, conditionId, symptoms });
            }
          }
        } catch (e) {
          console.error("Failed to save recommendation", e);
        }
        
        return new Response(formattedResponse, { headers: { "Content-Type": "text/plain" } });
      } catch (parseError) {
        console.error("Failed to parse OpenRouter response:", parseError);
        return new Response(
          JSON.stringify({ error: "Failed to parse AI response. Please try again." }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (err: any) {
      // Improved error handling with simple message
      console.error("OpenRouter error details:", err);
      
      // Return a generic error message that won't cause issues on the client
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("General error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while getting recommendations. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}