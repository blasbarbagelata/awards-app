import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const voterCode = request.cookies.get('voter_code')?.value

    if (!voterCode) {
      return NextResponse.json({ valid: false, code: null, isTest: false })
    }

    const voteCode = await prisma.voteCode.findFirst({
      where: { code: voterCode },
    })

    if (!voteCode) {
      return NextResponse.json({ valid: false, code: null, isTest: false })
    }

    if (voteCode.usedAt !== null) {
      return NextResponse.json({ valid: false, code: voterCode, isTest: voteCode.isTest })
    }

    return NextResponse.json({ valid: true, code: voterCode, isTest: voteCode.isTest })
  } catch (error) {
    console.error('GET /api/vote-code/session error:', error)
    return NextResponse.json({ valid: false, code: null, isTest: false })
  }
}
