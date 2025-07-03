const fetch = require('node-fetch');

async function testPatientPresets() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing Patient Presets API...');
  
  // Test 1: Get CSRF token first
  console.log('\n1. Getting CSRF token...');
  const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
  const csrfData = await csrfResponse.json();
  console.log('CSRF token:', csrfData.csrfToken);
  
  // Test 2: Login with CSRF token
  console.log('\n2. Testing signin...');
  const loginData = new URLSearchParams({
    email: 'koushikchodraju008@gmail.com',
    password: 'testpassword123',
    csrfToken: csrfData.csrfToken,
    callbackUrl: baseUrl,
    json: 'true'
  });
  
  const loginResponse = await fetch(`${baseUrl}/api/auth/signin/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: loginData.toString(),
    redirect: 'manual'
  });
  
  console.log('Login response status:', loginResponse.status);
  console.log('Login response headers:', Object.fromEntries(loginResponse.headers));
  
  // Extract session cookies
  const cookies = loginResponse.headers.get('set-cookie') || '';
  console.log('Session cookies:', cookies);
  
  // Test 3: Try to get existing presets
  console.log('\n3. Testing GET presets...');
  const getResponse = await fetch(`${baseUrl}/api/patient-presets`, {
    headers: {
      'Cookie': cookies
    }
  });
  
  console.log('GET response status:', getResponse.status);
  const getResult = await getResponse.text();
  console.log('GET response body:', getResult);
  
  // Test 4: Try to create a new preset
  console.log('\n4. Testing POST preset...');
  const postResponse = await fetch(`${baseUrl}/api/patient-presets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      name: 'Test Patient',
      age: 30,
      gender: 'male'
    })
  });
  
  console.log('POST response status:', postResponse.status);
  const postResult = await postResponse.text();
  console.log('POST response body:', postResult);
  
  console.log('\nTest completed.');
}

// Run the test
testPatientPresets().catch(console.error); 