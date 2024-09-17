import { seedPermissions } from './permission.seed';
import { seedRolePermission } from './role-permission.seed';
import { seedRoles } from './role.seed';
// Import other seeds here if needed

async function runSeeds() {
  try {
    console.log('Running Role and Permission seeder...');
    await seedRolePermission();

    console.log('Running Permission seeder...');
    await seedPermissions();

    console.log('Running Role seeder...');
    await seedRoles();

    console.log('All seeds have been successfully run!');
  } catch (error) {
    console.error('Error running seeds:', error);
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

runSeeds();
