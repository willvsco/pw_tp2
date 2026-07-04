import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

export async function getAllMajors() {
    let majors = await prisma.major.findMany({ orderBy: { name: "asc" } });
    if (majors.length === 0) {
        const defaultMajors = [
            "Ciência da Computação",
            "Engenharia de Software",
            "Sistemas de Informação",
            "Engenharia da Computação",
            "Design de Software"
        ];
        for (const name of defaultMajors) {
            await prisma.major.create({ data: { name } });
        }
        majors = await prisma.major.findMany({ orderBy: { name: "asc" } });
    }
    return majors;
}

export async function getMajorById(id: number) {
    return prisma.major.findUnique({ where: { id } });
}

export async function createMajor(name: string) {
    return prisma.major.create({ data: { name } });
}

export async function updateMajor(id: number, name: string) {
    return prisma.major.update({ where: { id }, data: { name } });
}

export async function deleteMajor(id: number) {
    return prisma.major.delete({ where: { id } });
}
