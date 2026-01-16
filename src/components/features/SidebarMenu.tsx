// "use client";

// import { useState, useEffect, ReactNode } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { AnimatePresence, motion } from "framer-motion";
// import { FaAngleDown } from "react-icons/fa";

// const menuAnimation = {
//   hidden: { 
//     opacity: 0, 
//     height: 0, 
//     padding: 0, 
//     transition: { duration: 0.3, when: "afterChildren" } 
//   },
//   show: { 
//     opacity: 1, 
//     height: "auto", 
//     transition: { duration: 0.3, when: "beforeChildren" } 
//   },
// };

// const menuItemAnimation = {
//   hidden: (i: number) => ({ 
//     padding: 0, 
//     x: "-100%", 
//     transition: { duration: (i + 1) * 0.1 } 
//   }),
//   show: (i: number) => ({ 
//     x: 0, 
//     transition: { duration: (i + 1) * 0.1 } 
//   })
// };

// interface SubRoute {
//   path: string;
//   name: string;
//   icon?: ReactNode;
// }

// interface Route {
//   name: string;
//   subRoutes: SubRoute[];
//   icon?: ReactNode;
// }

// interface SidebarMenuProps {
//   route: Route;
//   // showAnimation: {
//   //   hidden: { width: number; opacity: number; transition: { duration: number } };
//   //   show: { opacity: number; width: string; transition: { duration: number } };
//   // };
//   isSidebarOpen: boolean;
// }

// const SidebarMenu = ({ route,  isSidebarOpen }: SidebarMenuProps) => {
//   const pathname = usePathname();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   useEffect(() => {
//     if (!isSidebarOpen) {
//       setIsMenuOpen(false);
//     }
//   }, [isSidebarOpen]);

//   return (
//     <>
//       <div 
//         className={`
//           flex items-center gap-2.5 py-[5px] px-2.5 
//           border-r-4 border-transparent my-[5px] mr-2.5 ml-0
//           transition-all duration-200 ease-[cubic-bezier(0.6,-0.28,0.735,0.045)] 
//           justify-between cursor-pointer
//           hover:border-r-4 hover:border-white hover:bg-[#EF4444] hover:text-white 
//           hover:rounded-lg hover:rounded-tr-[10px] hover:rounded-br-[10px]
//           text-[#716767]
//         `}
//         onClick={toggleMenu}
//       >
//         <div className="flex items-center gap-2.5">
//           {/* Icon hamesha dikhega */}
//           <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
//             {route.icon}
//           </div>

//           <AnimatePresence>
//             {isSidebarOpen && (
//               <motion.div
//                 // variants={showAnimation}
//                 initial="hidden"
//                 animate="show"
//                 exit="hidden"
//                 className="whitespace-nowrap text-[15.5px] py-0.5"
//               >
//                 {route.name}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
        
//         {isSidebarOpen && (
//           <motion.div 
//             animate={isMenuOpen ? { rotate: -90 } : { rotate: 0 }}
//             className="flex-shrink-0"
//           >
//             <FaAngleDown />
//           </motion.div>
//         )}
//       </div>

//       <AnimatePresence>
//         {isMenuOpen && (
//           <motion.div
//             variants={menuAnimation}
//             initial="hidden"
//             animate="show"
//             exit="hidden"
//             className="flex flex-col ml-2"
//           >
//             {route.subRoutes?.map((subRoute, i) => (
//               <motion.div 
//                 variants={menuItemAnimation} 
//                 key={i} 
//                 custom={i}
//               >
//                 <Link
//                   href={subRoute.path}
//                   className={`
//                     flex items-center gap-2.5 py-[5px] px-2.5 
//                     border-r-4 border-transparent my-[5px] mr-2.5 ml-0
//                     transition-all duration-200 
//                     hover:border-r-4 hover:border-white hover:bg-[#EF4444] hover:text-white 
//                     hover:rounded-lg hover:rounded-tr-[10px] hover:rounded-br-[10px]
//                     ${pathname === subRoute.path 
//                       ? "border-r-4 border-white bg-[#EF4444] text-white rounded-lg rounded-tr-[10px] rounded-br-[10px]" 
//                       : "text-[#716767]"
//                     }
//                   `}
//                 >
//                   {/* SubRoute icon bhi hamesha dikhega */}
//                   <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
//                     {subRoute.icon}
//                   </div>
                  
//                   {isSidebarOpen && (
//                     <motion.div className="whitespace-nowrap text-[15.5px] py-0.5">
//                       {subRoute.name}
//                     </motion.div>
//                   )}
//                 </Link>
//               </motion.div>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default SidebarMenu;


"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaAngleDown } from "react-icons/fa";

interface SubRoute {
  path: string;
  name: string;
  icon?: ReactNode;
}

interface Route {
  name: string;
  subRoutes: SubRoute[];
  icon?: ReactNode;
}

interface SidebarMenuProps {
  route: Route;
  isSidebarOpen: boolean;
}

const SidebarMenu = ({ route, isSidebarOpen }: SidebarMenuProps) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (!isSidebarOpen) setIsMenuOpen(false);
  }, [isSidebarOpen]);

  return (
    <>
      {/* Main Route Button */}
      <div
        className={`
          flex items-center gap-2.5 py-[5px] px-2.5 
          border-r-4 border-transparent my-[5px] mr-2.5 ml-0
          justify-between cursor-pointer
          hover:bg-[#EF4444] hover:text-white hover:border-white hover:rounded-lg
          text-[#716767]
        `}
        onClick={toggleMenu}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 flex items-center justify-center">
            {route.icon}
          </div>

          {isSidebarOpen && (
            <div className="whitespace-nowrap text-[15.5px] py-0.5">
              {route.name}
            </div>
          )}
        </div>

        {isSidebarOpen && (
          <div className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}>
            <FaAngleDown />
          </div>
        )}
      </div>

      {/* Sub Menu */}
      {isMenuOpen && (
        <div className="flex flex-col ml-2">
          {route.subRoutes?.map((subRoute, i) => (
            <div key={i}>
              <Link
                href={subRoute.path}
                className={`
                  flex items-center gap-2.5 py-[5px] px-2.5 
                  border-r-4 border-transparent my-[5px] mr-2.5 ml-0
                  hover:bg-[#EF4444] hover:text-white hover:border-white hover:rounded-lg
                  ${pathname === subRoute.path
                    ? "bg-[#EF4444] text-white border-white rounded-lg"
                    : "text-[#716767]"
                  }
                `}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {subRoute.icon}
                </div>

                {isSidebarOpen && (
                  <div className="whitespace-nowrap text-[15.5px] py-0.5">
                    {subRoute.name}
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SidebarMenu;
