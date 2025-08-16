import 'dotenv/config';
import mongoose from 'mongoose';
import User from '@models/User.js';

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);
  const count = await User.countDocuments();
  if (count === 0) {
    await User.create([
      { email: 'admin@example.com', passwordHash: '$2a$10$EKcKt0S0nq6t3jTn0FqsJ.DjZp6b0Z9e9u2nUiHq3Xb0iQ/K5YjWy', name: 'Admin', role: 'admin' }, // password: admin123
      { email: 'agent@example.com', passwordHash: '$2a$10$EKcKt0S0nq6t3jTn0FqsJ.DjZp6b0Z9e9u2nUiHq3Xb0iQ/K5YjWy', name: 'Agent', role: 'agent' }
    ]);
    console.log('Seeded default users.');
  } else {
    console.log('Users already exist.');
  }
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
