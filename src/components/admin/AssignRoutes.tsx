'use client';

import React, { useEffect, useState } from "react";
import { FaUserShield, FaCheck, FaSave, FaFolderOpen, FaChevronRight } from "react-icons/fa";
import Swal from "sweetalert2";

interface Admin {
  _id: string;
  username: string;
  email: string;
  isActive: boolean;
  assignedRoutes?: string[];
}

interface Route {
  _id: string;
  name: string;
  path?: string;
  icon: string;
  isActive: boolean;
  order: number;
  subRoutes?: Route[];
  expanded?: boolean; // Frontend state
}

export default function AssignRoutes() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch admins and routes
  useEffect(() => {
    fetchAdmins();
    fetchRoutes();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/admin/sidebar/all', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Add expanded state to routes
        const routesWithState = (data.routes || []).map((route: Route) => ({
          ...route,
          expanded: false
        }));
        setRoutes(routesWithState);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  // Toggle folder expansion
  const toggleFolder = (routeId: string) => {
    setRoutes(prevRoutes =>
      prevRoutes.map(route =>
        route._id === routeId
          ? { ...route, expanded: !route.expanded }
          : route
      )
    );
  };

  // Handle admin selection
  const handleAdminSelect = (admin: Admin) => {
    setSelectedAdmin(admin);
    setSelectedRoutes(admin.assignedRoutes || []);
  };

  // Toggle route selection
  const toggleRoute = (routeId: string) => {
    if (selectedRoutes.includes(routeId)) {
      setSelectedRoutes(selectedRoutes.filter(id => id !== routeId));
    } else {
      setSelectedRoutes([...selectedRoutes, routeId]);
    }
  };

  // Handle assign routes
  const handleAssignRoutes = async () => {
    if (!selectedAdmin) {
      Swal.fire({
        icon: 'warning',
        title: 'No Admin Selected',
        text: 'Please select an admin first',
        confirmButtonColor: '#dc2626',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/sidebar/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          adminId: selectedAdmin._id,
          routeIds: selectedRoutes
        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Routes Assigned',
          html: `
            <div class="text-left">
              <p>✅ Successfully assigned ${selectedRoutes.length} routes to:</p>
              <p class="font-bold text-red-500 mt-2">${selectedAdmin.username}</p>
            </div>
          `,
          confirmButtonColor: '#dc2626',
        });

        fetchAdmins();
      } else {
        throw new Error(data.error || 'Failed to assign routes');
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Assign Routes to Admins</h2>
          <p className="text-sm text-gray-600 mt-1">Click folders to expand and assign routes/sub-routes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Admin</h3>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {admins.length === 0 ? (
                <div className="p-6 text-center text-gray-600">
                  No admins available
                </div>
              ) : (
                admins.map((admin) => (
                  <div
                    key={admin._id}
                    onClick={() => handleAdminSelect(admin)}
                    className={`p-4 cursor-pointer transition hover:bg-gray-50 ${
                      selectedAdmin?._id === admin._id ? 'bg-red-50 border-l-4 border-red-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <FaUserShield className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                          <div className="text-xs text-gray-500">{admin.email}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {admin.assignedRoutes?.length || 0} routes assigned
                          </div>
                        </div>
                      </div>
                      {selectedAdmin?._id === admin._id && (
                        <FaCheck className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Routes List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Routes {selectedAdmin && `to ${selectedAdmin.username}`}
              </h3>
              <span className="text-sm text-gray-600">
                {selectedRoutes.length} selected
              </span>
            </div>

            {!selectedAdmin ? (
              <div className="border border-gray-200 rounded-lg p-12 text-center">
                <FaUserShield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Select an admin to assign routes</p>
              </div>
            ) : (
              <>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[500px] overflow-y-auto mb-4">
                  {routes.length === 0 ? (
                    <div className="p-6 text-center text-gray-600">
                      No routes available
                    </div>
                  ) : (
                    routes.map((route) => (
                      <div key={route._id} className="p-4">
                        {/* FOLDER ROW - Click to expand */}
                        <div 
                          className="flex items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-lg -mx-1"
                          onClick={() => toggleFolder(route._id)}
                        >
                          <div className="w-5 h-5 mr-3 flex items-center">
                            <FaChevronRight 
                              className={`transition-transform duration-200 ${
                                route.expanded ? 'rotate-90' : ''
                              }`} 
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{route.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {route.subRoutes?.length || 0} sub-routes
                            </div>
                          </div>
                        </div>

                        {/* SUB-ROUTES - Show when expanded */}
                        {route.expanded && route.subRoutes && route.subRoutes.length > 0 && (
                          <div className="ml-8 mt-2 space-y-2 border-l border-gray-200 pl-4">
                            {route.subRoutes.map((subRoute) => (
                              <label 
                                key={subRoute._id} 
                                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRoutes.includes(subRoute._id)}
                                  onChange={() => toggleRoute(subRoute._id)}
                                  className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 mr-3"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">{subRoute.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {subRoute.path} • {subRoute.icon}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={handleAssignRoutes}
                  disabled={loading || selectedRoutes.length === 0}
                  className="w-full px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2 h-4 w-4" />
                      Assign {selectedRoutes.length} Routes
                    </>
                  )}
                </button>

                {selectedRoutes.length === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Click folders to expand and select sub-routes
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
