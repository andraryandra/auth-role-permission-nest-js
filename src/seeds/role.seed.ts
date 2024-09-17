import { DataSource } from 'typeorm';
import { RoleEntity } from '../modules/auth/entities/role.entity';
import config from '../config/ormconfig';

export async function seedRoles() {
  const dataSource = new DataSource(config);

  try {
    await dataSource.initialize();

    const roleRepository = dataSource.getRepository(RoleEntity);

    const roles = [
      { name: 'Admin', description: 'Administrator role with full access' },
      { name: 'User', description: 'Standard user role with limited access' },
    ];

    for (const roleData of roles) {
      let role = await roleRepository.findOneBy({ name: roleData.name });
      if (!role) {
        role = roleRepository.create(roleData);
        await roleRepository.save(role);
        console.log(`Role ${roleData.name} created`);
      } else {
        console.log(`Role ${roleData.name} already exists`);
      }
    }

    console.log('Roles seeded successfully!');
  } catch (error) {
    console.error('Error seeding roles:', error);
  } finally {
    await dataSource.destroy();
  }
}
