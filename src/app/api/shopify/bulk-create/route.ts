// import { NextRequest, NextResponse } from "next/server";

// /* ======================
//    CONFIG
// ====================== */
// const SHOP = process.env.SHOPIFY_STORE_DOMAIN!;
// const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
// const API_VERSION = "2024-07";
// const GRAPHQL_URL = `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`;

// /* ======================
//    TYPES
// ====================== */
// type IncomingProduct = {
//   title: string;
//   price: number;
//   compareAtPrice?: number;
//   images?: string[];
//   videos?: string[];
//   certificateUrl?: string | null;
// };

// /* ======================
//    HELPERS
// ====================== */

// // 🔹 Shopify GraphQL fetch
// async function shopifyGraphQL(query: string, variables?: any) {
//   const res = await fetch(GRAPHQL_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Shopify-Access-Token": TOKEN,
//     },
//     body: JSON.stringify({ query, variables }),
//   });

//   const json = await res.json();

//   if (!res.ok || json.errors) {
//     console.error("❌ Shopify GraphQL Error:", json);
//     throw new Error("Shopify GraphQL request failed");
//   }

//   return json.data;
// }

// // 🔹 Products → JSONL
// function buildJSONL(products: IncomingProduct[]) {
//   return products
//     .map((p) =>
//       JSON.stringify({
//         input: {
//           title: p.title,
//           vendor: "BrahmaGems",
//           productType: "Gemstones",

//           bodyHtml: `
//             <p><strong>${p.title}</strong></p>
//             ${
//               p.videos?.length
//                 ? `<p><strong>Videos:</strong></p><ul>${p.videos
//                     .map(
//                       (v) =>
//                         `<li><a href="${v}" target="_blank">${v}</a></li>`
//                     )
//                     .join("")}</ul>`
//                 : ""
//             }
//             ${
//               p.certificateUrl
//                 ? `<p><a href="${p.certificateUrl}" target="_blank">View Certificate</a></p>`
//                 : ""
//             }
//           `,

//           variants: [
//             {
//               price: String(p.price),
//               compareAtPrice: p.compareAtPrice
//                 ? String(p.compareAtPrice)
//                 : undefined,
//             },
//           ],

//           images: p.images?.map((src) => ({ src })) ?? [],
//         },
//       })
//     )
//     .join("\n");
// }

// /* ======================
//    ROUTE
// ====================== */
// export async function POST(req: NextRequest) {
//   try {
//     if (!SHOP || !TOKEN) {
//       return NextResponse.json(
//         { error: "Shopify credentials missing" },
//         { status: 500 }
//       );
//     }

//     const { products } = await req.json();

//     if (!Array.isArray(products) || products.length === 0) {
//       return NextResponse.json(
//         { error: "Products array required" },
//         { status: 400 }
//       );
//     }

//     /* ======================
//        1️⃣ Build JSONL
//     ====================== */
//     const jsonl = buildJSONL(products);

//     /* ======================
//        2️⃣ Get staged upload target
//     ====================== */
//     const stagedRes = await shopifyGraphQL(
//       `
//       mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
//         stagedUploadsCreate(input: $input) {
//           stagedTargets {
//             url
//             parameters {
//               name
//               value
//             }
//           }
//           userErrors {
//             message
//           }
//         }
//       }
//       `,
//       {
//         input: [
//           {
//             resource: "BULK_MUTATION_VARIABLES",
//             filename: "products.jsonl",
//             mimeType: "text/jsonl",
//             httpMethod: "POST",
//           },
//         ],
//       }
//     );

//     const stagedTarget =
//       stagedRes.stagedUploadsCreate.stagedTargets?.[0];

//     if (!stagedTarget) {
//       throw new Error("Failed to get staged upload target");
//     }

//     /* ======================
//        3️⃣ Upload JSONL file
//     ====================== */
//     const form = new FormData();

//     stagedTarget.parameters.forEach((p: any) => {
//       form.append(p.name, p.value);
//     });

//     form.append(
//       "file",
//       new Blob([jsonl], { type: "text/jsonl" })
//     );

//     const uploadRes = await fetch(stagedTarget.url, {
//       method: "POST",
//       body: form,
//     });

//     if (!uploadRes.ok) {
//       throw new Error("JSONL upload failed");
//     }

