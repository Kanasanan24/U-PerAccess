import bcrypt from "bcrypt";
import dotenv from "dotenv";
import prisma from "../data/prisma";
dotenv.config();

const initial = async() => {
    try {
        // root user
        if (!process.env.ROOT_PASSWORD || !process.env.ENCRYPT_ROUND) {
            console.log("Please, initial environment variable first.");
            return;
        } else {
            const hashedPass = await bcrypt.hash(process.env.ROOT_PASSWORD, Number(process.env.ENCRYPT_ROUND));
            const user = await prisma.users.upsert({
                where: { email: "rooter_uperaccess@gmail.com" },
                update: {},
                create: {
                    firstname: "Rooter",
                    lastname: "Develop",
                    email: "rooter_uperaccess@gmail.com",
                    password: hashedPass,
                    status: true
                },
                select: { id: true }
            });
            // initial data
            const role_names = ["user", "admin", "manager"];
            const permission_names = ["create_user", "find_user", "update_user", "delete_user"];
            const statistic_names = ["amount_user", "amount_role", "amount_permission"];
            const roleExist = await prisma.roles.findMany({ where: { role_name: { in: role_names } }, select: { role_name: true } });
            const permissionExist = await prisma.permissions.findMany({ where: { permission_name: { in: permission_names } }, select: { permission_name: true } });
            const statisticExist = await prisma.statistics.findMany({ where: { statistic_name: { in: statistic_names } }, select: { statistic_name: true } });
            const roleExistName = roleExist.map(role => role.role_name);
            const permissionExistName = permissionExist.map(permission => permission.permission_name);
            const statisticExistName = statisticExist.map(statistic => statistic.statistic_name);
            const filterRoles = role_names.filter(role => !roleExistName.includes(role));
            const filterPermissions = permission_names.filter(permission => !permissionExistName.includes(permission));
            const filterStatistics = statistic_names.filter(statistic => !statisticExistName.includes(statistic));
            if (filterRoles.length > 0) {
                await prisma.roles.createMany({
                    data: filterRoles.map((role) => ({ role_name: role }))
                });
            }
            if (filterPermissions.length > 0) {
                await prisma.permissions.createMany({
                    data: filterPermissions.map((permission) => ({ permission_name: permission }))
                });
            }
            if (filterStatistics.length > 0) {
                await prisma.statistics.createMany({
                    data: filterStatistics.map((statistic) => ({ statistic_name: statistic, statistic_amount: 0 }))
                });
            }
            // join
            const role = await prisma.roles.findUnique({ where: { role_name: "admin" }, select: { id: true } });
            const rolePermissionExist = await prisma.rolePermissions.findMany({ where: { role_id: role?.id }, select: { permission_id:true } });
            const permissions = await prisma.permissions.findMany({ where: { permission_name: { in: permission_names } }, select: { id: true } });
            const prepareRolePermissionExist = rolePermissionExist.map(rolePermission => rolePermission.permission_id);
            const currentPermissions = permissions.filter(permission => !prepareRolePermissionExist.includes(permission.id));
            if (currentPermissions.length > 0) {
                await prisma.rolePermissions.createMany({
                data: currentPermissions.map((permission) =>  ({ role_id: role!.id, permission_id: permission.id, assignedBy: Number(user.id) }))
                });
            }
            console.log("The initial data was created successfully.");
            return;
        }
    } catch (error) {
        console.error({ position: "Seed Initial", error });
        return;
    }
}

initial();