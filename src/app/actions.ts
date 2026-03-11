'use server';

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

function calculateDistance(a: Float32Array, b: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}

function mapUser(dbUser: any) {
    if (!dbUser) return null;
    return {
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        createdDate: dbUser.createdAt.toISOString(),
        hasBiometric: dbUser.hasBiometric,
        authType: dbUser.authType,
        trainingProgress: {
            currentModule: 0,
            completedModules: JSON.parse(dbUser.completedModules || '[]'),
            moduleScores: JSON.parse(dbUser.moduleScores || '{}'),
            totalPoints: dbUser.totalPoints,
            level: dbUser.level,
            badges: JSON.parse(dbUser.badges || '[]'),
            completed: dbUser.completed,
        },
        signatureData: dbUser.signature || undefined,
        certificateDate: dbUser.createdAt.toISOString(),
    };
}

export async function createUserAction(data: any) {
    try {
        const udata = {
            username: data.username,
            email: data.email,
            password: Buffer.from(data.password).toString('base64'),
            role: data.role || 'user',
        };
        const dbUser = await prisma.user.create({ data: udata });
        return { success: true, user: mapUser(dbUser) };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function loginCredentialAction(usernameOrEmail: string, pass: string) {
    const dbUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: usernameOrEmail },
                { username: usernameOrEmail }
            ]
        }
    });
    if (!dbUser || dbUser.password !== Buffer.from(pass).toString('base64')) {
        return { success: false, error: 'Usuario o contraseña incorrectos' };
    }
    return { success: true, user: mapUser(dbUser) };
}

export async function loginBiometricAction(faceDescriptorArray: number[]) {
    const desc = new Float32Array(faceDescriptorArray);
    const users = await prisma.user.findMany({ where: { hasBiometric: true, faceDescriptor: { not: null } } });
    for (const u of users) {
        if (!u.faceDescriptor) continue;
        const storedDesc = new Float32Array(JSON.parse(u.faceDescriptor));
        if (calculateDistance(desc, storedDesc) < 0.6) {
            return { success: true, user: mapUser(u) };
        }
    }
    return { success: false, error: 'Rostro no reconocido' };
}

export async function loginWebAuthnAction(credentialId: string) {
    const dbUser = await prisma.user.findFirst({ where: { webAuthnId: credentialId } });
    if (dbUser) return { success: true, user: mapUser(dbUser) };
    return { success: false, error: 'Dispositivo no reconocido' };
}

export async function updateUserAction(id: string, data: any) {
    try {
        const dbUser = await prisma.user.update({
            where: { id },
            data
        });
        return { success: true, user: mapUser(dbUser) };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getUserAction(id: string) {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id } });
        return { success: true, user: mapUser(dbUser) };
    } catch {
        return { success: false, user: null };
    }
}

export async function getAllUsersAction() {
    const dbUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return dbUsers.map(u => mapUser(u));
}

export async function deleteUserAction(id: string) {
    try {
        await prisma.user.delete({ where: { id } });
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
