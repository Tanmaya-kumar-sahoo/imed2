// Test script for user health profiles API
const BASE_URL = 'http://localhost:3000';

async function testHealthProfilesAPI() {
  console.log('🧪 Testing User Health Profiles API...\n');

  try {
    // Test 1: POST - Create/Update Health Profile
    console.log('📝 Test 1: Creating/Updating Health Profile...');
    const createResponse = await fetch(`${BASE_URL}/api/patient-presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        height: '175cm',
        weight: '70kg',
        blood_type: 'O+',
        allergies: 'Penicillin, Shellfish',
        chronic_conditions: 'Type 2 Diabetes, Hypertension',
        medications: 'Metformin 500mg daily, Lisinopril 10mg daily'
      }),
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Health profile created/updated successfully:');
      console.log(JSON.stringify(createData, null, 2));
    } else {
      const errorData = await createResponse.json();
      console.log('❌ Failed to create health profile:', createResponse.status);
      console.log(JSON.stringify(errorData, null, 2));
    }

    console.log('\n---\n');

    // Test 2: GET - Fetch Health Profile
    console.log('📖 Test 2: Fetching Health Profile...');
    const getResponse = await fetch(`${BASE_URL}/api/patient-presets`);

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ Health profile retrieved successfully:');
      console.log(JSON.stringify(getData, null, 2));
    } else {
      const errorData = await getResponse.json();
      console.log('❌ Failed to fetch health profile:', getResponse.status);
      console.log(JSON.stringify(errorData, null, 2));
    }

    console.log('\n---\n');

    // Test 3: POST - Update Health Profile with new data
    console.log('🔄 Test 3: Updating Health Profile with new data...');
    const updateResponse = await fetch(`${BASE_URL}/api/patient-presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        height: '180cm',
        weight: '75kg',
        blood_type: 'A+',
        allergies: 'Penicillin, Shellfish, Nuts',
        chronic_conditions: 'Type 2 Diabetes, Hypertension, Asthma',
        medications: 'Metformin 500mg daily, Lisinopril 10mg daily, Albuterol as needed'
      }),
    });

    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Health profile updated successfully:');
      console.log(JSON.stringify(updateData, null, 2));
    } else {
      const errorData = await updateResponse.json();
      console.log('❌ Failed to update health profile:', updateResponse.status);
      console.log(JSON.stringify(errorData, null, 2));
    }

    console.log('\n---\n');

    // Test 4: DELETE - Delete Health Profile
    console.log('🗑️  Test 4: Deleting Health Profile...');
    const deleteResponse = await fetch(`${BASE_URL}/api/patient-presets`, {
      method: 'DELETE',
    });

    if (deleteResponse.ok) {
      const deleteData = await deleteResponse.json();
      console.log('✅ Health profile deleted successfully:');
      console.log(JSON.stringify(deleteData, null, 2));
    } else {
      const errorData = await deleteResponse.json();
      console.log('❌ Failed to delete health profile:', deleteResponse.status);
      console.log(JSON.stringify(errorData, null, 2));
    }

    console.log('\n---\n');

    // Test 5: GET - Verify deletion
    console.log('🔍 Test 5: Verifying Health Profile deletion...');
    const verifyResponse = await fetch(`${BASE_URL}/api/patient-presets`);

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ Verification completed:');
      console.log(JSON.stringify(verifyData, null, 2));
      
      if (verifyData === null) {
        console.log('✅ Health profile successfully deleted!');
      } else {
        console.log('⚠️  Health profile still exists after deletion');
      }
    } else {
      const errorData = await verifyResponse.json();
      console.log('❌ Failed to verify deletion:', verifyResponse.status);
      console.log(JSON.stringify(errorData, null, 2));
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }

  console.log('\n🏁 Health Profiles API testing completed!');
}

// Run the tests
testHealthProfilesAPI(); 