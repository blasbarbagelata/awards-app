import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function generateCode(): string {
  return randomBytes(3).toString('hex').toUpperCase()
}

async function generateUniqueCode(existingCodes: Set<string>): Promise<string> {
  let code = generateCode()
  while (existingCodes.has(code)) {
    code = generateCode()
  }
  existingCodes.add(code)
  return code
}

async function main() {
  console.log('🌱 Sembrando la base de datos...')

  // Clean up existing data
  await prisma.vote.deleteMany()
  await prisma.voteCode.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.category.deleteMany()
  await prisma.election.deleteMany()

  // Create Election
  const election = await prisma.election.create({
    data: { isOpen: false },
  })
  console.log(`✅ Elección creada: ${election.id}`)

  // Create Categories
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'El más gaga',
        description: 'Ese que siempre está en las nubes y no se entera de nada',
        type: 'normal',
        order: 1,
      },
      {
        name: 'El más exagerado',
        description: 'Todo se convierte en un drama de telenovela',
        type: 'normal',
        order: 2,
      },
      {
        name: 'El más pollera',
        description: 'Incapaz de decir que no a absolutamente nada',
        type: 'normal',
        order: 3,
      },
      {
        name: 'El más gracioso',
        description: 'El que siempre tiene el chiste justo en el momento exacto',
        type: 'normal',
        order: 4,
      },
      {
        name: 'El más tarde',
        description: 'Tiene un huso horario completamente propio',
        type: 'normal',
        order: 5,
      },
    ],
  })
  console.log(`✅ ${categories.count} categorías creadas`)

  // Create Candidates
  const candidates = await prisma.candidate.createMany({
    data: [
      { name: 'Ana García' },
      { name: 'Carlos Rodríguez' },
      { name: 'María López' },
      { name: 'Pedro Martínez' },
      { name: 'Laura Sánchez' },
      { name: 'Diego Fernández' },
      { name: 'Sofia Torres' },
      { name: 'Javier Morales' },
      { name: 'Valentina Ruiz' },
      { name: 'Mateo Herrera' },
    ],
  })
  console.log(`✅ ${candidates.count} candidatos creados`)

  // Check existing codes in DB
  const existingCodesInDB = await prisma.voteCode.findMany({ select: { code: true } })
  const existingCodesSet = new Set(existingCodesInDB.map((c) => c.code))

  // Generate 5 real codes
  const realCodes = []
  for (let i = 1; i <= 5; i++) {
    const code = await generateUniqueCode(existingCodesSet)
    realCodes.push({
      code,
      label: `Votante ${i}`,
      isTest: false,
    })
  }

  await prisma.voteCode.createMany({ data: realCodes })
  console.log(`✅ 5 códigos reales creados: ${realCodes.map((c) => c.code).join(', ')}`)

  // Generate 3 test codes
  const testCodes = [
    { code: 'TEST01', label: 'Test A', isTest: true },
    { code: 'TEST02', label: 'Test B', isTest: true },
    { code: 'TEST03', label: 'Test C', isTest: true },
  ]

  await prisma.voteCode.createMany({ data: testCodes })
  console.log(`✅ 3 códigos de prueba creados: TEST01, TEST02, TEST03`)

  console.log('\n🎉 Base de datos sembrada exitosamente!')
  console.log('\nCódigos de prueba disponibles:')
  console.log('  TEST01 (Test A)')
  console.log('  TEST02 (Test B)')
  console.log('  TEST03 (Test C)')
  console.log('\nCódigos reales generados:')
  realCodes.forEach((c) => console.log(`  ${c.code} (${c.label})`))
}

main()
  .catch((e) => {
    console.error('Error al sembrar:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
