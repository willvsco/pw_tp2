import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

export async function createUser(fullName: string, email: string, password: string, majorId: number) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: {
            fullName,
            email,
            password: hashedPassword,
            majorId,
        },
    });
}

export async function findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
}

export async function findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
}

export async function validatePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
}

export async function getTopRanking() {
    const results = await prisma.gameSession.groupBy({
        by: ["userId"],
        _max: { score: true },
        orderBy: { _max: { score: "desc" } },
        take: 10,
    });

    const ranking = await Promise.all(
        results.map(async (r: { userId: number; _max: { score: number | null } }) => {
            const user = await prisma.user.findUnique({ where: { id: r.userId } });
            return {
                fullName: user?.fullName ?? "Desconhecido",
                score: r._max.score ?? 0,
            };
        })
    );

    return ranking;
}

export async function saveScore(userId: number, score: number) {
    return prisma.gameSession.create({
        data: { userId, score },
    });
}
