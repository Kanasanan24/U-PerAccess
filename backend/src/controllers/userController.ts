import Joi from "joi";
import bcrypt from "bcrypt";
import prisma from "../data/prisma";
import { Request, Response } from "express";
import { IFCreateUser, IFSearchType } from "../types/userType";

const userBlueprint = Joi.object({
    firstname: Joi.string().trim().min(3).max(100).required(),
    lastname: Joi.string().trim().min(3).max(100).required(),
    email: Joi.string().email().max(200).required(),
    password: Joi.string()
        .allow("")
        .pattern(/[a-z]/, "lowercase character")
        .pattern(/[A-Z]/, "uppercase character")
        .pattern(/[^a-zA-Z0-9]/, "special character")
        .min(8)
        .max(50)
        .required()
        .messages({
            "string.pattern.name": '"password" must contain at least one {#name}' 
        }),
    status: Joi.boolean().required(),
    role_ids: Joi.array().items(Joi.number().integer()).required(),
});

const searchUserBlueprint = Joi.object({
    title: Joi.string().allow("").required(),
    page: Joi.number().integer().required(),
    pageSize: Joi.number().integer().required(),
    sortField: Joi.string().valid("firstname", "updatedAt", "email", "id").required(),
    sortOrder: Joi.string().valid("asc", "desc").required(),
})

