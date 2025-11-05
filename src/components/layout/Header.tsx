// src/components/layout/header.tsx
"use client";

import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// SVG Icons (Tailwind-friendly)
const GroupIcon = () => (
  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.30-.53.57-1.1.81-1.69A5 5 0 0010 9c-1.43 0-2.73.6-3.65 1.56.24.59.51 1.16.81 1.69C7.93 12.75 8.85 13 10 13s2.07-.25 2.93-1z"/>
  </svg>
);

const VpnKeyIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H7v2H5v2H2v-3l4.586-4.586A6 6 0 1118 8zM12 8V6h-2v2H8v2h2v2h2v-2h2V8h-2z"/>
  </svg>
);

const VisibilityIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
  </svg>
);

const VisibilityOffIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.195L3.28 2.22zM7.752 6.69l1.092 1.093a2.5 2.5 0 003.374 3.373l1.091 1.092a4 4 0 01-5.557-5.557z" clipRule="evenodd"/>
    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.661-9.337-6.41a1.651 1.651 0 010-1.186A10.004 10.004 0 016.38 7.28l2.368 2.368a4 4 0 002.001 4.282z"/>
  </svg>
);

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Handle menu open/close
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle change password modal
  const handleModalOpen = () => {
    setModalOpen(true);
    handleClose();
  };
  
  const handleModalClose = () => {
    setModalOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to logout",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "grey",
      confirmButtonText: "Logout",
    });

    if (result.isConfirmed) {
      try {
        setData(null);
        localStorage.clear();
        router.push("/");
      } catch (e) {
        console.error(e);
      }
    }
    handleClose();
  };

  // Check user data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const userData = localStorage.getItem("userDetails");
      setData(userData);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <>
      {/* Header */}
      <header className="bg-white w-full text-gray-500 py-1 px-4 border-b border-gray-300 shadow-sm">
        <div className="h-12 flex justify-between items-center">
          {/* Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className="flex justify-center items-center bg-red-500 text-white rounded-lg w-8 h-8 hover:bg-red-600 transition-colors duration-200"
          >
            <FaBars className="text-base" />
          </button>

          {/* Admin Dropdown */}
          <div className="relative">
            <button
              onClick={handleClick}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow text-red-500 font-medium text-sm"
            >
              <GroupIcon />
              Admin
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2 space-y-1">
                  {/* Uncomment if needed */}
                  {/* <button
                    onClick={handleModalOpen}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Change Password
                  </button> */}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    <VpnKeyIcon />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-800">Change Password</h2>
                <button
                  onClick={handleModalClose}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter username"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>

                <button
                  onClick={handleModalClose}
                  className="w-full bg-red-600 text-white py-3 rounded-md text-lg font-medium hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;