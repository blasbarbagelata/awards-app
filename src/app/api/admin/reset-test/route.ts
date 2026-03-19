import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticatedFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    // Find all test vote codes
    const testCodes = await prisma.voteCode.findMany({
      where: { isTest: true },
      select: { id: true },
    })

    const testCodeIds = testCodes.map((c) => c.id)

    // Delete all votes from test codes
    const deletedVotes = await prisma.vote.deleteMany({
      where: { voteCodeId: { in: testCodeIds } },
    })

    // Reset usedAt for all test codes
    const resetResult = await prisma.voteCode.updateMany({
      where: { isTest: true },
      data: { usedAt: null },
    })

    return NextResponse.json({
      deletedVotes: deletedVotes.count,
      resetCodes: resetResult.count,
    })
  } catch (error) {
    console.error('POST /api/admin/reset-test error:', error)
    return NextResponse.json({ error: 'Error al resetear votos de prueba.' }, { status: 500 })
  }
}
