import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Box, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const ViewAsset = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [assetsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser.role !== "Admin") {
      navigate("/login");
      return;
    }

    const fetchAssets = async () => {
      try {
        // Send admin's location as a query parameter for location-based filtering
        const adminLocation = currentUser.location;
        const response = await fetch(`http://localhost:3487/api/assets?adminLocation=${encodeURIComponent(adminLocation)}`, {
          headers: { token }
        });
        const data = await response.json();
        const activeAssets = data.filter(asset => asset.status !== "Inactive");
        console.log("Fetched assets:", activeAssets);
        setAssets(activeAssets);
      } catch (err) {
        console.error(err);
        setError('Error fetching assets');
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3487/api/categories", {
          headers: { token }
        });
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
        setError('Error fetching categories');
      }
    };

    const fetchLocations = async () => {
      try {
        // Fetch child locations from the admin-locations endpoint.
        const response = await fetch("http://localhost:3487/api/locations/admin-locations", {
          headers: { token }
        });
        const childLocations = await response.json();
        // Get admin's own location from the user object.
        const myLocation = currentUser.location;
        // Combine parent's location with child locations.
        setLocations([{ _id: "admin-location", location_name: myLocation }, ...childLocations]);
      } catch (err) {
        console.error(err);
        setError('Error fetching locations');
      }
    };

    Promise.all([fetchAssets(), fetchCategories(), fetchLocations()])
      .then(() => setLoading(false));
  }, [navigate]);

  // Updated filtering logic for location checkboxes:
  const filteredAssets = assets.filter(asset => {
    // First filter out inactive assets
    if (asset.status === "Inactive") return false;
    
    // Filter based on search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        asset.name?.toLowerCase().includes(searchLower) ||
        asset.asset_type?.toLowerCase().includes(searchLower) ||
        asset.Issued_by?.toString().toLowerCase().includes(searchLower) ||
        asset.Issued_to?.toString().toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    // Filter based on location checkboxes  
    if (selectedLocations.length > 0 && !selectedLocations.includes(asset.Office)) {
      return false;
    }
    // Filter based on category (assumes the API returns populated category name)
    if (categoryFilter && asset.category?.name !== categoryFilter) {
      return false;
    }
    // Filter based on asset type (Physical/Virtual)
    if (typeFilter && asset.asset_type?.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Pagination logic
  const indexOfLastAsset = currentPage * assetsPerPage;
  const indexOfFirstAsset = indexOfLastAsset - assetsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstAsset, indexOfLastAsset);
  const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);

  // Generate page numbers array with limited visible pages and ellipses
  const getPageNumbers = () => {
    const maxPagesToShow = 5; // Number of page buttons to show at once
    let pageNumbers = [];

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than maxPagesToShow
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always include first page, last page, and pages around current page
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        // Show first 1, 2, 3, 4, 5 ... 10
        const leftItemCount = 3 + (maxPagesToShow - 3) / 2;
        pageNumbers = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        pageNumbers.push("dots1");
        pageNumbers.push(totalPages);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        // Show 1 ... 6, 7, 8, 9, 10
        pageNumbers.push(1);
        pageNumbers.push("dots1");

        const rightItemCount = maxPagesToShow - 3;
        const startPage = totalPages - rightItemCount + 1;
        pageNumbers = pageNumbers.concat(
          Array.from({ length: rightItemCount }, (_, i) => startPage + i)
        );
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        // Show 1 ... 4, 5, 6 ... 10
        pageNumbers.push(1);
        pageNumbers.push("dots1");

        pageNumbers.push(leftSiblingIndex);
        pageNumbers.push(currentPage);
        pageNumbers.push(rightSiblingIndex);

        pageNumbers.push("dots2");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLocations, categoryFilter, typeFilter]);

  // Handler for location checkbox toggle
  const handleLocationToggle = (locationName) => {
    setSelectedLocations(prev => {
      if (prev.includes(locationName)) {
        return prev.filter(loc => loc !== locationName);
      } else {
        return [...prev, locationName];
      }
    });
  };

  const handleRowClick = (id) => {
    navigate(`/admin/assets/view/${id}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-white text-xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading Assets...</p>
          <p className="text-sm text-gray-300 mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">View Assets</h1>
            <p className="text-gray-500 mt-1">Manage and view all assets</p>
          </div>
          <button
            onClick={() => navigate('/admin/asset/add')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Asset
          </button>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar Filters */}
          <div className="w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              {/* Checkbox for Location */}
              <div className="mb-4">
                <span className="block text-gray-700 font-medium mb-2">Location (Office)</span>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {locations.map(loc => (
                    <div key={loc._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`loc-${loc._id}`}
                        checked={selectedLocations.includes(loc.location_name)}
                        onChange={() => handleLocationToggle(loc.location_name)}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-400 rounded"
                      />
                      <label htmlFor={`loc-${loc._id}`} className="ml-2 text-sm text-gray-700">
                        {loc.location_name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedLocations.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => setSelectedLocations([])}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
              {/* Category filter */}
              <div className="mb-4">
                <label className="block text-gray-700">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Asset Type filter */}
              <div className="mb-4">
                <label className="block text-gray-700">Asset Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                >
                  <option value="">All Types</option>
                  <option value="Physical">Physical</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Main Table Content */}
          <div className="w-3/4">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search assets by name, type, or assignment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Assets Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAssets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No assets found
                      </td>
                    </tr>
                  ) : (
                    currentAssets.map((asset) => (
                      <tr
                        key={asset._id}
                        onClick={() => handleRowClick(asset._id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Box size={20} className="text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {asset.asset_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.Issued_by && asset.Issued_by.first_name
                            ? `${asset.Issued_by.first_name} ${asset.Issued_by.last_name}`
                            : 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.Issued_to && asset.Issued_to.Project_name
                            ? asset.Issued_to.Project_name
                            : asset.Issued_to && asset.Issued_to.first_name
                              ? `${asset.Issued_to.first_name} ${asset.Issued_to.last_name}`
                              : 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${asset.status === 'Available' ? 'bg-green-100 text-green-800' :
                              asset.status === 'Unavailable' ? 'bg-red-100 text-red-800' :
                              asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              asset.status === 'Inactive' ? 'bg-gray-300 text-gray-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {asset.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {filteredAssets.length > 0 && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Previous
                    </button>
                    <div className="mx-2 flex items-center">
                      <span className="text-sm text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                    </div>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstAsset + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(indexOfLastAsset, filteredAssets.length)}</span> of{" "}
                        <span className="font-medium">{filteredAssets.length}</span> assets
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>

                        {/* Limited Page Numbers with Ellipses */}
                        {getPageNumbers().map((pageNumber, index) => (
                          pageNumber === "dots1" || pageNumber === "dots2" ? (
                            <span
                              key={`dots-${index}`}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : (
                            <button
                              key={pageNumber}
                              onClick={() => paginate(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === pageNumber ? 'bg-blue-50 border-blue-500 text-blue-600 z-10' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                              {pageNumber}
                            </button>
                          )
                        ))}

                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAsset;