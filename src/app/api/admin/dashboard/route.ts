import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticatedFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const election = await prisma.election.findFirst({ orderBy: { createdAt: 'desc' } })

    const [totalCodes, usedCodes, testTotal, testUsed] = await Promise.all([
      prisma.voteCode.count(),
      prisma.voteCode.count({ where: { usedAt: { not: null } } }),
      prisma.voteCode.count({ where: { isTest: true } }),
      prisma.voteCode.count({ where: { isTest: true, usedAt: { not: null } } }),
    ])

    const totalSubmissions = await prisma.vote
      .groupBy({
        by: ['voteCodeId'],
      })
      .then((groups) => groups.length)

    return NextResponse.json({
      electionOpen: election?.isOpen ?? false,
      totalCodes,
      usedCodes,
      pendingCodes: totalCodes - usedCodes,
      testTotal,
      testUsed,
      totalSubmissions,
    })
  } catch (error) {
    console.error('GET /api/admin/dashboard error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
