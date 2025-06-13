declare global {
    namespace Express {
        interface Request {
            verify_user?: { user_id: number, permissions: string[], email: string };
        }
    }
}

export {};