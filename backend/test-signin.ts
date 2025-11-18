async function testSignIn() {
  const baseURL = process.env.BACKEND_URL || 'http://localhost:3000';
  
  console.log('Testing sign-in at:', baseURL);
  
  // Try to sign in
  const response = await fetch(`${baseURL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@test.com',
      password: 'test123'
    })
  });
  
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  const text = await response.text();
  console.log('Response body:', text);
  
  try {
    const json = JSON.parse(text);
    console.log('Parsed JSON:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('Could not parse as JSON');
  }
}

testSignIn().catch(console.error);
