import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, env } from 'prisma/config'

const backendEnv = readFileSync(fileURLToPath(new URL('./backend/.env', import.meta.url)), 'utf8')
const databaseUrl = backendEnv.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim().replace(/^"|"$/g, '')
if (databaseUrl) process.env.DATABASE_URL = databaseUrl

export default defineConfig({
  schema: 'backend/prisma/schema.prisma',
  migrations: {
    path: 'backend/prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
