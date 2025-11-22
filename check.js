// test.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ connected");

    // change `resource` to one of your model names from schema.prisma
    const rows = await prisma.resource.findMany({ take: 3 });
    console.log("rows:", rows);
  } catch (e) {
    console.error("RUNTIME ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
