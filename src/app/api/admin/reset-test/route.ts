import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticatedFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    // Borrar todos los votos
    const deletedVotes = await prisma.vote.deleteMany({})

    // Borrar todos los códigos
    const deletedCodes = await prisma.voteCode.deleteMany({})

    // Cerrar la votación
    await prisma.election.updateMany({
      data: { isOpen: false },
    })

    return NextResponse.json({
      deletedVotes: deletedVotes.count,
      deletedCodes: deletedCodes.count,
    })
  } catch (error) {
    console.error('POST /api/admin/reset-test error:', error)
    return NextResponse.json({ error: 'Error al resetear.' }, { status: 500 })
  }
}