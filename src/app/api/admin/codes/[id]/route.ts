import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticatedFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticatedFromRequest(request)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const code = await prisma.voteCode.findUnique({ where: { id: params.id } })

    if (!code) {
      return NextResponse.json({ error: 'Código no encontrado.' }, { status: 404 })
    }

    if (code.usedAt !== null) {
      return NextResponse.json({ error: 'No se puede eliminar un código ya utilizado.' }, { status: 400 })
    }

    await prisma.voteCode.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/codes/[id] error:', error)
    return NextResponse.json({ error: 'Error al eliminar código.' }, { status: 500 })
  }
}
