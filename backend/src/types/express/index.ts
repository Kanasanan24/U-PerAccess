declare global {
    namespace Express {
        interface Request {
            verify_user?: { user_id: number };
        }
    }
}

export {};