import "express-session";

declare module "express-session" {
    interface SessionData {
        user?: {
            id: number;
            fullName: string;
            email: string;
            majorId: number;
        };
    }
}
