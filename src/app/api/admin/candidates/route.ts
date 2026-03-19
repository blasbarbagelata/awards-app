import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticatedFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(candidates)
  } catch (error) {
    console.error('GET /api/admin/candidates error:', error)
    return NextResponse.json({ error: 'Error al obtener candidatos.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Nombre es requerido.' }, { status: 400 })
    }

    const candidate = await prisma.candidate.create({
      data: { name: name.trim() },
    })

    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/candidates error:', error)
    return NextResponse.json({ error: 'Error al crear candidato.' }, { status: 500 })
  }
}
