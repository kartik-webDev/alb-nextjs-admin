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
import { ReactNode } from "react"; // Add this import

// Updated Route interface with proper ReactNode type
interface Route {
  _id?: string;
  name?: string;
  path?: string | null;
  icon: string | ReactNode; // Fixed: Use ReactNode instead of JSX.Element
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
            setRoutes(RouteName as Route[]);
          } else {
            setUseFallback(false);
            setRoutes(data.routes as Route[]);
          }
        } else {
          setUseFallback(true);
          setRoutes(RouteName as Route[]);
        }
      } catch (error) {
        console.error('Failed to fetch sidebar:', error);
        setUseFallback(true);
        setRoutes(RouteName as Route[]);
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-500"></div>
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
          {displayRoutes.map((route: Route, index: number) => {
            // Get the parent icon component
            const IconComponent = useFallback 
              ? route.icon 
              : getIconComponent(route.icon as string);

            // If route has sub-routes, transform them with icon components
            if (route.subRoutes && route.subRoutes.length > 0) {
              const transformedRoute = useFallback 
                ? { ...route, icon: IconComponent }
                : {
                    ...route,
                    icon: IconComponent,
                    subRoutes: route.subRoutes.map((subRoute: Route) => ({
                      ...subRoute,
                      icon: getIconComponent(subRoute.icon as string)
                    }))
                  };

              return (
                <SidebarMenu
                  route={transformedRoute as any} // Type assertion for SidebarMenu prop
                  key={route._id || index}
                  isSidebarOpen={isSidebarOpen}
                />
              );
            }

            // Regular route without sub-routes
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
