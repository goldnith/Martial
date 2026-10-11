
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const text = (v: unknown) => String(v ?? '').trim();

const sortOrderValue = (v: unknown) => {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(v);
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
};

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const disciplineId = text(b.disciplineId);
    const name = text(b.name);
    const sortOrder = sortOrderValue(b.sortOrder);

    if (!disciplineId || !name) {
      return NextResponse.json(
        { error: 'Discipline and belt name are required.' },
        { status: 400 }
      );
    }

    if (sortOrder === null) {
      return NextResponse.json(
        { error: 'Sort order must be a non-negative integer.' },
        { status: 400 }
      );
    }

    const discipline = await prisma.discipline.findFirst({
      where: { id: disciplineId, active: true },
    });

    if (!discipline) {
      return NextResponse.json(
        { error: 'Active discipline not found.' },
        { status: 404 }
      );
    }

    const belt = await prisma.beltLevel.create({
      data: { disciplineId, name, sortOrder },
    });

    return NextResponse.json(belt, { status: 201 });
  } catch (e: any) {
    if (e?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid discipline reference.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to create belt.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const b = await req.json();
    const id = text(b.id);
    const name = text(b.name);
    const sortOrder = sortOrderValue(b.sortOrder);

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Belt id and name are required.' },
        { status: 400 }
      );
    }

    if (sortOrder === null) {
      return NextResponse.json(
        { error: 'Sort order must be a non-negative integer.' },
        { status: 400 }
      );
    }

    const belt = await prisma.beltLevel.update({
      where: { id },
      data: { name, sortOrder },
    });

    return NextResponse.json(belt);
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Belt not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to update belt.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Belt id is required.' },
        { status: 400 }
      );
    }

    await prisma.beltLevel.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Belt not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to delete belt.' },
      { status: 500 }
    );
  }
}
