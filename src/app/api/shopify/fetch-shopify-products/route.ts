import { NextResponse } from "next/server";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;

type ShopifyVariant = {
  node: {
    sku: string;
    price: string;
  };
};

type ShopifyProduct = {
  cursor: string;
  node: {
    title: string;
    vendor: string;
    status: string;
    variants: {
      edges: ShopifyVariant[];
    };
  };
};

type ShopifyResponse = {
  data: {
    products: {
      edges: ShopifyProduct[];
      pageInfo: {
        hasNextPage: boolean;
      };
    };
  };
};

async function fetchAllProducts() {
  let hasNextPage = true;
  let cursor: string | null = null;

  const allProducts: ShopifyProduct[] = [];

  while (hasNextPage) {
    const response: Response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          query: `
            query ($cursor: String) {
              products(
                first: 250,
                after: $cursor,
                query: "vendor:BrahmaGems OR vendor:Brahmagems"
              ) {
                edges {
                  cursor

                  node {
                    title
                    vendor
                    status

                    variants(first: 50) {
                      edges {
                        node {
                          sku
                          price
                        }
                      }
                    }
                  }
                }

                pageInfo {
                  hasNextPage
                }
              }
            }
          `,
          variables: {
            cursor,
          },
        }),
      }
    );

    const data: ShopifyResponse = await response.json();

    const products: ShopifyProduct[] =
      data?.data?.products?.edges || [];

    allProducts.push(...products);

    hasNextPage =
      data?.data?.products?.pageInfo?.hasNextPage || false;

    cursor =
      products.length > 0
        ? products[products.length - 1].cursor
        : null;
  }

  return allProducts.flatMap((productEdge) => {
    const product = productEdge.node;

    return product.variants.edges.map((variantEdge) => ({
      product_name: product.title,
      sku: variantEdge.node.sku,
      price: variantEdge.node.price,
      status: product.status,
      vendor: product.vendor,
    }));
  });
}

export async function GET() {
  try {
    const products = await fetchAllProducts();

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}