import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(users);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const user = await prisma.user.create({ data });
        return NextResponse.json(user, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(user);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 400 });
    }
}
