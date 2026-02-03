


import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      price,
      compareAtPrice,
      images = [],
      videos = [],
      certificateUrl,
    } = await req.json();

    // Validation
    if (!title || !price) {
      return NextResponse.json(
        { error: "title and price are required" },
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

    /* ---------- BUILD DESCRIPTION ---------- */
    let bodyHtml = `<p><strong>${title}</strong></p>`;

    if (videos.length > 0) {
      bodyHtml += `<p><strong>Videos:</strong></p><ul>`;
      videos.forEach((videoUrl: string) => {
        bodyHtml += `<li><a href="${videoUrl}" target="_blank" rel="noopener">${videoUrl}</a></li>`;
      });
      bodyHtml += `</ul>`;
    }

    if (certificateUrl) {
      bodyHtml += `<p><strong>Certificate:</strong> <a href="${certificateUrl}" target="_blank" rel="noopener">View Certificate</a></p>`;
    }

    /* ---------- SHOPIFY BODY ---------- */
    const shopifyBody = {
      product: {
        title,
        vendor: "BrahmaGems",
        product_type: "Gemstones",
        body_html: bodyHtml,
        status: "active",

        variants: [
          {
            price: String(price),
            compare_at_price: compareAtPrice ? String(compareAtPrice) : null,
            inventory_management: "shopify",
            inventory_quantity: 1000,
            inventory_policy: "deny",
          },
        ],

        images: images.map((src: string) => ({
          src,
          alt: title,
        })),
      },
    };

    const res = await fetch(`https://${SHOP}/admin/api/2024-07/products.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": TOKEN,
      },
      body: JSON.stringify(shopifyBody),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Shopify create error:", data);
      return NextResponse.json(
        { error: data.errors || "Product creation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      productId: data.product.id,
      product: data.product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}