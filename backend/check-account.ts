import { db } from './src/db';

async function checkAccount() {
  const user = await db.user.findUnique({
    where: { email: 'dshibanov@icloud.com' },
    include: { accounts: true }
  });
  
  if (user) {
    console.log('User found:', user.email);
    console.log('Accounts count:', user.accounts.length);
    console.log('Accounts:', user.accounts.map(acc => ({
      id: acc.id,
      providerId: acc.providerId,
      hasPassword: !!acc.password
    })));
  } else {
    console.log('User not found');
  }
}

checkAccount()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
