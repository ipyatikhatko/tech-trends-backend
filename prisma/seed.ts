/// <reference types="node" />

import { PrismaClient } from '@prisma/client'
import { technologies } from '../src/constants'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('Start seeding...')

  for (const tech of technologies) {
    await prisma.technology.upsert({
      where: { name: tech.name },
      update: {},
      create: tech,
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
