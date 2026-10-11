
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const text = (v: unknown) => String(v ?? '').trim();

const feeValue = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return 0;

  const fee = Number(v);

  return Number.isFinite(fee) && fee >= 0 ? fee : null;
};

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(branches);
  } catch {
    return NextResponse.json(
      { error: 'Unable to load branches.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const name = text(b.name);
    const masterId = text(b.masterId) || null;
    const defaultFee = feeValue(b.defaultFee);

    if (!name) {
      return NextResponse.json(
        { error: 'Branch name is required.' },
        { status: 400 }
      );
    }

    if (defaultFee === null) {
      return NextResponse.json(
        { error: 'Default fee must be a valid non-negative amount.' },
        { status: 400 }
      );
    }

    if (masterId) {
      const master = await prisma.master.findFirst({
        where: { id: masterId, active: true },
      });

      if (!master) {
        return NextResponse.json(
          { error: 'Selected master does not exist or is inactive.' },
          { status: 400 }
        );
      }
    }

    const item = await prisma.branch.create({
      data: {
        name,
        masterId,
        location: text(b.location),
        shift: text(b.shift),
        defaultFee,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    if (e?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid master reference.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to create branch.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const b = await req.json();
    const id = text(b.id);
    const name = text(b.name);
    const masterId = text(b.masterId) || null;
    const defaultFee = feeValue(b.defaultFee);

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Branch id and name are required.' },
        { status: 400 }
      );
    }

    if (defaultFee === null) {
      return NextResponse.json(
        { error: 'Default fee must be a valid non-negative amount.' },
        { status: 400 }
      );
    }

    if (masterId) {
      const master = await prisma.master.findFirst({
        where: { id: masterId, active: true },
      });

      if (!master) {
        return NextResponse.json(
          { error: 'Selected master does not exist or is inactive.' },
          { status: 400 }
        );
      }
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        name,
        masterId,
        location: text(b.location),
        shift: text(b.shift),
        defaultFee,
      },
    });

    return NextResponse.json(branch);
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Branch not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to update branch.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Branch id is required.' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.branch.update({
        where: { id },
        data: { active: false },
      });

      await tx.student.updateMany({
        where: { branchId: id },
        data: { branchId: null },
      });

      await tx.attendance.updateMany({
        where: { branchId: id },
        data: { branchId: null },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Branch not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to delete branch.' },
      { status: 500 }
    );
  }
}
