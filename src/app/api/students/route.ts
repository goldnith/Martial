
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const text = (v: unknown) => String(v ?? '').trim();

const dateOnly = (v: unknown): Date | null => {
  const value = text(v);
  if (!value) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? date
    : null;
};

function data(b: any) {
  const feeInput = b.customFee;
  let customFee: number | null = null;

  if (
    feeInput !== null &&
    feeInput !== undefined &&
    feeInput !== ''
  ) {
    customFee = Number(feeInput);

    if (!Number.isFinite(customFee) || customFee < 0) {
      throw new Error('INVALID_FEE');
    }
  }

  const dobInput = text(b.dob);
  const dob = dobInput ? dateOnly(dobInput) : null;

  if (dobInput && !dob) {
    throw new Error('INVALID_DOB');
  }

  return {
    name: text(b.name),
    dob,
    school: text(b.school),
    standard: text(b.standard),
    address: text(b.address),
    fatherName: text(b.fatherName),
    aadharNumber: text(b.aadharNumber),
    parentNumber: text(b.parentNumber),
    customFee,
    masterId: text(b.masterId) || null,
    branchId: text(b.branchId) || null,
  };
}

async function validate(
  masterId: string | null,
  branchId: string | null
) {
  if (
    masterId &&
    !await prisma.master.findFirst({
      where: { id: masterId, active: true },
    })
  ) {
    return 'Selected master does not exist.';
  }

  if (branchId) {
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, active: true },
    });

    if (!branch) return 'Selected branch does not exist.';

    if (branch.masterId !== masterId) {
      return 'Selected branch does not belong to the selected master.';
    }
  }

  return null;
}

function validationError(e: any) {
  if (e?.message === 'INVALID_FEE') {
    return NextResponse.json(
      { error: 'Custom fee must be a valid non-negative amount.' },
      { status: 400 }
    );
  }

  if (e?.message === 'INVALID_DOB') {
    return NextResponse.json(
      { error: 'Date of birth must be a valid date in YYYY-MM-DD format.' },
      { status: 400 }
    );
  }

  return null;
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(students);
  } catch {
    return NextResponse.json(
      { error: 'Unable to load students.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const id = text(b.id).toUpperCase();
    const d = data(b);

    if (!id || !d.name) {
      return NextResponse.json(
        { error: 'Student ID and Name are required.' },
        { status: 400 }
      );
    }

    const conflict = await validate(d.masterId, d.branchId);

    if (conflict) {
      return NextResponse.json({ error: conflict }, { status: 400 });
    }

    const item = await prisma.student.create({
      data: { ...d, id },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    const invalid = validationError(e);
    if (invalid) return invalid;

    if (e?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Student ID already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to create student.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const b = await req.json();
    const id = text(b.id).toUpperCase();
    const d = data(b);

    if (!id || !d.name) {
      return NextResponse.json(
        { error: 'Student ID and Name are required.' },
        { status: 400 }
      );
    }

    const conflict = await validate(d.masterId, d.branchId);

    if (conflict) {
      return NextResponse.json({ error: conflict }, { status: 400 });
    }

    const item = await prisma.student.update({
      where: { id },
      data: d,
    });

    return NextResponse.json(item);
  } catch (e: any) {
    const invalid = validationError(e);
    if (invalid) return invalid;

    if (e?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Student ID already exists.' },
        { status: 409 }
      );
    }

    if (e?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Student not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to update student.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const id = text(new URL(req.url).searchParams.get('id'))
      .toUpperCase();

    if (!id) {
      return NextResponse.json(
        { error: 'Student id is required.' },
        { status: 400 }
      );
    }

    await prisma.student.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Student not found.' },
        { status: 404 }
      );
    }

    if (e?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Student has related records and cannot be deleted.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to delete student.' },
      { status: 500 }
    );
  }
}