const createUser = async(req:Request<{}, {}, IFCreateUser>, res:Response) => {
    try {
        // check user who assign
        const user_id = req.verify_user?.user_id;
        if (!user_id) return res.status(400).json({ message: "The admin was not found." });
        // validate request
        const { error } = userBlueprint.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(
                (detail) => ({ path: detail.path, message: detail.message })
            )});
        }
        const { password, email, role_ids } = req.body;
        // check exist
        const userExist = await prisma.users.findUnique({ where: { email } });
        if (userExist) return res.status(409).json({ message: "Already have user in system." });
        // create user
        let currentData;
        const hashedPass = await bcrypt.hash(password, Number(process.env.ENCRYPT_ROUND));
        currentData = await prisma.users.create({
            data: { ...req.body, password: hashedPass },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                emailVerifiedAt: true,
                status: true,
            },
        });
        // sync role
        const syncStatus = await userSyncRoles(currentData.id, role_ids, user_id);
        if (syncStatus) {
            currentData = await prisma.users.findUnique({
                where: { id: Number(currentData.id) },
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    emailVerifiedAt: true,
                    status: true,
                    userRoles: {
                        select: {
                            role: {
                                select: { role_name:true }
                            }
                        }
                    }
                },
            });
        }
        // update user cache
        await prisma.statistics.update({
            where: { statistic_name: "amount_user" },
            data: { statistic_amount: { increment: 1 } }
        });
        return res.status(201).json({ message: "The user was created successfully.", data: syncStatus ? currentData : { ...currentData, userRoles: [] } });
    } catch (error) {
        console.error({ position: "Create user", error });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getUsers = async(req:Request, res:Response) => {
    try {
        // validate request
        const { error } = searchUserBlueprint.validate(req.query, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(
                (detail) => ({ path: detail.path, message: detail.message })
            )});
        }
        // query users
        const query = req.query as unknown as IFSearchType;
        const { title = "", page = 1, pageSize = 15, sortField = "id", sortOrder = "asc" } = query;
        const parsePage = Number(page);
        const parsePageSize = Number(pageSize);
        const users = await prisma.users.findMany({
            where: {
                OR: [
                    { firstname: { contains: title, } },
                    { lastname: { contains: title } },
                    { email: { contains: title } }
                ]
            },
            skip: (parsePage * 1) * parsePageSize,
            take: parsePageSize,
            orderBy: {
                [sortField]: sortOrder
            },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                emailVerifiedAt: true,
                status: true,
                userRoles: {
                    select: {
                        role: {
                            select: { role_name:true }
                        }
                    }
                }
            },
        });
        const totalUsers = await prisma.statistics.findUnique({
            where: { statistic_name: "amount_user" },
            select: { statistic_amount: true }
        });
        return res.status(200).json({ data: users, pagination:{
            page: parsePage,
            pageSize: parsePageSize,
            totalPages: Math.ceil(totalUsers?.statistic_amount ?? 0 / pageSize),
            totalSizes: totalUsers?.statistic_amount ?? 0
        }});
    } catch (error) {
        console.error({ position: "Get users", error });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getUserById = async(req:Request, res:Response) => {
    try {
        // check user id
        const { user_id } = req.params;
        if (!user_id) return res.status(400).json({ message: "The user was not found." });
        // query user
        const user = await prisma.users.findUnique({
            where: { id: Number(user_id) },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                emailVerifiedAt: true,
                status: true,
                userRoles: {
                    select: {
                        role: {
                            select: { role_name:true }
                        }
                    }
                }
            }
        });
        return res.status(200).json({ data: user });
    } catch (error) {
        console.error({ position: "Get user by id", error });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const updateUser = async(req:Request<{ current_id?:number }, {}, IFCreateUser>, res:Response) => {
    try {
        // check user id
        const { current_id } = req.params;
        if (!current_id) return res.status(400).json({ message: "The user was not found." });
        // check user who assign
        const user_id = req.verify_user?.user_id;
        if (!user_id) return res.status(400).json({ message: "The admin was not found." });
        // validate request
        const { error } = userBlueprint.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(
                (detail) => ({ path: detail.path, message: detail.message })
            )});
        }
        const { password, role_ids } = req.body;
        let currentData;
        let currentPassword;
        const oldPassword = await prisma.users.findUnique({
            where: { id: Number(current_id) },
            select: { password: true }
        });
        if (password !== "") currentPassword = await bcrypt.hash(password, Number(process.env.ENCRYPT_ROUND));
        else currentPassword = oldPassword?.password;
        // update user
        currentData = await prisma.users.update({
            where: { id: Number(current_id) },
            data: { ...req.body, password: currentPassword },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                emailVerifiedAt: true,
                status: true,
            },
        });
        // sync role
        const syncStatus = await userSyncRoles(currentData.id, role_ids, user_id);
        if (syncStatus) {
            currentData = await prisma.users.findUnique({
                where: { id: Number(currentData.id) },
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    emailVerifiedAt: true,
                    status: true,
                    userRoles: {
                        select: {
                            role: {
                                select: { role_name:true }
                            }
                        }
                    }
                },
            });
        }
        return res.status(200).json({ message: "The user was updated successfully.", data: syncStatus ? currentData : { ...currentData, userRoles: [] } });
    } catch (error) {
        console.error({ position: "Update user", error });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const deleteUser = async(req:Request, res:Response) => {
    try {
        // check user id
        const { user_ids } = req.body;
        if (!Array.isArray(user_ids) || user_ids.length === 0) return res.status(400).json({ message: "Can't delete user." });
        // delete user
        await prisma.users.deleteMany({ where: { id: { in: user_ids.map((id) => Number(id)) } } });
        return res.status(200).json({ message: "Users were deleted successfully." });
    } catch (error) {
        console.error({ position: "Delete user", error });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const userSyncRoles = async(user_id:number, role_ids:number[], assign_id:number) => {
    try {
        // check user id
        if (!user_id) {
            console.error("Sync Roles : Enter your valid user id");
            return false;
        }
        // clear role
        await prisma.userRoles.deleteMany({ where: { user_id: Number(user_id) } });
        if (role_ids.length === 0) return true;
        // re-sync
        await prisma.userRoles.createMany({
            data: role_ids.map(role_id => ({ user_id: Number(user_id), role_id: Number(role_id), assignedBy: Number(assign_id) }))
        });
        console.log("User-role synchronization completed successfully.");
        return true;
    } catch (error) {
        console.error({ position: "Sync roles", error });
        return false;
    }
}

export {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    userSyncRoles
}