// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const prisma = new PrismaClient();

// --- Configuration ---
// Single source of truth for all permissions
const PERMISSIONS = [
  { name: 'VIEW_DASHBOARD', description: 'View analytics and charts' },
  { name: 'MANAGE_EVENTS', description: 'Create/update/delete events' },
  { name: 'MANAGE_TICKETS', description: 'View/export ticket info' },
  { name: 'SCAN_TICKETS', description: 'Access check-in pages (QR/manual)' },
  { name: 'VIEW_PAYMENTS', description: 'Access payment records/logs' },
  { name: 'VIEW_DESIGN_TOOLS', description: 'Use homepage and SEO editors' },
  { name: 'EXPORT_DATA', description: 'Download CSV/XLSX reports' },
  { name: 'ACCESS_CHECKIN_LISTS', description: 'View offline printable lists' },
  { name: 'MANAGE_ADMINS', description: 'Create/update/delete admins' },
];

async function main() {
  console.log('🌱 Starting seed process...');

  // 1. Upsert all defined permissions
  await Promise.all(
    PERMISSIONS.map((perm) =>
      prisma.permission.upsert({
        where: { name: perm.name },
        update: { description: perm.description },
        create: perm,
      })
    )
  );
  console.log('✅ Permissions synced.');

  // 2. Get Superadmin details from environment variables
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const fullName = process.env.SEED_ADMIN_NAME;

  if (!email || !password || !fullName) {
    throw new Error(
      'SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, and SEED_ADMIN_NAME must be set in your .env file.'
    );
  }

  // 3. Get all permission IDs
  const allPermissions = await prisma.permission.findMany({
    select: { id: true },
  });

  // 4. Upsert the Superadmin user (without permissions first)
  const hashedPassword = await hash(password, 12);

  const superAdmin = await prisma.admin.upsert({
    where: { email },
    create: {
      email,
      password: hashedPassword,
      fullName,
    },
    // If admin exists, only update their name. Password is not touched.
    // If you want the password from .env to always override, add it here.
    update: {
      fullName,
    },
  });
  console.log(`👤 Superadmin '${superAdmin.email}' created or found.`);

  await prisma.siteSettings.upsert({
  where: { id: 'singleton' },
  update: {},
  create: {
    metaTitle: "FISH'N FRESH | Your Go-To Ticketing Platform",
    aboutHtml: "<p>Welcome to FISH'N FRESH! Discover and buy tickets for the best events in town.</p>"
  },
  });
  console.log('Default site settings seeded.');

  // 5. **THE FIX:** Now, update the admin to set their permissions.
  // This ensures the admin record exists before we try to connect permissions to it.
  await prisma.admin.update({
    where: { id: superAdmin.id },
    data: {
      permissions: {
        // `deleteMany` first to clear all existing permissions for this user.
        // This ensures a clean slate.
        deleteMany: {},
        // `create` the new permission links.
        create: allPermissions.map(({ id }) => ({
          permissionId: id,
        })),
      },
    },
  });
  console.log(`🔗 All permissions have been assigned to Superadmin.`);


  console.log(`✅ Seed complete. Superadmin '${email}' is fully configured.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// This script seeds the database with initial permissions and a superadmin user.
// It uses environment variables for the superadmin credentials.