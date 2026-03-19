import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código requerido.' }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()

    const voteCode = await prisma.voteCode.findFirst({
      where: { code: normalizedCode },
    })

    if (!voteCode) {
      return NextResponse.json({ error: 'Código inválido. Verifica que lo hayas ingresado correctamente.' }, { status: 404 })
    }

    if (voteCode.usedAt !== null) {
      return NextResponse.json({ error: 'Este código ya fue utilizado. Cada código solo puede usarse una vez.' }, { status: 403 })
    }

    // Check election is open
    const election = await prisma.election.findFirst({ orderBy: { createdAt: 'desc' } })
    if (!election || !election.isOpen) {
      return NextResponse.json({ error: 'La votación no está abierta en este momento.' }, { status: 403 })
    }

    const response = NextResponse.json({ valid: true, isTest: voteCode.isTest })

    response.cookies.set('voter_code', normalizedCode, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('POST /api/vote-code error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
