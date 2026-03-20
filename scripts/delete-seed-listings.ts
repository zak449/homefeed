import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Count seed listings before deletion
  const seedCount = await prisma.listing.count({
    where: { source: "seed" },
  });
  console.log(`Found ${seedCount} seed listings to delete.`);

  if (seedCount === 0) {
    console.log("Nothing to delete.");
    return;
  }

  // Delete all seed listings (comments, reactions, subscriptions cascade)
  const result = await prisma.listing.deleteMany({
    where: { source: "seed" },
  });

  console.log(`Deleted ${result.count} seed listings (with cascaded comments, reactions, and subscriptions).`);

  // Verify remaining listings
  const remaining = await prisma.listing.count();
  console.log(`Remaining listings in database: ${remaining}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
