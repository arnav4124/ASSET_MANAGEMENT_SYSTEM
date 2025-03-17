import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Box } from "lucide-react";

const ViewAsset = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    } else {
      const role = JSON.parse(localStorage.getItem("user")).role;
      if (role !== "Admin") {
        navigate("/login");
        return;
      }
    }

    const fetchAssets = async () => {
      try {
        const response = await fetch("http://localhost:3487/api/assets", {
          headers: { token }
        });
        const data = await response.json();
        setAssets(data);
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
        const response = await fetch("http://localhost:3487/api/locations", {
          headers: { token }
        });
        const data = await response.json();
        setLocations(data);
      } catch (err) {
        console.error(err);
        setError('Error fetching locations');
      }
    };

    Promise.all([fetchAssets(), fetchCategories(), fetchLocations()])
      .then(() => setLoading(false));
  }, [navigate]);

  const filteredAssets = assets.filter(asset => {
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
    // Filter based on location using the Office field
    if (locationFilter && asset.Office !== locationFilter) {
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

  const handleRowClick = (id) => {
    navigate(`/admin/assets/${id}`);
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
              <div className="mb-4">
                <label className="block text-gray-700">Location (Office)</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc._id} value={loc.location_name}>
                      {loc.location_name}
                    </option>
                  ))}
                </select>
              </div>

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
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No assets found
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
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
                          {asset.Issued_to && asset.Issued_to.first_name
                            ? `${asset.Issued_to.first_name} ${asset.Issued_to.last_name}`
                            : 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${asset.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {asset.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAsset;