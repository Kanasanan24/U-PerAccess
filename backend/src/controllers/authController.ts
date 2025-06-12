import Joi from "joi";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcrypt";
import mjml2html from "mjml";
import jwt from "jsonwebtoken";
import { readFileSync } from "fs";
import prisma from "../data/prisma";
import handlebars from "handlebars";
import { v4 as uuidv4 } from "uuid";
import transport from "../utils/mailer";
import { Request, Response } from "express";
import { userSyncRoles } from "./userController";
import { IFSignin, IFSignup } from "../types/authType";

/*
    Cookie Mode
    - strict ส่งมาเฉพาะเมื่อ request มาจาก domain เดียวกัน
    - lax ส่งเมื่อมาจาก form หรือ a
    - none ส่งแม้ cross-site อย่างเช่น front และ back ไม่อยู่ domain เดียวกัน
*/

const signinBlueprint = Joi.object({
    email: Joi.string().email().max(200).required(),
    password: Joi.string().min(8).max(50).required()
});

const signupBlueprint = Joi.object({
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
    token: Joi.number().integer().min(100000).max(999999).required(),
    reference_code: Joi.string().length(36).required(),
});

const signin = async(req:Request<{}, {}, IFSignin>, res:Response) => {
    try {
        // validate request
        const { error } = signinBlueprint.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(
                (detail) => ({ path: detail.path, message: detail.message })
            )});
        }
        const { email, password } = req.body;
        // check email
        const user = await prisma.users.findUnique({
            where: { email },
            select: { id:true, email:true, password:true, emailVerifiedAt: true, status: true }
        });
        if (!user) return res.status(401).json({ message: "email or password is invalid." });
        if (!user.status) return res.status(403).json({ message: "Permission denied for this user." });
        if (!user.emailVerifiedAt) return res.status(401).json({ message: "Please, verify your email with OTP before sign in." });
        const isCorrect = await bcrypt.compare(password, user.password);
        if (isCorrect) {
            const cookie_hour = 24; // 1 day
            // create jwt
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
            res.cookie("token", token, {
                httpOnly: true, // javascript อ่านไม่ได้
                secure: process.env.COOKIE_SECURE_MODE === 'production',
                sameSite: 'none',
                maxAge: cookie_hour * 60 * 60 * 1000
            });
            return res.status(200).json({ message: "Sign in successfully." });
        } else return res.status(401).json({ message: "email or password is invalid." });
    } catch (error) {
        console.error({ position: "Sign in", error });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const signup = async(req:Request<{}, {}, IFSignup>, res:Response) => {
    try {
        // validate request
        const { error } = signupBlueprint.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(
                (detail) => ({ path: detail.path, message: detail.message })
            )});
        }
        const { email, password, token, reference_code, firstname, lastname } = req.body;
        // check exist
        const userExist = await prisma.users.findUnique({ where: { email }});
        if (userExist) return res.status(409).json({ message: "Already have user in system." });
        // check otp
        const verifyToken = await prisma.tokens.findFirst({ where: { token, reference_code } });
        if (!verifyToken) return res.status(400).json({ message: "OTP verification failed. Please, check and try again." });
        // check expired
        if (new Date() > new Date(verifyToken.expiredAt)) return res.status(400).json({ message: "OTP has expired. Please, request a new one." });
        // update token
        await prisma.tokens.update({
            where: { id: Number(verifyToken.id) },
            data: { isActive: true }
        });
        await prisma.tokens.deleteMany({ where: { for_email: email, isActive: false, token_type: "verify_email" } });
        // create user
        const hashedPass = await bcrypt.hash(password, Number(process.env.ENCRYPT_ROUND));
        const user = await prisma.users.create({
            data: { firstname, lastname, email, status: true, password: hashedPass, emailVerifiedAt: new Date()},
            select: { id: true }
        });
        // sync role
        const role_user = await prisma.roles.findUnique({ where: { role_name: "user" }, select: { id:true } });
        if (role_user) await userSyncRoles(user.id, [role_user.id], user.id);
        // update user cache
        await prisma.statistics.update({
            where: { statistic_name: "amount_user" },
            data: { statistic_amount: { increment: 1 } }
        });
        // create jwt
        const cookie_hour = 24;
        const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
        res.cookie("token", jwtToken, {
            httpOnly: true, // javascript อ่านไม่ได้
            secure: process.env.COOKIE_SECURE_MODE === 'production',
            sameSite: 'none',
            maxAge: cookie_hour * 60 * 60 * 1000
        });
        return res.status(200).json({ message: "Sign up successfully." });
    } catch (error) {
        console.error({ position: "Sign up", error });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const sendToken = async(req:Request, res:Response) => {
    try {
        // check request
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "The email was not found." });
        // check token
        const tokenExist = await prisma.tokens.findFirst({ where: { for_email: email, isActive: true, token_type: "verify_email" } });
        if (tokenExist) return res.status(400).json({ message: "The email was verified successfully." });
        const token = await prisma.tokens.create({
            data: {
                for_email: email,
                token: crypto.randomInt(100000, 999999),
                token_type: "verify_email",
                reference_code: uuidv4(),
                expiredAt: getFutureTime(),
                isActive: false
            },
            select: { token: true, reference_code: true }
        })
        // prepare mail form
        const mailPath = path.join(__dirname, "../emails/verify_token.mjml");
        const mail = readFileSync(mailPath, "utf-8");
        const mailTemplate = handlebars.compile(mail);
        const compiled = mailTemplate({ token: token.token, ref: token.reference_code });
        const { html } = mjml2html(compiled);
        // send
        await transport.sendMail({
            to: email,
            subject: "U-PerAccess : OTP Verification Code",
            html
        });
        return res.status(200).json({ message: "The otp was sent successfully." });
    } catch (error) {
        console.error({ position: "Send token", error });
        return res.status(500).json({ message: "Something went wrong." });
    }
}

const getFutureTime = (minutes = 15) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
}

export {
    signin,
    signup,
    sendToken
}