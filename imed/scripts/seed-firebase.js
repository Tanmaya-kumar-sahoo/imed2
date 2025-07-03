// This script seeds the Firebase database with initial medicine and condition data
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATRCrlLRLe_XR5paKpYmPS7Xgg8kGCEDY",
  authDomain: "imed-dd6ca.firebaseapp.com",
  projectId: "imed-dd6ca",
  storageBucket: "imed-dd6ca.firebasestorage.app",
  messagingSenderId: "741441903969",
  appId: "1:741441903969:web:726cf396e136c458753920",
  measurementId: "G-H8DY2M6DDH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample medicines data
const medicines = [
  {
    id: "med-001",
    name: "Acetaminophen (Tylenol)",
    genericName: "Acetaminophen",
    brandNames: ["Tylenol", "Panadol"],
    description: "Reduces fever and relieves pain",
    usageInstructions: "Take 1-2 tablets every 4-6 hours as needed, not exceeding 4000mg in 24 hours.",
    sideEffects: ["Liver damage (with high doses)", "Nausea", "Rash"],
    warnings: ["Do not use with alcohol", "Do not exceed recommended dose"],
    requiresPrescription: false,
    dosage: "325-500mg tablets",
    category: ["Pain Reliever", "Fever Reducer"],
    conditions: ["COLD", "FLU", "HEADACHE"]
  },
  {
    id: "med-002",
    name: "Ibuprofen (Advil, Motrin)",
    genericName: "Ibuprofen",
    brandNames: ["Advil", "Motrin"],
    description: "Anti-inflammatory that relieves pain and reduces fever",
    usageInstructions: "Take 1-2 tablets every 4-6 hours with food.",
    sideEffects: ["Stomach upset", "Heartburn", "Dizziness"],
    warnings: ["Not for use during pregnancy", "May increase risk of heart attack or stroke"],
    requiresPrescription: false,
    dosage: "200mg tablets",
    category: ["Pain Reliever", "Anti-inflammatory", "Fever Reducer"],
    conditions: ["HEADACHE", "FLU"]
  },
  {
    id: "med-003",
    name: "Pseudoephedrine (Sudafed)",
    genericName: "Pseudoephedrine",
    brandNames: ["Sudafed"],
    description: "Relieves nasal congestion",
    usageInstructions: "Take 1 tablet every 4-6 hours, not exceeding 4 doses in 24 hours.",
    sideEffects: ["Nervousness", "Dizziness", "Increased blood pressure"],
    warnings: ["Not for use with high blood pressure", "May cause insomnia"],
    requiresPrescription: false,
    dosage: "30-60mg tablets",
    category: ["Decongestant"],
    conditions: ["COLD", "ALLERGIES"]
  },
  {
    id: "med-004",
    name: "Cetirizine (Zyrtec)",
    genericName: "Cetirizine",
    brandNames: ["Zyrtec"],
    description: "Non-drowsy antihistamine for allergy symptoms",
    usageInstructions: "Take 1 tablet daily.",
    sideEffects: ["Drowsiness", "Dry mouth", "Fatigue"],
    warnings: ["May impair ability to drive or operate machinery"],
    requiresPrescription: false,
    dosage: "10mg tablets",
    category: ["Antihistamine"],
    conditions: ["ALLERGIES"]
  },
  {
    id: "med-005",
    name: "Omeprazole (Prilosec)",
    genericName: "Omeprazole",
    brandNames: ["Prilosec", "Losec"],
    description: "Proton pump inhibitor for acid reflux and heartburn",
    usageInstructions: "Take 1 capsule daily before eating.",
    sideEffects: ["Headache", "Nausea", "Diarrhea"],
    warnings: ["Long-term use may increase risk of bone fractures"],
    requiresPrescription: false,
    dosage: "20mg capsules",
    category: ["Proton Pump Inhibitor"],
    conditions: ["STOMACHACHE"]
  },
  {
    id: "med-006",
    name: "Oseltamivir (Tamiflu)",
    genericName: "Oseltamivir",
    brandNames: ["Tamiflu"],
    description: "Antiviral that can shorten flu duration if taken early",
    usageInstructions: "Take as prescribed by your doctor, usually twice daily for 5 days.",
    sideEffects: ["Nausea", "Vomiting", "Headache"],
    warnings: ["Must be started within 48 hours of symptom onset to be effective"],
    requiresPrescription: true,
    dosage: "75mg capsules",
    category: ["Antiviral"],
    conditions: ["FLU"]
  },
  {
    id: "med-007",
    name: "Bismuth subsalicylate (Pepto-Bismol)",
    genericName: "Bismuth subsalicylate",
    brandNames: ["Pepto-Bismol"],
    description: "Treats indigestion, upset stomach, and diarrhea",
    usageInstructions: "Take 2 tablespoons or 2 tablets every 30-60 minutes as needed.",
    sideEffects: ["Black stool", "Black tongue", "Constipation"],
    warnings: ["Do not use if allergic to aspirin"],
    requiresPrescription: false,
    dosage: "262mg tablets or 525mg/15ml liquid",
    category: ["Antacid", "Anti-diarrheal"],
    conditions: ["STOMACHACHE"]
  }
];