//     /* ======================
//        4️⃣ Extract stagedUploadPath (KEY)
//     ====================== */
//     const keyParam = stagedTarget.parameters.find(
//       (p: any) => p.name === "key"
//     );

//     if (!keyParam?.value) {
//       throw new Error("Upload key not found");
//     }

//     const stagedUploadPath = keyParam.value;

//     /* ======================
//        5️⃣ Run bulk mutation
//     ====================== */
//     const bulkRes = await shopifyGraphQL(
//       `
//       mutation bulkRun($path: String!) {
//         bulkOperationRunMutation(
//           mutation: """
//             mutation productCreate($input: ProductInput!) {
//               productCreate(input: $input) {
//                 product { id }
//                 userErrors { field message }
//               }
//             }
//           """,
//           stagedUploadPath: $path
//         ) {
//           bulkOperation {
//             id
//             status
//           }
//           userErrors {
//             message
//           }
//         }
//       }
//       `,
//       { path: stagedUploadPath }
//     );

//     const bulkResult = bulkRes.bulkOperationRunMutation;

//     if (bulkResult.userErrors?.length) {
//       console.error("❌ Bulk userErrors:", bulkResult.userErrors);
//       return NextResponse.json(
//         {
//           error: "Bulk mutation rejected",
//           userErrors: bulkResult.userErrors,
//         },
//         { status: 400 }
//       );
//     }

//     if (!bulkResult.bulkOperation) {
//       return NextResponse.json(
//         {
//           error: "Bulk operation not created",
//         },
//         { status: 500 }
//       );
//     }

//     /* ======================
//        SUCCESS
//     ====================== */
//     return NextResponse.json({
//       success: true,
//       bulkOperation: bulkResult.bulkOperation,
//     });
//   } catch (err: any) {
//     console.error("❌ Bulk create error:", err);
//     return NextResponse.json(
//       {
//         error: "Bulk create failed",
//         details: err.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";

// /* ======================
//    CONFIG
// ====================== */
// const SHOP = process.env.SHOPIFY_STORE_DOMAIN!;
// const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
// const API_VERSION = "2024-07";
// const GRAPHQL_URL = `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`;

// /* ======================
//    TYPES
// ====================== */
// type IncomingProduct = {
//   title: string;
//   price: number;
//   compareAtPrice?: number;
//   images?: string[];
//   videos?: string[];
//   certificateUrl?: string | null;
// };

// /* ======================
//    HELPERS
// ====================== */
// async function shopifyGraphQL(query: string, variables?: any) {
//   const res = await fetch(GRAPHQL_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Shopify-Access-Token": TOKEN,
//     },
//     body: JSON.stringify({ query, variables }),
//   });

//   const json = await res.json();

//   if (!res.ok || json.errors) {
//     console.error("❌ Shopify GraphQL Error:", json);
//     throw new Error(
//       json.errors?.[0]?.message || "Shopify GraphQL request failed"
//     );
//   }

//   return json.data;
// }

// /*
//   Build descriptionHtml from images / videos / certificate.
//   This is the only place media links live — ProductCreateInput
//   has no variants, no bodyHtml, no images field.
// */
// function buildDescriptionHtml(p: IncomingProduct): string {
//   const parts: string[] = [];

//   if (p.images && p.images.length) {
//     parts.push(
//       p.images
//         .map(
//           (src) =>
//             `<img src="${src}" alt="${p.title}" style="max-width:100%;">`
//         )
//         .join("")
//     );
//   }

//   if (p.videos && p.videos.length) {
//     parts.push(
//       `<p><strong>Videos:</strong></p><ul>${p.videos
//         .map((v) => `<li><a href="${v}" target="_blank">${v}</a></li>`)
//         .join("")}</ul>`
//     );
//   }

//   if (p.certificateUrl) {
//     parts.push(
//       `<p><a href="${p.certificateUrl}" target="_blank">View Certificate</a></p>`
//     );
//   }

//   return parts.join("");
// }

// /* ======================
//    ROUTE
//    ─────
//    Why not bulk?
//    Your store uses the NEW product model (ProductCreateInput).
//    ProductCreateInput does NOT have a "variants" field —
//    price can only be set AFTER the product exists, via
//    productVariantsBulkUpdate using the variant ID that
//    productCreate returns.
//    Bulk mode is async and doesn't return variant IDs until
//    you poll the result URL, making a two-pass bulk flow
//    unnecessarily complex for <100 products.

