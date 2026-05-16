import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productId, sku } = await req.json();

    // Validation
    if (!productId || !sku) {
      return NextResponse.json(
        { error: "productId and sku are required" },
        { status: 400 }
      );
    }

    const SHOP = process.env.SHOPIFY_STORE_DOMAIN;
    const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

    if (!SHOP || !TOKEN) {
      return NextResponse.json(
        { error: "Shopify credentials missing" },
        { status: 500 }
      );
    }

    console.log(`🏷️ Updating SKU to: ${sku}`);

    // Extract numeric ID
    const numericId = productId.includes("/")
      ? productId.split("/").pop()
      : productId;

    // Get current product
    const getRes = await fetch(
      `https://${SHOP}/admin/api/2024-07/products/${numericId}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": TOKEN,
        },
      }
    );

    if (!getRes.ok) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const currentProduct = await getRes.json();

    const variantId =
      currentProduct.product?.variants?.[0]?.id;

    if (!variantId) {
      return NextResponse.json(
        { error: "No variant found" },
        { status: 404 }
      );
    }

    // Update SKU only
    const updateRes = await fetch(
      `https://${SHOP}/admin/api/2024-07/variants/${variantId}.json`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": TOKEN,
        },

        body: JSON.stringify({
          variant: {
            id: variantId,
            sku: String(sku),
          },
        }),
      }
    );

    const data = await updateRes.json();

    if (!updateRes.ok) {
      console.error(
        "Shopify SKU update error:",
        data
      );

      return NextResponse.json(
        {
          error:
            data.errors ||
            "Update failed",
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ SKU updated for product ${numericId}: ${sku}`
    );

    return NextResponse.json({
      success: true,
      variant: data.variant,
      sku,
    });
  } catch (error) {
    console.error(
      "Update SKU error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      { status: 500 }
    );
  }
}