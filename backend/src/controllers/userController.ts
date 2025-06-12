import Joi from "joi";
import bcrypt from "bcrypt";
import prisma from "../data/prisma";
import { Request, Response } from "express";

const userBlueprint = Joi.object({
    firstname: Joi.string().trim().min(3).max(100).required(),
    lastname: Joi.string().trim().min(3).max(100).required(),
    email: Joi.string().email().max(200).required(),
    password: Joi.string()
        .pattern(/[a-z]/, "lowercase character")
        .pattern(/[A-Z]/, "uppercase character")
        .pattern(/[^a-zA-Z0-9]/, "special character")
        .min(8)
        .max(50)
        .required()
        .messages({
            "string.pattern.name": '"password" must contain at least one {#name}' 
        }),
    status: Joi.boolean().required()
});

const createUser = async(req:Request, res:Response) => {
    try {
        // validate request
        const { error } = userBlueprint.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(
                (detail) => ({ path: detail.path, message: detail.message })
            )});
        }
        const { password, email } = req.body;
        // check exist
        const userExist = await prisma.users.findUnique({ where: { email } });
        if (userExist) return res.status(409).json({ message: "Already have user in system." });
        // create user
        const hashedPass = await bcrypt.hash(password, Number(process.env.ENCRYPT_ROUND));
        const user = await prisma.users.create({
            data: { ...req.body, password: hashedPass },
            include: {
                userRoles: {
                    include: {
                        role: {
                            select: { role_name: true }
                        }
                    }
                }
            }
        });
        const { password:_password, ...modifyUser } = user;
        return res.status(201).json({ message: "The user was created successfully.", data: modifyUser });
    } catch (error) {
        console.error({ position: "Create user", error });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getUsers = async(req:Request, res:Response) => {
    try {
        //
    } catch (error) {
        console.error({ position: "Get users", error });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

export {
    createUser
}