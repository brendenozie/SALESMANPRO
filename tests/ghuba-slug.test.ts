import { encodeListingId, decodeListingId, slugifyTitle, getListingPublicUrl, extractListingId } from "../lib/ghuba-slug";

function testGhubaSlug() {
  console.log("Running Ghuba Slug & Security Token Tests...");

  const testIds = [
    "664a38f123456789abcdef01",
    "507f1f77bcf86cd799439011",
    "000000000000000000000000",
    "ffffffffffffffffffffffff",
  ];

  for (const id of testIds) {
    const token = encodeListingId(id);
    console.log(`ID: ${id} -> Token: ${token} (length: ${token.length})`);
    if (!token || token === id) {
      throw new Error(`Token encoding failed for ${id}`);
    }

    const decoded = decodeListingId(token);
    if (decoded !== id) {
      throw new Error(`Decoded ID mismatch: expected ${id}, got ${decoded}`);
    }
  }

  // Test URL generation and extraction
  const listing = {
    id: "664a38f123456789abcdef01",
    name: "Apple iPhone 15 Pro Max 256GB - Blue Titanium (5G)",
  };

  const url = getListingPublicUrl(listing);
  console.log(`Generated URL: ${url}`);
  if (!url.startsWith("/ghuba/productlist/apple-iphone-15-pro-max-256gb-blue-titanium-5g--")) {
    throw new Error(`URL slug mismatch: got ${url}`);
  }

  const param = url.replace("/ghuba/productlist/", "");
  const extracted = extractListingId(param);
  console.log(`Extracted ID from slug: ${extracted}`);
  if (extracted !== listing.id) {
    throw new Error(`Extraction failed: expected ${listing.id}, got ${extracted}`);
  }

  // Test backward compatibility with raw 24-hex ObjectId
  const rawExtracted = extractListingId("664a38f123456789abcdef01");
  if (rawExtracted !== "664a38f123456789abcdef01") {
    throw new Error(`Raw ID backward compatibility failed`);
  }

  // Test backward compatibility with slug-rawId
  const slugRawExtracted = extractListingId("toyota-prado-664a38f123456789abcdef01");
  if (slugRawExtracted !== "664a38f123456789abcdef01") {
    throw new Error(`slug-rawId extraction failed: got ${slugRawExtracted}`);
  }

  // Test invalid token
  const invalidDecoded = decodeListingId("tamperedToken12345");
  if (invalidDecoded !== null) {
    throw new Error(`Tampered token should decode to null`);
  }

  console.log("All Ghuba Slug tests PASSED successfully!");
}

testGhubaSlug();
