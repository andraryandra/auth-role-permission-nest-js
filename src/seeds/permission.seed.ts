import { DataSource } from 'typeorm';
import { PermissionEntity } from '../modules/auth/entities/permission.entity';
import config from '../config/ormconfig';

export async function seedPermissions() {
  const dataSource = new DataSource(config);

  try {
    await dataSource.initialize();

    const permissionRepository = dataSource.getRepository(PermissionEntity);

    const permissions = [
      { name: 'READ_USER', description: 'Permission to read user data' },
      { name: 'WRITE_USER', description: 'Permission to write user data' },
      { name: 'DELETE_USER', description: 'Permission to delete user data' },
    ];

    for (const permissionData of permissions) {
      let permission = await permissionRepository.findOneBy({
        name: permissionData.name,
      });
      if (!permission) {
        permission = permissionRepository.create(permissionData);
        await permissionRepository.save(permission);
        console.log(`Permission ${permissionData.name} created`);
      } else {
        console.log(`Permission ${permissionData.name} already exists`);
      }
    }

    console.log('Permissions seeded successfully!');
  } catch (error) {
    console.error('Error seeding permissions:', error);
  } finally {
    await dataSource.destroy();
  }
}
