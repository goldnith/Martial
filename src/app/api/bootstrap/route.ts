import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [masters, branches, students, attendance, payments, disciplines, awards] = await Promise.all([
      prisma.master.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } }),
      prisma.branch.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } }),
      prisma.student.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } }),
      prisma.attendance.findMany({ orderBy: { date: 'desc' }, take: 5000, select: { id: true, studentId: true, date: true, present: true } }),
      prisma.feePayment.findMany({ orderBy: { paymentDate: 'desc' }, take: 5000, select: { id: true, studentId: true, amount: true, paymentDate: true, feeMonth: true, feeYear: true, paymentMethod: true, note: true } }),
      prisma.discipline.findMany({ where: { active: true }, include: { belts: { where: { active: true }, orderBy: { sortOrder: 'asc' } } }, orderBy: { createdAt: 'asc' } }),
      prisma.studentBelt.findMany({ orderBy: { awardedAt: 'desc' }, select: { id: true, studentId: true, beltLevelId: true, awardedAt: true, location: true, note: true } }),
    ]);
    return NextResponse.json({ masters, branches, students, attendance, payments, disciplines, awards });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database is not configured or unavailable.' }, { status: 503 });
  }
}
