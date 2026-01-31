// src/app/layout/sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "@/assets/images/logo/logo.png";
import LogoSmall from "@/assets/images/logo/logo-small.png";
import { RouteName } from "@/lib/route"; // Fallback routes
import SidebarMenu from "@/components/features/SidebarMenu";
import { getIconComponent } from "@/lib/iconMapper"; // Helper to map icon names

interface Route {
  _id?: string;
  name?: string;
  path?: string;
  icon: string;
  subRoutes?: Route[];
  order?: number;
}

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar = ({ isSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [useFallback, setUseFallback] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const response = await fetch('/api/admin/sidebar', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.useFallback) {
            setUseFallback(true);
            setRoutes(RouteName); // Use hardcoded fallback
          } else {
            setUseFallback(false);
            setRoutes(data.routes);
          }
        } else {
          setUseFallback(true);
          setRoutes(RouteName);
        }
      } catch (error) {
        console.error('Failed to fetch sidebar:', error);
        setUseFallback(true);
        setRoutes(RouteName);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebar();
  }, []);

if (loading) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Spinning Red Circle */}
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-500"></div>
          {/* Optional Loading Text */}
          <p className="mt-4 text-sm text-gray-600 font-medium">Loading sidebar...</p>
        </div>
      </div>
    );
  }
  const displayRoutes = useFallback ? RouteName : routes;

  return (
    <>
      <style jsx global>{`
        .sidebar-scrollbar::-webkit-scrollbar {
          width: 0;
        }
      `}</style>

      <div className="bg-white text-black h-screen overflow-y-auto pb-5 sidebar-scrollbar">
        {isSidebarOpen ? (
          <div className="flex items-center justify-center pt-5 px-4 bg-white">
            <Image 
              src={Logo}
              alt="Logo" 
              width={120} 
              height={40} 
              style={{ height: 40, width: "auto" }} 
            />
          </div>
        ) : (
          <div className="flex justify-center items-center pt-5">
            <Image 
              src={LogoSmall}
              alt="Logo" 
              width={30} 
              height={15} 
              style={{ height: 15, width: "auto" }} 
            />
          </div>
        )}

        <section className="pt-[15px] pl-2.5 pr-0 pb-0 flex flex-col gap-[5px]">
          {displayRoutes.map((route: any, index: number) => {
            const IconComponent = useFallback 
              ? route.icon 
              : getIconComponent(route.icon);

            if (route.subRoutes && route.subRoutes.length > 0) {
              return (
                <SidebarMenu
                  route={{...route, icon: IconComponent}}
                  key={route._id || index}
                  isSidebarOpen={isSidebarOpen}
                />
              );
            }

            return (
              <div key={route._id || index}>
                <Link
                  href={route.path || "#"}
                  className={`
                    flex items-center gap-2.5 py-[5px] px-2.5 no-underline 
                    border-r-4 border-transparent my-[5px] mr-2.5 ml-0
                    hover:bg-[#EF4444] hover:text-white 
                    hover:border-white hover:rounded-lg
                    ${pathname === route.path
                      ? "bg-[#EF4444] text-white border-white rounded-lg"
                      : "text-[#716767]"
                    }
                  `}
                >
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {IconComponent}
                  </div>

                  {isSidebarOpen && (
                    <div className="whitespace-nowrap text-[15.5px] py-0.5">
                      {route.name}
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
};

export default Sidebar;

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import Logo from "@/assets/images/logo/logo.png";
// import LogoSmall from "@/assets/images/logo/logo-small.png";
// import { RouteName } from "@/lib/route";
// import SidebarMenu from "@/components/features/SidebarMenu";

// interface SidebarProps {
//   isSidebarOpen: boolean;
// }

// const Sidebar = ({ isSidebarOpen }: SidebarProps) => {
//   const pathname = usePathname();

//   return (
//     <>
//       <style jsx global>{`
//         .sidebar-scrollbar::-webkit-scrollbar {
//           width: 0;
//         }
//         .sidebar-scrollbar::-webkit-scrollbar-thumb {
//           background-color: transparent;
//         }
//       `}</style>

//       <div className="bg-white text-black h-screen overflow-y-auto pb-5 sidebar-scrollbar">

//         {isSidebarOpen ? (
//           <div className="flex items-center justify-center pt-5 px-4 bg-white">
//             <Image 
//               src={Logo}
//               alt="Logo" 
//               width={120} 
//               height={40} 
//               style={{ height: 40, width: "auto" }} 
//             />
//           </div>
//         ) : (
//           <div className="flex justify-center items-center pt-5">
//             <Image 
//               src={LogoSmall}
//               alt="Logo" 
//               width={30} 
//               height={15} 
//               style={{ height: 15, width: "auto" }} 
//             />
//           </div>
//         )}

//         <section className="pt-[15px] pl-2.5 pr-0 pb-0 flex flex-col gap-[5px]">

//           {RouteName.map((route: any, index: number) => {
//             if (route.subRoutes) {
//               return (
//                 <SidebarMenu
//                   route={route}
//                   key={index}
//                   // ⛔ No animation props
//                   isSidebarOpen={isSidebarOpen}
//                 />
//               );
//             }

//             return (
//               <div key={index}>
//                 <Link
//                   href={route.path || "#"}
//                   className={`
//                     flex items-center gap-2.5 py-[5px] px-2.5 no-underline 
//                     border-r-4 border-transparent my-[5px] mr-2.5 ml-0
//                     hover:bg-[#EF4444] hover:text-white 
//                     hover:border-white hover:rounded-lg
//                     ${pathname === route.path
//                       ? "bg-[#EF4444] text-white border-white rounded-lg"
//                       : "text-[#716767]"
//                     }
//                   `}
//                 >
//                   <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
//                     {route.icon}
//                   </div>

//                   {/* TEXT – No animation */}
//                   {isSidebarOpen && (
//                     <div className="whitespace-nowrap text-[15.5px] py-0.5">
//                       {route.name}
//                     </div>
//                   )}
//                 </Link>
//               </div>
//             );
//           })}
//         </section>
//       </div>
//     </>
//   );
// };

// export default Sidebar;
