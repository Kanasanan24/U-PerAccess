import prisma from "../data/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const verifyAuth = async(req:Request, res:Response, next:NextFunction) => {
    try {
        // check token
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Unauthorized : No token provied." });
        // verify token
        let decoded;
        try {
            decoded = await verifyToken(token, process.env.JWT_SECRET as string);
        } catch (err) {
            const error = err as { status: number, message: string };
            return res.status(error.status ?? 401).json({ message: error.message ?? "Unauthorized : Something went wrong." });
        }
        // query user
        const user = await prisma.users.findUnique({
            where: { id: Number(decoded.id) },
            select: {
                id: true,
                email: true,
                userRoles: {
                    select: {
                        role: {
                            select: {
                                rolePermissions: {
                                    select: {
                                        permission: {
                                            select: { permission_name: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const permissions = user?.userRoles.flatMap(
            userRole => userRole.role?.rolePermissions.map(rp => rp.permission.permission_name) ?? []
        );
        if (!user) return res.status(400).json({ message: "Unauthorized : The user was not found." });
        // create verify data
        req.verify_user = {
            user_id: decoded.id,
            permissions: permissions ?? [],
            email: user.email
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: "Unauthorized : Something went wrong." });
    }
}

const verifyPermissions = (allow_permissions:string[]) => {
    return (req:Request, res:Response, next:NextFunction) => {
        // check permissions
        const permissions = req.verify_user?.permissions;
        if (!permissions || permissions.length === 0) return res.status(403).json({ message: "Permission denied." });
        // verify permissions
        const isAccess = allow_permissions.every(expect_permission => permissions.includes(expect_permission));
        if (!isAccess) return res.status(403).json({ message: "Permission denied." });
        next();
    }
}

const verifyToken = (token: string, secret: string): Promise<JwtPayload> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError")
            return reject({ status: 401, message: "Unauthorized: Token expired." });
            return reject({ status: 401, message: "Unauthorized: Invalid token." });
        }
            resolve(decoded as JwtPayload);
        });
    });
}

export {
    verifyAuth,
    verifyPermissions
};