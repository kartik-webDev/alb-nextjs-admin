// // scripts/update-shopify-vendor.ts
// import "dotenv/config";
// const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
// const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;

// async function shopifyFetch(query: string, variables = {}) {
//   const response = await fetch(
//     `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
//       },
//       body: JSON.stringify({
//         query,
//         variables,
//       }),
//     }
//   );

//   return response.json();
// }

// async function updateVendorNames() {
//   let hasNextPage = true;
//   let cursor: string | null = null;

//   let updatedCount = 0;

//   while (hasNextPage) {
//     const data = await shopifyFetch(
//       `
//       query ($cursor: String) {
//         products(
//           first: 250,
//           after: $cursor,
//           query: "vendor:BrahmaGems"
//         ) {
//           edges {
//             cursor

//             node {
//               id
//               title
//               vendor
//             }
//           }

//           pageInfo {
//             hasNextPage
//           }
//         }
//       }
//       `,
//       { cursor }
//     );

//     const products = data?.data?.products?.edges || [];

//     console.log(
//       `Fetched ${products.length} products to update...`
//     );

//     for (const productEdge of products) {
//       const product = productEdge.node;

//       console.log(
//         `Updating Vendor → ${product.title}`
//       );

//       const updateResponse = await shopifyFetch(
//         `
//         mutation productUpdate($input: ProductInput!) {
//           productUpdate(input: $input) {
//             product {
//               id
//               vendor
//             }

//             userErrors {
//               field
//               message
//             }
//           }
//         }
//         `,
//         {
//           input: {
//             id: product.id,
//             vendor: "Brahmagems",
//           },
//         }
//       );

//       const errors =
//         updateResponse?.data?.productUpdate?.userErrors;

//       if (errors?.length > 0) {
//         console.log(
//           `Failed: ${product.title}`,
//           errors
//         );
//       } else {
//         updatedCount++;

//         console.log(
//           `Updated (${updatedCount}) → ${product.title}`
//         );
//       }

//       // Prevent Shopify rate limits
//       await new Promise((resolve) =>
//         setTimeout(resolve, 150)
//       );
//     }

//     hasNextPage =
//       data?.data?.products?.pageInfo?.hasNextPage || false;

//     cursor =
//       products.length > 0
//         ? products[products.length - 1].cursor
//         : null;
//   }

//   console.log("\nDONE");
//   console.log(`Total Updated: ${updatedCount}`);
// }

// updateVendorNames().catch(console.error);


import "dotenv/config";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;

async function shopifyFetch(query: string, variables = {}) {
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    }
  );

  return response.json();
}

async function run() {
  // STEP 1 → FETCH ONLY 5 PRODUCTS
  const data = await shopifyFetch(`
    {
      products(
        first: 5,
        query: "vendor:BrahmaGems"
      ) {
        edges {
          node {
            id
            title
            vendor
          }
        }
      }
    }
  `);

  const products =
    data?.data?.products?.edges || [];

  console.log("\nFETCHED PRODUCTS:\n");

  for (const productEdge of products) {
    const product = productEdge.node;

    console.log({
      id: product.id,
      title: product.title,
      vendor: product.vendor,
    });
  }

  console.log("\nUPDATING PRODUCTS...\n");

  // STEP 2 → UPDATE THOSE 5 PRODUCTS
  for (const productEdge of products) {
    const product = productEdge.node;

    const updateResult = await shopifyFetch(
      `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            vendor
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
          id: product.id,
          vendor: "Brahmagems",
        },
      }
    );

    const errors =
      updateResult?.data?.productUpdate?.userErrors;

    if (errors?.length > 0) {
      console.log(
        `FAILED → ${product.title}`
      );

      console.log(errors);

      continue;
    }

    console.log(
      `SUCCESS → ${product.title}`
    );
  }

  console.log("\nDONE");
}

run().catch(console.error);