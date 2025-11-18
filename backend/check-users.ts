import { db } from './src/db';

async function checkUsers() {
  const users = await db.user.findMany({
    take: 5,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  });
  
  console.log('Total users:', users.length);
  console.log('Users:', JSON.stringify(users, null, 2));
}

checkUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
