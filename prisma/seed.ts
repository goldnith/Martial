import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.studentBelt.deleteMany();
  await prisma.beltLevel.deleteMany();
  await prisma.discipline.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.master.deleteMany();

  const m1 = await prisma.master.create({ data: { name: "Master 1" } });
  const m2 = await prisma.master.create({ data: { name: "Master 2" } });

  const b1 = await prisma.branch.create({ data: { masterId: m1.id, name: "Anna Nagar Branch", location: "Anna Nagar, Chennai", shift: "Mon / Wed / Fri · 6:00–7:30 PM", defaultFee: 1000 } });
  const b2 = await prisma.branch.create({ data: { masterId: m1.id, name: "Ambattur Branch", location: "Ambattur, Chennai", shift: "Tue / Thu / Sat · 6:00–7:30 PM", defaultFee: 900 } });
  const b3 = await prisma.branch.create({ data: { masterId: m2.id, name: "Avadi Branch", location: "Avadi, Chennai", shift: "Mon / Wed / Fri · 7:00–8:30 PM", defaultFee: 1000 } });
  const b4 = await prisma.branch.create({ data: { masterId: m2.id, name: "Poonamallee Branch", location: "Poonamallee, Chennai", shift: "Tue / Thu / Sat · 7:00–8:30 PM", defaultFee: 850 } });

  const students = [
    { id: "STU001", name: "Arun Kumar", dob: "2012-05-14", school: "ABC Matric School", standard: "8th", address: "Anna Nagar, Chennai", fatherName: "Kumar", aadharNumber: "000000001234", parentNumber: "9876543210", masterId: m1.id, branchId: b1.id, customFee: null },
    { id: "STU002", name: "Priya S", dob: "2011-08-22", school: "DAV School", standard: "9th", address: "Anna Nagar, Chennai", fatherName: "Suresh", aadharNumber: "000000005678", parentNumber: "9876501234", masterId: m1.id, branchId: b1.id, customFee: 750 },
    { id: "STU003", name: "Karthik R", dob: "2013-01-10", school: "Velammal School", standard: "7th", address: "Ambattur, Chennai", fatherName: "Ravi", aadharNumber: "000000009012", parentNumber: "9876512345", masterId: m1.id, branchId: b2.id, customFee: 1200 },
    { id: "STU004", name: "Mohan P", dob: "2012-11-02", school: "St. John's", standard: "8th", address: "Avadi, Chennai", fatherName: "Prakash", aadharNumber: "000000003456", parentNumber: "9876523456", masterId: m2.id, branchId: b3.id, customFee: null },
  ];

  for (const s of students) {
    await prisma.student.create({ data: { ...s, dob: new Date(s.dob) } });
  }

  const silambam = await prisma.discipline.create({ data: { name: "Silambam" } });
  const karate = await prisma.discipline.create({ data: { name: "Karate" } });
  const silambamBelts = ["Beginner", "Yellow Belt", "Orange Belt", "Green Belt", "Blue Belt", "Brown Belt", "Black Belt"];
  const karateBelts = ["White Belt", "Yellow Belt", "Orange Belt", "Green Belt", "Blue Belt", "Purple Belt", "Brown Belt", "Black Belt"];
  for (const [i, name] of silambamBelts.entries()) await prisma.beltLevel.create({ data: { disciplineId: silambam.id, name, sortOrder: i + 1 } });
  for (const [i, name] of karateBelts.entries()) await prisma.beltLevel.create({ data: { disciplineId: karate.id, name, sortOrder: i + 1 } });

  await prisma.feePayment.createMany({ data: [
    { studentId: "STU001", amount: 500, feeMonth: 10, feeYear: 2026, paymentMethod: "Cash" },
    { studentId: "STU002", amount: 750, feeMonth: 10, feeYear: 2026, paymentMethod: "UPI" },
  ] });

  await prisma.attendance.createMany({ data: [
    { studentId: "STU001", branchId: b1.id, date: new Date("2026-10-08T00:00:00.000Z"), present: true },
    { studentId: "STU002", branchId: b1.id, date: new Date("2026-10-08T00:00:00.000Z"), present: true },
    { studentId: "STU003", branchId: b2.id, date: new Date("2026-10-08T00:00:00.000Z"), present: false },
    { studentId: "STU004", branchId: b3.id, date: new Date("2026-10-08T00:00:00.000Z"), present: true },
  ] });

  const karateBlack = await prisma.beltLevel.findFirst({ where: { disciplineId: karate.id, name: "Black Belt" } });
  const karateWhite = await prisma.beltLevel.findFirst({ where: { disciplineId: karate.id, name: "White Belt" } });
  if (karateWhite) await prisma.studentBelt.create({ data: { studentId: "STU001", beltLevelId: karateWhite.id, awardedAt: new Date("2025-06-15T00:00:00.000Z"), location: "Anna Nagar Dojo", note: "Foundation grading" } });
  if (karateBlack) { /* kept unawarded as an example */ }

  console.log("MartialTrack database seeded.");
}

main().finally(() => prisma.$disconnect());
