import ClientMarketplacePage from "./ClientMarketplacePage";

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";


// export type MarketplaceProduct = {
//   _id: string;
//   sellerId: string;
//   sellerType: string;
//   productId: string;
//   title: string;
//   description: string;
//   quantity: number;
//   createdAt: string;
//   updatedAt: string;
//   salesPrice: number;
//   discount: number;
//   isOnOffer: boolean;
//   isFlashDeal: boolean;
//   isNewArrival: boolean;
//   isDiscounted: boolean;
//   isFeatured: boolean;
//   buyingPrice: number;
//   sellingPrice: number;
// };

// export async function getMarketplaceProducts(clientId: string): Promise<MarketplaceProduct[]> {
//   try {
//     const response = await fetch(`${apiBaserUrl}/clients/my-market-place?sellerId=${clientId}`, {
//       cache: "no-store",
//     });

//     if (!response.ok) throw new Error("Failed to fetch marketplace products");

//     const data = await response.json();
//     return Array.isArray(data.products) ? data.products : [];
//   } catch (error) {
//     console.error("❌ Error fetching marketplace products:", error);
//     return [];
//   }
// }


export default async function MarketplacePageWrapper() {
  const clientId = "63f7c9e2d91b1b2a5e80b007"; // example client
  
  // const productsData = await getMarketplaceProducts(clientId);

  return <ClientMarketplacePage productsData={[]} />;
}
