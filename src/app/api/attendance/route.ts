
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const dateOnly = (v: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;

  const d = new Date(`${v}T00:00:00.000Z`);

  if (
    isNaN(d.getTime()) ||
    d.toISOString().slice(0, 10) !== v
  ) {
    return null;
  }

  return d;
};

const todayIST = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams;
    const date = q.get('date');

    if (date && !dateOnly(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const rows = await prisma.attendance.findMany({
      where: date
        ? { date: dateOnly(date)! }
        : undefined,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { error: 'Unable to load attendance.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();

    const studentId = String(b.studentId || '').trim();
    const date = String(b.date || '');
    const present = b.present;

    const d = dateOnly(date);

    if (!studentId || !d || typeof present !== 'boolean') {
      return NextResponse.json(
        { error: 'Student, valid date, and attendance status are required.' },
        { status: 400 }
      );
    }

    if (date !== todayIST()) {
      return NextResponse.json(
        {
          error:
            'Attendance for previous or future dates is locked. Only today can be edited.',
        },
        { status: 403 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, active: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found.' },
        { status: 404 }
      );
    }

    const item = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: d,
        },
      },
      create: {
        studentId,
        branchId: student.branchId,
        date: d,
        present,
      },
      update: {
        branchId: student.branchId,
        present,
      },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { error: 'Unable to save attendance.' },
      { status: 500 }
    );
  }
}

