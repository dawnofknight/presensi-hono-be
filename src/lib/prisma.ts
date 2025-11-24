import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Create PrismaClient for serverless environment
const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const prisma = globalThis.prisma || prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// Clean up connection for serverless
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
