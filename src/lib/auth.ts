import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'admin_auth'
const VOTER_COOKIE = 'voter_code'

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'admin123'
}

export function hashAdminToken(password: string): string {
  return createHash('sha256').update(password + ':awards-admin-salt').digest('hex')
}

export function isValidAdminToken(token: string): boolean {
  return token === hashAdminToken(getAdminPassword())
}

export function getAdminCookie(): string | undefined {
  const cookieStore = cookies()
  return cookieStore.get(ADMIN_COOKIE)?.value
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminCookie()
  return !!token && isValidAdminToken(token)
}

export function getVoterCode(): string | undefined {
  const cookieStore = cookies()
  return cookieStore.get(VOTER_COOKIE)?.value
}

export function isAdminAuthenticatedFromRequest(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  return !!token && isValidAdminToken(token)
}