// Sample conditions data
const conditions = [
  {
    id: "cond-001",
    name: "COLD",
    description: "The common cold is a viral infection of the upper respiratory tract that primarily affects the nose and throat.",
    symptoms: [
      "runny nose", "congestion", "sore throat", "cough", "sneezing", "mild fever", "headache"
    ],
    recommendedMedicines: ["med-001", "med-003"],
    severity: "mild",
    requiresDoctorVisit: false
  },
  {
    id: "cond-002",
    name: "FLU",
    description: "Influenza is a viral infection that attacks your respiratory system — your nose, throat and lungs.",
    symptoms: [
      "fever", "body aches", "chills", "fatigue", "cough", "headache", "sore throat"
    ],
    recommendedMedicines: ["med-001", "med-002", "med-006"],
    severity: "moderate",
    requiresDoctorVisit: true
  },
  {
    id: "cond-003",
    name: "HEADACHE",
    description: "Pain in any region of the head, which can be a symptom of various conditions.",
    symptoms: [
      "headache", "pain in head", "throbbing", "pressure", "tension", "migraine"
    ],
    recommendedMedicines: ["med-001", "med-002"],
    severity: "mild",
    requiresDoctorVisit: false
  },
  {
    id: "cond-004",
    name: "STOMACHACHE",
    description: "Pain or discomfort in the abdomen, which can be caused by various digestive issues.",
    symptoms: [
      "stomach pain", "abdominal pain", "nausea", "vomiting", "indigestion", "heartburn", "bloating"
    ],
    recommendedMedicines: ["med-005", "med-007"],
    severity: "mild",
    requiresDoctorVisit: false
  },
  {
    id: "cond-005",
    name: "ALLERGIES",
    description: "An abnormal immune response to substances that are typically harmless to most people.",
    symptoms: [
      "sneezing", "itchy eyes", "runny nose", "congestion", "rash", "hives", "allergic"
    ],
    recommendedMedicines: ["med-003", "med-004"],
    severity: "mild",
    requiresDoctorVisit: false
  }
];

// Function to clear existing data
async function clearCollection(collectionName) {
  console.log(`Clearing ${collectionName} collection...`);
  const querySnapshot = await getDocs(collection(db, collectionName));
  
  const deletePromises = [];
  querySnapshot.forEach((document) => {
    deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
  });
  
  await Promise.all(deletePromises);
  console.log(`${querySnapshot.size} documents deleted from ${collectionName}`);
}

// Function to seed medicines
async function seedMedicines() {
  console.log("Seeding medicines...");
  for (const medicine of medicines) {
    await setDoc(doc(db, "medicines", medicine.id), {
      ...medicine,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`Added medicine: ${medicine.name}`);
  }
}

// Function to seed conditions
async function seedConditions() {
  console.log("Seeding conditions...");
  for (const condition of conditions) {
    await setDoc(doc(db, "conditions", condition.id), {
      ...condition,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`Added condition: ${condition.name}`);
  }
}

// Main function to run the seed
async function runSeed() {
  try {
    // Clear existing data
    await clearCollection("medicines");
    await clearCollection("conditions");
    
    // Seed new data
    await seedMedicines();
    await seedConditions();
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed
runSeed();
