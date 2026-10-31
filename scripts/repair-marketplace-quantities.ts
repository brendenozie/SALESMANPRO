import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script: repair-marketplace-quantities.ts
 * Resolves:
 *   Invalid `prisma.marketplaceListings.findMany()` invocation:
 *   Inconsistent column data: Failed to convert '{ "high": :num, "low": :num, "unsigned": false }' to 'Int' for the field 'quantity'.
 *
 * Cause:
 *   External or legacy driver writes saved `quantity` as a BSON 64-bit Long (type 18).
 *   Prisma expects a 32-bit `Int` in schema.prisma (`quantity Int @default(1)`).
 *
 * Fix:
 *   Converts any Long / 64-bit int values to standard 32-bit ints via MongoDB aggregation update ($toInt).
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing in environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db();
  const collection = db.collection("marketplaceListings");

  const longDocsCount = await collection.countDocuments({
    quantity: { $type: "long" },
  });
  console.log(`Found ${longDocsCount} marketplace listing document(s) with BSON Long quantity.`);

  if (longDocsCount > 0) {
    const res = await collection.updateMany(
      { quantity: { $type: "long" } },
      [{ $set: { quantity: { $toInt: "$quantity" } } }]
    );
    console.log(`Successfully repaired: ${res.modifiedCount} document(s).`);
  } else {
    console.log("No malformed BSON Long quantities found.");
  }

  await client.close();
}

main().catch((err) => {
  console.error("Error repairing marketplace quantities:", err);
  process.exit(1);
});