//    This sequential approach:
//      1. productCreate  → get product + variant ID
//      2. productVariantsBulkUpdate → set price on that variant
//    runs one product at a time, but each pair is ~200-400 ms
//    so 20 products finish in ~5-8 seconds total.
// ====================== */
// export async function POST(req: NextRequest) {
//   try {
//     if (!SHOP || !TOKEN) {
//       return NextResponse.json(
//         { error: "Shopify credentials missing" },
//         { status: 500 }
//       );
//     }

//     const { products } = await req.json();

//     if (!Array.isArray(products) || products.length === 0) {
//       return NextResponse.json(
//         { error: "Products array required" },
//         { status: 400 }
//       );
//     }

//     const created: { id: string; title: string; variantId: string }[] = [];
//     const errors: { title: string; error: string }[] = [];

//     for (const p of products as IncomingProduct[]) {
//       try {
//         /* ──────────────────────────────────────
//            STEP 1: productCreate
//            Argument: product (ProductCreateInput)
//            Fields available: title, vendor, productType, descriptionHtml
//            NOT available: variants, bodyHtml, images
//         ────────────────────────────────────── */
//         const descriptionHtml = buildDescriptionHtml(p);

//         const createRes = await shopifyGraphQL(
//           `
//           mutation productCreate($product: ProductCreateInput!) {
//             productCreate(product: $product) {
//               product {
//                 id
//                 title
//                 variants(first: 1) {
//                   nodes {
//                     id
//                   }
//                 }
//               }
//               userErrors {
//                 field
//                 message
//               }
//             }
//           }
//           `,
//           {
//             product: {
//               title: p.title,
//               vendor: "BrahmaGems",
//               productType: "Gemstones",
//               ...(descriptionHtml ? { descriptionHtml } : {}),
//             },
//           }
//         );

//         const payload = createRes.productCreate;

//         if (payload.userErrors?.length) {
//           console.error(`❌ productCreate userErrors for "${p.title}":`, payload.userErrors);
//           errors.push({ title: p.title, error: payload.userErrors[0].message });
//           continue; // skip to next product
//         }

//         const productId = payload.product.id;
//         const variantId = payload.product.variants.nodes[0]?.id;

//         if (!variantId) {
//           errors.push({ title: p.title, error: "No variant returned" });
//           continue;
//         }

//         console.log(`✅ Created "${p.title}" → product: ${productId}, variant: ${variantId}`);

//         /* ──────────────────────────────────────
//            STEP 2: set price on the default variant
//            productVariantsBulkUpdate works even for a single variant.
//         ────────────────────────────────────── */
//         const variantInput: Record<string, any> = {
//           id: variantId,
//           price: String(p.price),
//         };

//         if (p.compareAtPrice != null && !isNaN(p.compareAtPrice)) {
//           variantInput.compareAtPrice = String(p.compareAtPrice);
//         }

//         const priceRes = await shopifyGraphQL(
//           `
//           mutation productVariantsBulkUpdate($variants: [ProductVariantInput!]!) {
//             productVariantsBulkUpdate(variants: $variants) {
//               productVariants {
//                 id
//                 price
//                 compareAtPrice
//               }
//               userErrors {
//                 field
//                 message
//               }
//             }
//           }
//           `,
//           { variants: [variantInput] }
//         );

//         if (priceRes.productVariantsBulkUpdate.userErrors?.length) {
//           console.error(`⚠️ Price update error for "${p.title}":`, priceRes.productVariantsBulkUpdate.userErrors);
//           // Product was created, price just didn't stick — log but don't treat as full failure
//           errors.push({
//             title: p.title,
//             error: `Product created but price failed: ${priceRes.productVariantsBulkUpdate.userErrors[0].message}`,
//           });
//         } else {
//           console.log(`💰 Price set for "${p.title}": ₹${p.price}`);
//         }

//         created.push({ id: productId, title: p.title, variantId });
//       } catch (err: any) {
//         console.error(`❌ Error processing "${p.title}":`, err);
//         errors.push({ title: p.title, error: err.message });
//       }
//     }

//     /* ======================
//        RESPONSE
//     ====================== */
//     return NextResponse.json({
//       success: true,
//       created,
//       errors,
//       summary: {
//         total: products.length,
//         succeeded: created.length,
//         failed: errors.length,
//       },
//     });
//   } catch (err: any) {
//     console.error("❌ Bulk create error:", err);
//     return NextResponse.json(
//       {
//         error: "Bulk create failed",
//         details: err.message,
//       },
//       { status: 500 }
//     );
//   }
// }



