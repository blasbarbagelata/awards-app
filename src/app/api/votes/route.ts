import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface VoteEntry {
  categoryId: string
  firstId: string
  secondId: string
  thirdId: string
}

export async function POST(request: NextRequest) {
  try {
    const voterCode = request.cookies.get('voter_code')?.value

    if (!voterCode) {
      return NextResponse.json({ error: 'Sesión inválida. Por favor ingresa tu código nuevamente.' }, { status: 401 })
    }

    const voteCode = await prisma.voteCode.findFirst({
      where: { code: voterCode },
    })

    if (!voteCode) {
      return NextResponse.json({ error: 'Código de acceso no encontrado.' }, { status: 401 })
    }

    if (voteCode.usedAt !== null) {
      return NextResponse.json({ error: 'Este código ya fue utilizado.' }, { status: 403 })
    }

    // Check election is open
    const election = await prisma.election.findFirst({ orderBy: { createdAt: 'desc' } })
    if (!election || !election.isOpen) {
      return NextResponse.json({ error: 'La votación está cerrada.' }, { status: 403 })
    }

    const body = await request.json()
    const { votes } = body as { votes: VoteEntry[] }

    if (!votes || !Array.isArray(votes)) {
      return NextResponse.json({ error: 'Datos de voto inválidos.' }, { status: 400 })
    }

    // Validate each vote entry
    for (const vote of votes) {
      if (!vote.categoryId || !vote.firstId || !vote.secondId || !vote.thirdId) {
        return NextResponse.json({ error: 'Todos los campos de voto son requeridos.' }, { status: 400 })
      }

      // No duplicate candidates per category
      const ids = [vote.firstId, vote.secondId, vote.thirdId]
      const uniqueIds = new Set(ids)
      if (uniqueIds.size !== 3) {
        return NextResponse.json({ error: 'No puedes seleccionar el mismo candidato en más de un lugar para la misma categoría.' }, { status: 400 })
      }
    }

    // Validate all categories are covered
    const allCategories = await prisma.category.findMany({ select: { id: true } })
    const votedCategoryIds = new Set(votes.map((v) => v.categoryId))
    for (const cat of allCategories) {
      if (!votedCategoryIds.has(cat.id)) {
        return NextResponse.json({ error: 'Debes votar en todas las categorías.' }, { status: 400 })
      }
    }

    // Process in transaction
    await prisma.$transaction(async (tx) => {
      for (const vote of votes) {
        const entries = [
          { candidateId: vote.firstId, position: 1, points: 3 },
          { candidateId: vote.secondId, position: 2, points: 2 },
          { candidateId: vote.thirdId, position: 3, points: 1 },
        ]

        for (const entry of entries) {
          await tx.vote.create({
            data: {
              voteCodeId: voteCode.id,
              categoryId: vote.categoryId,
              candidateId: entry.candidateId,
              position: entry.position,
              points: entry.points,
            },
          })
        }
      }

      // Mark vote code as used
      await tx.voteCode.update({
        where: { id: voteCode.id },
        data: { usedAt: new Date() },
      })
    })

    const response = NextResponse.json({ success: true })

    // Clear voter cookie
    response.cookies.set('voter_code', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('POST /api/votes error:', error)
    return NextResponse.json({ error: 'Error al registrar los votos. Inténtalo de nuevo.' }, { status: 500 })
  }
}
