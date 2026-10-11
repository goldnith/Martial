import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() { return NextResponse.json(await prisma.master.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } })); }
export async function POST(req: Request) {
  try { const body = await req.json(); const name = String(body.name ?? '').trim(); if (!name) return NextResponse.json({ error:'Master name is required.' }, {status:400}); const item=await prisma.master.create({data:{name}}); return NextResponse.json(item,{status:201}); }
  catch { return NextResponse.json({error:'Unable to create master.'},{status:500}); }
}
export async function PATCH(req: Request) {
  try { const body=await req.json(); const id=String(body.id||''); const name=String(body.name||'').trim(); if(!id||!name)return NextResponse.json({error:'Master id and name are required.'},{status:400}); return NextResponse.json(await prisma.master.update({where:{id},data:{name}})); }
  catch { return NextResponse.json({error:'Unable to update master.'},{status:500}); }
}
export async function DELETE(req: Request) {
  try { const id=new URL(req.url).searchParams.get('id'); if(!id)return NextResponse.json({error:'Master id is required.'},{status:400}); await prisma.master.update({where:{id},data:{active:false}}); await prisma.branch.updateMany({where:{masterId:id},data:{masterId:null}}); await prisma.student.updateMany({where:{masterId:id},data:{masterId:null}}); return NextResponse.json({ok:true}); }
  catch { return NextResponse.json({error:'Unable to delete master.'},{status:500}); }
}
