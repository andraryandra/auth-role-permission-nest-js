import { DataSource, In } from 'typeorm';
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

    // Permissions data
    const permissions = [
      { name: 'READ_USER', description: 'Permission to read user data' },
      { name: 'WRITE_USER', description: 'Permission to write user data' },
      { name: 'DELETE_USER', description: 'Permission to delete user data' },
      {
        name: 'read:category',
        description: 'Permission to read category data',
      },
      {
        name: 'create:category',
        description: 'Permission to create category data',
      },
      {
        name: 'update:category',
        description: 'Permission to update category data',
      },
      {
        name: 'delete:category',
        description: 'Permission to delete category data',
      },
    ];

    // Roles data
    const roles = [
      { name: 'Admin', description: 'Administrator role with full access' },
      { name: 'User', description: 'Standard user role with limited access' },
      {
        name: 'AdminGudang',
        description: 'Standard user role with limited access',
      },
    ];

    // Users data
    const users = [
      { username: 'admin', email: 'admin@example.com', password: 'admin123' },
      { username: 'user', email: 'user@example.com', password: 'user123' },
      {
        username: 'gudang',
        email: 'gudang@example.com',
        password: 'gudang123',
      },
    ];

    // Fetch existing permissions and roles in one query
    const existingPermissions = await permissionRepository.find();
    const existingRoles = await roleRepository.find();

    // Convert fetched permissions/roles to maps for faster lookup
    const existingPermissionMap = new Map(
      existingPermissions.map((p) => [p.name, p]),
    );
    const existingRoleMap = new Map(existingRoles.map((r) => [r.name, r]));

    // Insert permissions (skip duplicates)
    for (const permissionData of permissions) {
      if (!existingPermissionMap.has(permissionData.name)) {
        const newPermission = permissionRepository.create(permissionData);
        await permissionRepository.save(newPermission);
        console.log(`Permission ${permissionData.name} created`);
      } else {
        console.log(`Permission ${permissionData.name} already exists`);
      }
    }

    // Insert roles (skip duplicates)
    for (const roleData of roles) {
      if (!existingRoleMap.has(roleData.name)) {
        const newRole = roleRepository.create(roleData);
        await roleRepository.save(newRole);
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

    // Assign permissions to Admin role
    const adminRole =
      existingRoleMap.get('Admin') ||
      (await roleRepository.findOneBy({ name: 'Admin' }));

    const userRole =
      existingRoleMap.get('User') ||
      (await roleRepository.findOneBy({ name: 'User' }));

    const allPermissions = await permissionRepository.find({
      where: { name: In(permissions.map((p) => p.name)) },
    });

    const existingRolePermissions = await rolePermissionRepository.findBy({
      role: adminRole,
    });

    const existingRolePermissionMap = new Map(
      existingRolePermissions.map((rp) => [rp.permission.name, rp]),
    );

    if (adminRole) {
      for (const permission of allPermissions) {
        if (!existingRolePermissionMap.has(permission.name)) {
          await rolePermissionRepository.save({ role: adminRole, permission });
          console.log(`Permission ${permission.name} assigned to Admin role`);
        }
      }
    }

    // Assign roles to users
    const adminUser = await userRepository.findOneBy({
      email: 'admin@example.com',
    });
    const normalUser = await userRepository.findOneBy({
      email: 'user@example.com',
    });

    if (adminUser && adminRole) {
      const existingAdminUserRole = await userRoleRepository.findOne({
        where: { user: adminUser, role: adminRole },
      });
      if (!existingAdminUserRole) {
        await userRoleRepository.save({ user: adminUser, role: adminRole });
        console.log('Admin user role assigned');
      } else {
        console.log('Admin user already has the Admin role');
      }
    }

    if (normalUser && adminRole) {
      const existingNormalUserRole = await userRoleRepository.findOne({
        where: { user: normalUser, role: userRole },
      });
      if (!existingNormalUserRole) {
        await userRoleRepository.save({ user: normalUser, role: userRole });
        console.log('Normal user role assigned');
      } else {
        console.log('Normal user already has the Admin role');
      }
    }

    const permissionGudang = [
      {
        name: 'read:category',
        description: 'Permission to read category data',
      },
    ];

    const userRoleGudang =
      existingRoleMap.get('AdminGudang') ||
      (await roleRepository.findOneBy({ name: 'AdminGudang' }));

    const allPermissionsGudang = await permissionRepository.find({
      where: { name: In(permissionGudang.map((p) => p.name)) },
    });

    const existingRolePermissionsGudang = await rolePermissionRepository.findBy(
      {
        role: userRoleGudang,
      },
    );

    const existingRolePermissionMapGudang = new Map(
      existingRolePermissionsGudang.map((rp) => [rp.permission.name, rp]),
    );

    if (userRoleGudang) {
      for (const permission of allPermissionsGudang) {
        if (!existingRolePermissionMapGudang.has(permission.name)) {
          await rolePermissionRepository.save({
            role: userRoleGudang,
            permission,
          });
          console.log(`Permission ${permission.name} assigned to Admin role`);
        }
      }
    }

    const gudangUser = await userRepository.findOneBy({
      email: 'gudang@example.com',
    });

    if (gudangUser && userRoleGudang) {
      const existingGudangUserRole = await userRoleRepository.findOne({
        where: { user: gudangUser, role: userRoleGudang },
      });
      if (!existingGudangUserRole) {
        await userRoleRepository.save({
          user: gudangUser,
          role: userRoleGudang,
        });
        console.log('Admin user role assigned');
      } else {
        console.log('Admin user already has the Admin role');
      }
    }

    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await dataSource.destroy();
  }
}
