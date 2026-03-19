import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(candidates)
  } catch (error) {
    console.error('GET /api/candidates error:', error)
    return NextResponse.json({ error: 'Error al obtener candidatos.' }, { status: 500 })
  }
}
