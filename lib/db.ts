import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

// On Vercel serverless environment, copy sqlite db to /tmp for read/write access
if (process.env.VERCEL === "1") {
  const tmpDb = "/tmp/dev.db";
  if (!fs.existsSync(tmpDb)) {
    const seedDb = path.join(process.cwd(), "prisma", "seed.db");
    const devDb = path.join(process.cwd(), "prisma", "dev.db");
    const source = fs.existsSync(seedDb) ? seedDb : devDb;
    if (fs.existsSync(source)) {
      try {
        fs.copyFileSync(source, tmpDb);
      } catch (e) {
        console.warn("Could not copy sqlite db to /tmp:", e);
      }
    }
  }
  process.env.DATABASE_URL = "file:/tmp/dev.db";
}

export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export default prisma;
