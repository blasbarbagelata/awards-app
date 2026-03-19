import { NextRequest, NextResponse } from 'next/server'
import { getAdminPassword, hashAdminToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Contraseña requerida.' }, { status: 400 })
    }

    if (password !== getAdminPassword()) {
      return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 })
    }

    const token = hashAdminToken(password)
    const response = NextResponse.json({ success: true })

    response.cookies.set('admin_auth', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('POST /api/admin/login error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
