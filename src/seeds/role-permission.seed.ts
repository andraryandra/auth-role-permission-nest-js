import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import config from '../config/ormconfig';
import { PermissionEntity } from '../modules/auth/entities/permission.entity';
import { RoleEntity } from '../modules/auth/entities/role.entity';
import { UserEntity } from '../modules/auth/entities/user.entity';
import { RolePermissionEntity } from '../modules/auth/entities/role_permissions.entity';
import { UserRoleEntity } from '../modules/auth/entities/user_roles.entity';

export async function seedRolePermission() {
  const dataSource = new DataSource(config);

  try {
    await dataSource.initialize();

    const permissionRepository = dataSource.getRepository(PermissionEntity);
    const roleRepository = dataSource.getRepository(RoleEntity);
    const userRepository = dataSource.getRepository(UserEntity);
    const rolePermissionRepository =
      dataSource.getRepository(RolePermissionEntity);
    const userRoleRepository = dataSource.getRepository(UserRoleEntity);

    // Manual permission data
    const permissions = [
      { name: 'READ_USER', description: 'Permission to read user data' },
      { name: 'WRITE_USER', description: 'Permission to write user data' },
      { name: 'DELETE_USER', description: 'Permission to delete user data' },
    ];

    // Manual role data
    const roles = [
      { name: 'Admin', description: 'Administrator role with full access' },
      { name: 'User', description: 'Standard user role with limited access' },
    ];

    // Manual user data
    const users = [
      { username: 'admin', email: 'admin@example.com', password: 'admin123' },
      { username: 'user', email: 'user@example.com', password: 'user123' },
    ];

    // Insert permissions
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

    // Insert roles
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

    // Insert users with encrypted passwords
    for (const userData of users) {
      let user = await userRepository.findOneBy({ email: userData.email });
      if (!user) {
        const hashedPassword = await hash(userData.password, 12);
        user = userRepository.create({ ...userData, password: hashedPassword });
        await userRepository.save(user);
        console.log(`User ${userData.email} created`);
      } else {
        console.log(`User ${userData.email} already exists`);
      }
    }

    // Insert role_permissions (Avoiding duplicates)
    const adminRole = await roleRepository.findOneBy({ name: 'Admin' });
    const readPermission = await permissionRepository.findOneBy({
      name: 'READ_USER',
    });
    const writePermission = await permissionRepository.findOneBy({
      name: 'WRITE_USER',
    });
    const deletePermission = await permissionRepository.findOneBy({
      name: 'DELETE_USER',
    });

    if (adminRole && readPermission && writePermission && deletePermission) {
      for (const permission of [
        readPermission,
        writePermission,
        deletePermission,
      ]) {
        const existingRolePermission = await rolePermissionRepository.findOne({
          where: { role: adminRole, permission: permission },
        });
        if (!existingRolePermission) {
          await rolePermissionRepository.save({
            role: adminRole,
            permission: permission,
          });
          console.log(
            `Assigned permission ${permission.name} to role ${adminRole.name}`,
          );
        } else {
          console.log(
            `Permission ${permission.name} is already assigned to role ${adminRole.name}`,
          );
        }
      }
    }

    // Insert user_roles (Avoiding duplicates)
    const adminUser = await userRepository.findOneBy({
      email: 'admin@example.com',
    });
    const normalUser = await userRepository.findOneBy({
      email: 'user@example.com',
    });

    if (adminUser && adminRole) {
      const existingUserRole = await userRoleRepository.findOne({
        where: { user: adminUser, role: adminRole },
      });
      if (!existingUserRole) {
        await userRoleRepository.save({ user: adminUser, role: adminRole });
        console.log('Admin user role assigned');
      } else {
        console.log('Admin user already has the Admin role');
      }
    }

    if (normalUser && adminRole) {
      const existingUserRole = await userRoleRepository.findOne({
        where: { user: normalUser, role: adminRole },
      });
      if (!existingUserRole) {
        await userRoleRepository.save({ user: normalUser, role: adminRole });
        console.log('Normal user role assigned');
      } else {
        console.log('Normal user already has the Admin role');
      }
    }

    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await dataSource.destroy();
  }
}
