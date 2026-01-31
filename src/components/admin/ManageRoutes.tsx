'use client';

import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaFolder, FaRoute } from "react-icons/fa";
import Swal from "sweetalert2";

interface Route {
  _id: string;
  name: string;
  path?: string;
  icon: string;
  order: number;
  parentRoute?: string;
  subRoutes?: Route[];
  assignedAdmins?: string[];
  description?: string;
  createdAt: string;
}

const ICON_OPTIONS = [
  'OtherRouteSvg', 'CustomerRouteSvg', 'AstrologerRouteSvg', 'PoojaRouteSvg',
  'NotificationRouteSvg', 'SkillRouteSvg', 'RemediesRouteSvg', 'MainExpertiesRouteSvg',
  'LanguageRouteSvg', 'GiftRouteSvg', 'BlogsRouteSvg', 'BannerRouteSvg',
  'RatingRouteSvg', 'RechargeRouteSvg', 'LiveRouteSvg', 'AnnouncementRouteSvg',
];

export default function ManageRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [folderName, setFolderName] = useState('');
  const [currentRoute, setCurrentRoute] = useState<Partial<Route>>({
    name: '', path: '', icon: 'OtherRouteSvg', order: 0, description: ''
  });

  // Fetch all routes
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sidebar/all', {
        method: 'GET', credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || []);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      Swal.fire({
        icon: 'error', title: 'Error', text: 'Failed to load routes',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Flatten routes for table display
  const flatRoutes = routes.flatMap(route => [
    route,
    ...(route.subRoutes || [])
  ]);

  // Create folder from selected routes
  const handleCreateFolder = async () => {
    if (!folderName.trim() || selectedRoutes.length === 0) {
      Swal.fire({
        icon: 'warning', title: 'Validation Error', 
        text: 'Enter folder name and select routes',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/sidebar/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folderName, routeIds: selectedRoutes })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success', title: 'Folder Created',
          text: `${folderName} created with ${selectedRoutes.length} routes`,
          confirmButtonColor: '#dc2626', timer: 2000
        });
        setShowFolderModal(false);
        setFolderName('');
        setSelectedRoutes([]);
        fetchRoutes();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create folder');
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error', title: 'Error', text: error.message,
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create/Update route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoute.name || !currentRoute.icon) {
      Swal.fire({
        icon: 'warning', title: 'Validation Error', 
        text: 'Please fill required fields',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    try {
      setLoading(true);
      const url = editMode 
        ? `/api/admin/sidebar/${currentRoute._id}`
        : '/api/admin/sidebar/create';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(currentRoute)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success', title: editMode ? 'Route Updated' : 'Route Created',
          text: `${currentRoute.name} has been ${editMode ? 'updated' : 'created'} successfully`,
          confirmButtonColor: '#dc2626', timer: 2000
        });
        setShowModal(false);
        resetForm();
        fetchRoutes();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save route');
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error', title: 'Error', text: error.message,
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete route
  const handleDelete = async (routeId: string, routeName: string) => {
    const result = await Swal.fire({
      title: 'Delete Route?',
      html: `
        <div class="text-left">
          <p class="text-red-600 font-semibold">Are you sure you want to delete this route?</p>
          <p class="mt-2">Route: <span class="font-mono">${routeName}</span></p>
          <p class="text-sm text-gray-600 mt-2">
            This will remove the route from all assigned admins.
          </p>
        </div>
      `,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/sidebar/${routeId}`, {
          method: 'DELETE', credentials: 'include'
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success', title: 'Deleted!', 
            text: 'Route has been deleted successfully',
            confirmButtonColor: '#dc2626'
          });
          fetchRoutes();
        }
      } catch (error: any) {
        Swal.fire({
          icon: 'error', title: 'Error', text: error.message,
          confirmButtonColor: '#dc2626'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle route selection
  const handleRouteSelect = (routeId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoutes([...selectedRoutes, routeId]);
    } else {
      setSelectedRoutes(selectedRoutes.filter(id => id !== routeId));
    }
  };

  // Utility functions
  const handleCreate = () => {
    setEditMode(false);
    resetForm();
    setShowModal(true);
  };

  const handleCreateFolderClick = () => {
    if (selectedRoutes.length === 0) {
      Swal.fire({
        icon: 'info', title: 'No Selection',
        text: 'Please select routes first by checking the boxes',
        confirmButtonColor: '#dc2626'
      });
      return;
    }
    setShowFolderModal(true);
  };

  const handleEdit = (route: Route) => {
    setEditMode(true);
    setCurrentRoute(route);
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentRoute({
      name: '', path: '', icon: 'OtherRouteSvg', 
      order: 0, description: ''
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Routes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create routes first, then select & group into folders
              {selectedRoutes.length > 0 && (
                <span className="ml-2 text-red-600 font-medium">
                  ({selectedRoutes.length} selected)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm flex items-center"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Create Route
            </button>
            <button
              onClick={handleCreateFolderClick}
              disabled={selectedRoutes.length === 0}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFolder className="mr-2 h-4 w-4" />
              Group into Folder
            </button>
          </div>
        </div>

        {/* Routes Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading routes...</p>
            </div>
          ) : flatRoutes.length === 0 ? (
            <div className="text-center py-12">
              <FaRoute className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No routes found</p>
              <button
                onClick={handleCreate}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Create Your First Route
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                    <input
                      type="checkbox"
                      checked={selectedRoutes.length === flatRoutes.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoutes(flatRoutes.map(r => r._id));
                        } else {
                          setSelectedRoutes([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    S.No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Route Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Icon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flatRoutes.map((route, index) => (
                  <tr key={route._id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRoutes.includes(route._id)}
                        onChange={(e) => handleRouteSelect(route._id, e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{route.name}</div>
                      {route.subRoutes && route.subRoutes.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {route.subRoutes.length} sub-routes
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-mono">
                        {route.path || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {route.icon}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {route.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(route)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit Route"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(route._id, route.name)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Route"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create Folder</h3>
              <button
                onClick={() => {
                  setShowFolderModal(false);
                  setFolderName('');
                  setSelectedRoutes([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateFolder(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  placeholder="e.g., Consultation"
                  required
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Routes:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedRoutes.map(id => {
                    const route = flatRoutes.find(r => r._id === id);
                    return (
                      <span key={id} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        {route?.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || !folderName.trim()}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : `Create "${folderName}" Folder`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFolderModal(false);
                    setFolderName('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Route Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editMode ? 'Edit Route' : 'Create New Route'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
                  <input
                    type="text"
                    value={currentRoute.name}
                    onChange={(e) => setCurrentRoute({...currentRoute, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                    placeholder="e.g., Customer Management"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
                  <input
                    type="text"
                    value={currentRoute.path || ''}
                    onChange={(e) => setCurrentRoute({...currentRoute, path: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                    placeholder="e.g., /customer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon *</label>
                  <select
                    value={currentRoute.icon}
                    onChange={(e) => setCurrentRoute({...currentRoute, icon: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                    required
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    value={currentRoute.order || 0}
                    onChange={(e) => setCurrentRoute({...currentRoute, order: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={currentRoute.description || ''}
                  onChange={(e) => setCurrentRoute({...currentRoute, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  placeholder="Route description"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editMode ? 'Update Route' : 'Create Route'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
