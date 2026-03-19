import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    })

    const results = await Promise.all(
      categories.map(async (category) => {
        // Aggregate points per candidate for this category
        const voteAggregates = await prisma.vote.groupBy({
          by: ['candidateId'],
          where: { categoryId: category.id },
          _sum: { points: true },
          orderBy: { _sum: { points: 'desc' } },
        })

        // Get candidate info
        const candidateIds = voteAggregates.map((v) => v.candidateId)
        const candidates = await prisma.candidate.findMany({
          where: { id: { in: candidateIds } },
          select: { id: true, name: true },
        })

        const candidateMap = new Map(candidates.map((c) => [c.id, c]))

        const rankings = voteAggregates
          .map((agg, index) => {
            const candidate = candidateMap.get(agg.candidateId)
            if (!candidate) return null
            return {
              candidate: { id: candidate.id, name: candidate.name },
              points: agg._sum.points ?? 0,
              position: index + 1,
            }
          })
          .filter(Boolean) as { candidate: { id: string; name: string }; points: number; position: number }[]

        // Detect tie for first place
        const hasTie =
          rankings.length >= 2 && rankings[0].points === rankings[1].points && rankings[0].points > 0

        return {
          category: {
            id: category.id,
            name: category.name,
            description: category.description,
          },
          rankings,
          hasTie,
        }
      })
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('GET /api/results error:', error)
    return NextResponse.json({ error: 'Error al obtener resultados.' }, { status: 500 })
  }
}
