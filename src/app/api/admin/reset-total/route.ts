import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticatedFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    // Delete all votes
    const deletedVotes = await prisma.vote.deleteMany()

    // Delete all vote codes
    const deletedCodes = await prisma.voteCode.deleteMany()

    // Close the election if it exists
    const existing = await prisma.election.findFirst({ orderBy: { createdAt: 'desc' } })
    if (existing) {
      await prisma.election.update({
        where: { id: existing.id },
        data: { isOpen: false },
      })
    }

    return NextResponse.json({
      deletedVotes: deletedVotes.count,
      deletedCodes: deletedCodes.count,
    })
  } catch (error) {
    console.error('POST /api/admin/reset-total error:', error)
    return NextResponse.json({ error: 'Error al ejecutar el reset total.' }, { status: 500 })
  }
}
