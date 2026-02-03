// import { NextResponse } from "next/server";

// function normalizeTitle(title: any) {
//   if (!title || typeof title !== "string") return "";
//   return title.trim().toLowerCase();
// }

// function parsePrice(price: string | null) {
//   if (!price) return 0;
//   return Number(price.replace(/[^\d]/g, ""));
// }

// export async function GET() {
//   try {
//     const [shopifyRes, brahmaRes] = await Promise.all([
//       fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/shopify/products/by-vendor?vendor=BrahmaGems`),
//       fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/brahmagems`),
//     ]);

//     const shopifyData = await shopifyRes.json();
//     const brahmaData = await brahmaRes.json();

//     const shopifyMap = new Map<string, any>();
//     (shopifyData.products ?? []).forEach((p: any) => {
//       const key = normalizeTitle(p.title);
//       if (key) shopifyMap.set(key, p);
//     });

//     const products = (brahmaData.products ?? []).map((p: any) => {
//       const title = p.product_name;
//       const key = normalizeTitle(title);
//       const shopifyMatch = shopifyMap.get(key);

//    return {
//   id: String(p.product_id),
//   title,
//   basePrice: parsePrice(p.price),
//   sellingPrice: parsePrice(p.price),

//   shopifyPrice: shopifyMatch?.variants?.[0]?.price
//     ? Number(shopifyMatch.variants[0].price)
//     : null,
//   images: p.image_url ? [p.image_url] : [],   // ✅ ARRAY
//   videos: p.video_url ? [p.video_url] : [],   // ✅ ARRAY
//   certificateUrl: p.certificate_url ?? null,

//   status: shopifyMatch ? "EXISTS" : "NEW",
//   shopifyProductId: shopifyMatch?.id ?? null,
// };

//     });

//     return NextResponse.json({ products });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: "Compare failed" }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";


/* ======================
   UTILITIES
====================== */
function normalizeTitle(title: any): string {
  if (!title || typeof title !== "string") return "";
  return title.trim().toLowerCase();
}

function parsePrice(price: string | number | null | undefined): number {
  if (!price) return 0;
  if (typeof price === "number") return price;
  
  // Handle "Rs. 238240" format from Brahma Gems
  const cleaned = String(price)
    .replace(/Rs\.?/gi, "")
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/* ======================
   MAIN HANDLER
====================== */
export async function GET() {
  try {
    console.log("🔍 Starting compare-data fetch...");
    
    // Fetch both APIs in parallel
    const [shopifyRes, brahmaRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/shopify/products/by-vendor?vendor=BrahmaGems`,
        { cache: "no-store" }
      ),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/brahmagems`, {
        cache: "no-store",
      }),
    ]);

    if (!shopifyRes.ok || !brahmaRes.ok) {
      console.error("❌ API fetch failed:", {
        shopify: shopifyRes.status,
        brahma: brahmaRes.status,
      });
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    const shopifyData = await shopifyRes.json();
    const brahmaData = await brahmaRes.json();

    console.log("📦 Shopify products:", shopifyData.products?.length ?? 0);
    console.log("📦 Brahma products:", brahmaData.products?.length ?? 0);

    // Build Shopify lookup map
    // Your API returns: { title, price, productId, variantId }
    const shopifyMap = new Map<string, any>();
    (shopifyData.products ?? []).forEach((product: any) => {
      const key = normalizeTitle(product.title);
      if (key) {
        shopifyMap.set(key, product);
        console.log(`📝 Shopify: "${product.title}" → ₹${product.price}`);
      }
    });

    console.log(`✅ Shopify map size: ${shopifyMap.size}`);

    // Map and compare products
    const products = (brahmaData.products ?? []).map((brahmaProduct: any) => {
      const title = brahmaProduct.product_name;
      const key = normalizeTitle(title);
      const shopifyMatch = shopifyMap.get(key);

      // 🔥 FIX: Your Shopify API returns price directly, not in variants!
      let shopifyPrice: number | null = null;
      if (shopifyMatch && shopifyMatch.price !== undefined) {
        shopifyPrice = typeof shopifyMatch.price === 'number' 
          ? shopifyMatch.price 
          : parseFloat(String(shopifyMatch.price));
        
        // Validate
        if (isNaN(shopifyPrice) || shopifyPrice <= 0) {
          shopifyPrice = null;
        }
        
        console.log(`💰 ${title}: Shopify price = ₹${shopifyPrice}`);
      }

      // Parse prices from Brahma Gems
      const basePrice = parsePrice(brahmaProduct.price);

      return {
        id: String(brahmaProduct.product_id),
        title,
        basePrice,
        sellingPrice: basePrice,
        shopifyPrice, // ✅ Now correctly extracted from your API
        images: brahmaProduct.image_url ? [brahmaProduct.image_url] : [],
        videos: brahmaProduct.video_url ? [brahmaProduct.video_url] : [],
        certificateUrl: brahmaProduct.certificate_url ?? null,
        status: shopifyMatch ? ("EXISTS" as const) : ("NEW" as const),
        shopifyProductId: shopifyMatch?.productId ?? null, // Using productId from your API
      };
    });

    const stats = {
      total: products.length,
      new: products.filter((p) => p.status === "NEW").length,
      existing: products.filter((p) => p.status === "EXISTS").length,
      withShopifyPrice: products.filter(p => p.shopifyPrice !== null && p.shopifyPrice > 0).length,
    };

    console.log("\n✅ Products mapped:", stats.total);
    console.log("🆕 New:", stats.new);
    console.log("♻️ Existing:", stats.existing);
    console.log("💰 With Shopify prices:", stats.withShopifyPrice);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("❌ Compare data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}