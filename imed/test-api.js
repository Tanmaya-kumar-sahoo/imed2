// Simple test script for the medicine API endpoint
const fetch = require('node-fetch');

// Test cases with different symptoms
const testCases = [
  {
    name: "Cold symptoms",
    prompt: `
Symptoms: I have a runny nose, coughing, and sore throat
Age: 35
Gender: male
Pre-existing conditions: none
Severity: normal`
  },
  {
    name: "Flu symptoms",
    prompt: `
Symptoms: I have a fever, body aches, and feeling very tired
Age: 42
Gender: female
Pre-existing conditions: none
Severity: severe`
  },
  {
    name: "Headache symptoms",
    prompt: `
Symptoms: I have a throbbing headache that won't go away
Age: 29
Gender: male
Pre-existing conditions: none
Severity: normal`
  },
  {
    name: "Stomach issues",
    prompt: `
Symptoms: I have stomach pain, nausea, and vomiting
Age: 50
Gender: female
Pre-existing conditions: none
Severity: severe`
  },
  {
    name: "Allergy symptoms",
    prompt: `
Symptoms: I have itchy eyes, sneezing, and a runny nose
Age: 33
Gender: female
Pre-existing conditions: seasonal allergies
Severity: normal`
  }
];

// Run tests sequentially
async function runTests() {
  console.log("Running API tests...");
  
  for (const test of testCases) {
    console.log(`\n=== Testing: ${test.name} ===`);
    console.log("Request data:", test.prompt);
    
    try {
      const response = await fetch("http://localhost:3000/api/medicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: test.prompt })
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        continue;
      }

      const result = await response.text();
      console.log("Response (first 300 chars):", result.substring(0, 300) + "...");
      
      // Check if the response contains the expected condition
      if (test.name.toLowerCase().includes("cold") && !result.includes("COLD")) {
        console.error("❌ Expected COLD condition but wasn't found in response");
      } else if (test.name.toLowerCase().includes("flu") && !result.includes("FLU")) {
        console.error("❌ Expected FLU condition but wasn't found in response");
      } else if (test.name.toLowerCase().includes("headache") && !result.includes("HEADACHE")) {
        console.error("❌ Expected HEADACHE condition but wasn't found in response");  
      } else if (test.name.toLowerCase().includes("stomach") && !result.includes("STOMACHACHE")) {
        console.error("❌ Expected STOMACHACHE condition but wasn't found in response");
      } else if (test.name.toLowerCase().includes("allergy") && !result.includes("ALLERGIES")) {
        console.error("❌ Expected ALLERGIES condition but wasn't found in response");
      } else {
        console.log("✅ Test passed!");
      }
      
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}

// Run the tests
runTests().then(() => console.log("\nAll tests completed."));

// Test file for API endpoint
fetch('http://localhost:3000/api/medicine', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Symptoms: headache and fever\nAge: 35\nGender: male\nPre-existing conditions: none\nSeverity: normal'
  })
})
.then(response => response.text())
.then(data => {
  console.log('Success:', data);
})
.catch((error) => {
  console.error('Error:', error);
}); 