import { NextRequest, NextResponse } from "next/server";

/* ======================
   CONFIG
====================== */
const SHOP = process.env.SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
const API_VERSION = "2024-07";
const GRAPHQL_URL = `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`;

/* ======================
   TYPES
====================== */
type IncomingProduct = {
  title: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  certificateImage?: string;
  videos?: string[];
};

/* ======================
   SHOPIFY GRAPHQL
====================== */
async function shopifyGraphQL(query: string, variables?: any) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    console.error("❌ Shopify Error:", json);
    throw new Error(json.errors?.[0]?.message || "Shopify request failed");
  }

  return json.data;
}

/* ======================
   ROUTE
====================== */
export async function POST(req: NextRequest) {
  try {
    const { products } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Products array required" },
        { status: 400 }
      );
    }

    const created: any[] = [];
    const errors: any[] = [];

    for (const p of products as IncomingProduct[]) {
      try {
        if (!p.title || isNaN(p.price)) {
          throw new Error("Invalid title or price");
        }

        /* ======================
           STEP 1: CREATE PRODUCT
        ====================== */
        const createRes = await shopifyGraphQL(
          `
          mutation productCreate($product: ProductCreateInput!) {
            productCreate(product: $product) {
              product {
                id
                variants(first: 1) {
                  nodes {
                    id
                  }
                }
              }
              userErrors {
                message
              }
            }
          }
          `,
          {
            product: {
              title: p.title,
              vendor: "BrahmaGems",
              productType: "Gemstones",
            },
          }
        );

        const payload = createRes.productCreate;

        if (payload.userErrors?.length) {
          throw new Error(payload.userErrors[0].message);
        }

        const productId = payload.product.id;
        const variantId = payload.product.variants.nodes[0]?.id;

        if (!variantId) throw new Error("Variant not created");

        /* ======================
           STEP 2: BUILD MEDIA ARRAY
        ====================== */
        const media: any[] = [];

        // Product images
        p.images?.forEach((src) => {
          media.push({
            mediaContentType: "IMAGE",
            originalSource: src,
          });
        });

        // Certificate image
        if (p.certificateImage) {
          media.push({
            mediaContentType: "IMAGE",
            originalSource: p.certificateImage,
          });
        }

        // Videos
        p.videos?.forEach((videoUrl) => {
          media.push({
            mediaContentType: "VIDEO",
            originalSource: videoUrl,
          });
        });

        /* ======================
           STEP 3: ADD MEDIA
        ====================== */
        if (media.length) {
          const mediaRes = await shopifyGraphQL(
            `
            mutation productCreateMedia(
              $productId: ID!
              $media: [CreateMediaInput!]!
            ) {
              productCreateMedia(productId: $productId, media: $media) {
                media {
                  ... on MediaImage { id }
                  ... on Video { id }
                }
                mediaUserErrors {
                  message
                }
              }
            }
            `,
            { productId, media }
          );

          if (mediaRes.productCreateMedia.mediaUserErrors?.length) {
            console.warn(
              `⚠️ Media issue for ${p.title}`,
              mediaRes.productCreateMedia.mediaUserErrors
            );
          }
        }

        /* ======================
           STEP 4: SET PRICE
        ====================== */
       const priceRes = await shopifyGraphQL(
  `
  mutation productVariantUpdate($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      productVariant {
        id
        price
        compareAtPrice
      }
      userErrors {
        field
        message
      }
    }
  }
  `,
  {
    input: {
      id: variantId,
      price: Number(p.price).toFixed(2),
      ...(p.compareAtPrice
        ? { compareAtPrice: Number(p.compareAtPrice).toFixed(2) }
        : {}),
    },
  }
);

if (priceRes.productVariantUpdate.userErrors?.length) {
  throw new Error(
    priceRes.productVariantUpdate.userErrors[0].message
  );
}


        created.push({ productId, variantId, title: p.title });
        console.log(`✅ ${p.title} done`);
      } catch (err: any) {
        errors.push({ title: p.title, error: err.message });
        console.error(`❌ ${p.title}`, err.message);
      }
    }

    return NextResponse.json({
      success: true,
      created,
      errors,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Bulk create failed", details: err.message },
      { status: 500 }
    );
  }
}
