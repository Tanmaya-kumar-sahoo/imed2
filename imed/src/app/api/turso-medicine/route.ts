import { NextRequest, NextResponse } from 'next/server';
import { TursoMedicineService } from '@/lib/services/turso-medicine-service';
import { v4 as uuidv4 } from 'uuid';

// Initialize the Turso Medicine Service
const medicineService = new TursoMedicineService();

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

// Helper function to extract symptoms into an array for better matching
function extractSymptomsArray(symptomsText: string): string[] {
  // Split by common delimiters
  let symptoms = symptomsText.split(/[,;.]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // If no delimiters found, try to split by spaces for longer phrases
  if (symptoms.length <= 1 && symptomsText.length > 15) {
    symptoms = symptomsText.split(/\s+/)
      .filter(s => s.length > 3); // Filter out short words
  }

  return symptoms;
}

export async function GET(request: Request) {
  try {
    // Get all medicines
    const medicines = await medicineService.getAllMedicines();
    return NextResponse.json({ medicines });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Turso API endpoint hit");
    
    // Parse the request body
    const data = await request.json();
    console.log("Request data:", JSON.stringify(data));
    
    const { prompt, aiSettings } = data;
    
    // Validate input
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      console.log("Invalid prompt:", prompt);
      return NextResponse.json(
        { error: "Please provide symptom information" }, 
        { status: 400 }
      );
    }
    
    console.log("Raw prompt:", prompt);
    
    // Parse the input to extract symptoms
    let symptomsText = "";
    const symptomMatch = prompt.match(/symptoms:\s*([^]*?)(?=(age:|gender:|pre-existing|severity:|$))/i);
    if (symptomMatch) {
      symptomsText = symptomMatch[1].trim();
    } else if (prompt.includes("Symptoms:")) {
      const lines = prompt.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes("symptoms:")) {
          symptomsText = lines[i].substring(lines[i].indexOf(":") + 1).trim();
          if (i + 1 < lines.length && !lines[i + 1].includes(":")) {
            symptomsText += " " + lines[i + 1].trim();
          }
          break;
        }
      }
    }
    
    // Extract severity
    let severity = "normal";
    const severityMatch = prompt.match(/severity:\s*([^]*?)(?=$)/i);
    if (severityMatch) {
      severity = severityMatch[1].trim().toLowerCase();
    }
    
    // Extract age and gender
    const age = data.age || "Not specified";
    const gender = data.gender || "Not specified";
    
    // Check if this is a potential emergency
    const isEmergency = detectEmergency(symptomsText);
    
    // Split symptoms into an array for better matching
    const symptomsArray = extractSymptomsArray(symptomsText);
    
    // Use the Turso service to match symptoms to conditions
    const matchedConditions = await medicineService.matchSymptomsToConditions(symptomsArray);
    
    if (matchedConditions.length === 0) {
      return NextResponse.json(
        { 
          message: "Could not determine a condition based on the symptoms provided. Please provide more specific symptoms or consult a healthcare professional.",
          isEmergency
        }, 
        { status: 200 }
      );
    }
    
    // Get the best matching condition
    const bestMatch = matchedConditions[0];
    const condition = bestMatch.condition;
    
    // Get medicines for this condition
    const recommendedMedicines = await medicineService.getMedicinesForCondition(condition.id);
    
    // Format medicines for response
    const medicineList = recommendedMedicines.length > 0 
      ? recommendedMedicines.map(med => 
          `- ${med.name}${med.requiresPrescription ? " (PRESCRIPTION REQUIRED)" : ""} - ${med.description}`
        ).join("\n") 
      : "No specific medicines found for this condition. Please consult a healthcare professional.";
    
    // Determine doctor recommendation based on severity and emergency status
    const doctorRecommendation = isEmergency || severity === "severe" || condition.requiresDoctorVisit
      ? "URGENT: Seek immediate medical attention based on your symptoms and severity."
      : condition.requiresDoctorVisit
        ? "Yes, you should consult with a healthcare professional for proper diagnosis and treatment."
        : "Self-care is appropriate, but consult a doctor if symptoms persist or worsen.";
    
    // Format the response
    const formattedResponse = `
**CONDITION IDENTIFIED: ${condition.name}**

**RECOMMENDED MEDICINES:**
${medicineList}

**DOCTOR VISIT RECOMMENDATION:**
${doctorRecommendation}

**ADDITIONAL ADVICE:**
${condition.advice || "Stay hydrated, get rest, and monitor your symptoms."}

${isEmergency ? "**⚠️ IMPORTANT: The symptoms you've described may indicate a serious medical condition. Please seek immediate medical attention. ⚠️**" : ""}

**Remember: Always consult with a qualified healthcare professional before taking any medication.**
`;

    // Save the recommendation for history/analytics if user is logged in
    const userId = data.userId;
    if (userId) {
      try {
        const medicineIds = recommendedMedicines.map(med => med.id);
        await medicineService.saveRecommendation({
          userId,
          conditionId: condition.id,
          symptoms: symptomsText,
          age,
          gender,
          severity,
          additionalAdvice: condition.advice,
          isEmergency,
          medicineIds
        });
      } catch (error) {
        console.error("Error saving recommendation:", error);
        // Continue even if saving fails - don't block the response
      }
    }

    return NextResponse.json({
      response: formattedResponse,
      condition: condition.name,
      isEmergency,
      requiresDoctorVisit: condition.requiresDoctorVisit
    });
    
  } catch (error) {
    console.error("Error in medicine API:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" }, 
      { status: 500 }
    );
  }
}

export const runtime = "edge"; 