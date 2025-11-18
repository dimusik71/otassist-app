import { db } from './src/db';

async function checkUser() {
  const user = await db.user.findUnique({
    where: { email: 'dshibanov@icloud.com' }
  });
  
  console.log('User found:', !!user);
  if (user) {
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Has password:', !!user.password);
    console.log('Created:', user.createdAt);
  }
}

checkUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
