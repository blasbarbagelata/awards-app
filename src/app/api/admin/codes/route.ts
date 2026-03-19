import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticatedFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

function generateRandomCode(): string {
  return randomBytes(3).toString('hex').toUpperCase()
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const codes = await prisma.voteCode.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(codes)
  } catch (error) {
    console.error('GET /api/admin/codes error:', error)
    return NextResponse.json({ error: 'Error al obtener códigos.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { count = 1, isTest = false, labelPrefix = 'Votante' } = body

    if (count < 1 || count > 100) {
      return NextResponse.json({ error: 'La cantidad debe estar entre 1 y 100.' }, { status: 400 })
    }

    // Get all existing codes to ensure uniqueness
    const existingCodes = await prisma.voteCode.findMany({ select: { code: true } })
    const existingSet = new Set(existingCodes.map((c) => c.code))

    // Get the current count of codes with this prefix to generate labels
    const existingWithPrefix = await prisma.voteCode.count({
      where: { label: { startsWith: labelPrefix } },
    })

    const newCodes: { code: string; label: string; isTest: boolean }[] = []

    for (let i = 0; i < count; i++) {
      let code = generateRandomCode()
      let attempts = 0
      while (existingSet.has(code) && attempts < 100) {
        code = generateRandomCode()
        attempts++
      }

      if (existingSet.has(code)) {
        return NextResponse.json({ error: 'No se pudo generar un código único. Inténtalo de nuevo.' }, { status: 500 })
      }

      existingSet.add(code)
      newCodes.push({
        code,
        label: `${labelPrefix} ${existingWithPrefix + i + 1}`,
        isTest,
      })
    }

    await prisma.voteCode.createMany({ data: newCodes })

    const created = await prisma.voteCode.findMany({
      where: { code: { in: newCodes.map((c) => c.code) } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ codes: created }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/codes error:', error)
    return NextResponse.json({ error: 'Error al generar códigos.' }, { status: 500 })
  }
}
