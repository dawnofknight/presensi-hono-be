import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@presensi.com' },
    update: {},
    create: {
      email: 'admin@presensi.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
      position: 'System Administrator',
    },
  });

  console.log('Admin user created:', admin);

  // Create sample employees
  const sampleEmployees = [
    {
      email: 'john.doe@company.com',
      name: 'John Doe',
      position: 'Software Engineer',
    },
    {
      email: 'jane.smith@company.com',
      name: 'Jane Smith',
      position: 'Product Manager',
    },
    {
      email: 'bob.wilson@company.com',
      name: 'Bob Wilson',
      position: 'UX Designer',
    },
  ];

  for (const employee of sampleEmployees) {
    const empPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
      where: { email: employee.email },
      update: {},
      create: {
        email: employee.email,
        password: empPassword,
        name: employee.name,
        role: 'EMPLOYEE',
        position: employee.position,
      },
    });

    console.log('Employee created:', user);
  }

  // Create default settings
  const defaultSettings = [
    {
      key: 'office_latitude',
      value: '-6.2088',
      description: 'Latitude kantor pusat',
    },
    {
      key: 'office_longitude',
      value: '106.8456',
      description: 'Longitude kantor pusat',
    },
    {
      key: 'max_distance',
      value: '100',
      description: 'Jarak maksimal dari kantor (meter)',
    },
    {
      key: 'work_start_time',
      value: '09:00',
      description: 'Jam mulai kerja',
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.pengaturan.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Default settings created');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });