import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function addEmployeeUsers() {
  console.log('👥 Adding employee and admin users...');

  try {
    const employeeEmail = 'hardik.me.chadda@gmail.com';
    const adminEmail = 'umamalam4@gmail.com';

    const existingEmployee = await db.select().from(users).where(eq(users.email, employeeEmail));
    
    if (existingEmployee.length === 0) {
      const passwordHash = await bcrypt.hash('password123', 10);
      await db.insert(users).values({
        name: 'Hardik Chadda',
        email: employeeEmail,
        phone: '+91 98765 43211',
        passwordHash,
        role: 'employee',
        isVerified: true,
      });
      console.log('✅ Created employee user: hardik.me.chadda@gmail.com');
    } else {
      console.log('ℹ️  Employee user already exists');
    }

    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail));
    
    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash('password123', 10);
      await db.insert(users).values({
        name: 'Uma Malam',
        email: adminEmail,
        phone: '+91 98765 43212',
        passwordHash,
        role: 'admin',
        isVerified: true,
      });
      console.log('✅ Created admin user: umamalam4@gmail.com');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    const allUsers = await db.select({
      name: users.name,
      email: users.email,
      role: users.role,
    }).from(users);
    
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n✅ Employee/Admin user setup complete!');
  } catch (error) {
    console.error('❌ Error adding users:', error);
  }
}

addEmployeeUsers();
