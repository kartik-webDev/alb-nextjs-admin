import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";

  const xsrfToken = process.env.BRAHMAGEMS_XSRF_TOKEN;
  const session = process.env.BRAHMAGEMS_SESSION;

  if (!xsrfToken || !session) {
    return NextResponse.json(
      { error: "BrahmaGems headers missing in env" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.brahmagems.com/gemstones/products?page=${page}`,
      {
        headers: {
          Cookie: `XSRF-TOKEN=${xsrfToken}; brahma_gems_session=${session}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`BrahmaGems API failed: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      products: data?.data?.products ?? [],
      total_pages: data?.data?.total_pages ?? 0,
      current_page: data?.data?.current_page ?? Number(page),
    });
  } catch (error) {
    console.error("Error fetching BrahmaGems products:", error);
    return NextResponse.json(
      { error: "Failed to fetch BrahmaGems products" },
      { status: 500 }
    );
  }
}


// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   const xsrfToken = process.env.BRAHMAGEMS_XSRF_TOKEN;
//   const session = process.env.BRAHMAGEMS_SESSION;

//   if (!xsrfToken || !session) {
//     return NextResponse.json(
//       { error: "BrahmaGems headers missing in env" },
//       { status: 500 }
//     );
//   }

//   try {
//     let currentPage = 1;
//     let totalPages = 1;
//     const allProducts: any[] = [];

//     while (currentPage <= totalPages) {
//       const response = await fetch(
//         `https://api.brahmagems.com/gemstones/products?page=${currentPage}`,
//         {
//           headers: {
//             Cookie: `XSRF-TOKEN=${xsrfToken}; brahma_gems_session=${session}`,
//             Accept: "application/json",
//           },
//           cache: "no-store",
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`BrahmaGems API failed at page ${currentPage}`);
//       }

//       const data = await response.json();

//       const products = data?.data?.products ?? [];
//       totalPages = data?.data?.total_pages ?? 1;

//       allProducts.push(...products);
//       currentPage++;
//     }

//     return NextResponse.json({
//       count: allProducts.length,
//       products: allProducts,
//     });
//   } catch (error) {
//     console.error("Error fetching BrahmaGems products:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch BrahmaGems products" },
//       { status: 500 }
//     );
//   }
// }
