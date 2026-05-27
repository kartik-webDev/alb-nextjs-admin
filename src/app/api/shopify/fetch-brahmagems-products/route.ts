// src/app/api/fetch-brahmagems-products/route.ts

import { NextResponse } from "next/server";

async function fetchProductsInBatches() {
  const TOTAL_PAGES = 132;
  const BATCH_SIZE = 15;

  const allProducts: any[] = [];

  for (
    let startPage = 1;
    startPage <= TOTAL_PAGES;
    startPage += BATCH_SIZE
  ) {
    const endPage = Math.min(
      startPage + BATCH_SIZE - 1,
      TOTAL_PAGES
    );

    console.log(
      `Fetching pages ${startPage} → ${endPage}`
    );

    const requests = [];

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      requests.push(
        fetch(
          `https://api.brahmagems.com/gemstones/products?page=${page}`,
          {
            cache: "no-store",
          }
        ).then((res) => res.json())
      );
    }

    const responses = await Promise.all(requests);

    for (const response of responses) {
      const products =
        response?.data?.products || [];

      allProducts.push(...products);
    }
  }

  return allProducts;
}

export async function GET() {
  try {
    const products =
      await fetchProductsInBatches();

    return NextResponse.json({
      success: true,
      total_products: products.length,
      products,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}