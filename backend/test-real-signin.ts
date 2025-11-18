async function testRealSignIn() {
  const baseURL = process.env.BACKEND_URL || 'http://localhost:3000';
  
  console.log('Testing sign-in with actual user at:', baseURL);
  
  // Try to sign in with the real user
  const response = await fetch(`${baseURL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'dshibanov@icloud.com',
      password: 'test' // We don't know the actual password
    })
  });
  
  console.log('Response status:', response.status);
  
  const text = await response.text();
  console.log('Response body:', text);
  
  try {
    const json = JSON.parse(text);
    console.log('Parsed JSON:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('Could not parse as JSON');
  }
}

testRealSignIn().catch(console.error);
