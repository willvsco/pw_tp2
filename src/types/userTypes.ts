export interface RegisterInput {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    majorId: number;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface UserSession {
    id: number;
    fullName: string;
    email: string;
    majorId: number;
}
