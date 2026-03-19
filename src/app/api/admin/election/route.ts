import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticatedFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const election = await prisma.election.findFirst({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ isOpen: election?.isOpen ?? false, id: election?.id ?? null })
  } catch (error) {
    console.error('GET /api/admin/election error:', error)
    return NextResponse.json({ error: 'Error al obtener estado de la elección.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { isOpen } = body

    if (typeof isOpen !== 'boolean') {
      return NextResponse.json({ error: 'El campo isOpen debe ser booleano.' }, { status: 400 })
    }

    const existing = await prisma.election.findFirst({ orderBy: { createdAt: 'desc' } })

    let election
    if (existing) {
      election = await prisma.election.update({
        where: { id: existing.id },
        data: { isOpen },
      })
    } else {
      election = await prisma.election.create({ data: { isOpen } })
    }

    return NextResponse.json({ isOpen: election.isOpen, id: election.id })
  } catch (error) {
    console.error('POST /api/admin/election error:', error)
    return NextResponse.json({ error: 'Error al actualizar estado de la elección.' }, { status: 500 })
  }
}
