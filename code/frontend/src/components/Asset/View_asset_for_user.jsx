import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Box } from "lucide-react";
import axios from "axios";

const View_asset_for_user = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const getAssets = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      try {
        const token_string = localStorage.getItem("token");
        const user_id = JSON.parse(localStorage.getItem("user"))._id;
        const response = await axios.get(`http://localhost:3487/api/assets/get_user_assets/${user_id}`, {
          headers: { token: token_string }
        });
        
        console.log("API Response:", response.data);
        // Filter out inactive assets before setting state
        const activeAssets = response.data ? response.data.filter(asset => asset && asset.status !== "Inactive") : [];
        setAssets(activeAssets);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError('Error fetching your assets');
      } finally {
        setLoading(false);
      }
    };
    
    getAssets();
  }, [navigate]);
  
  // Fixed useEffect for logging assets
  useEffect(() => {
    console.log("ASSETS:", assets);
  }, [assets]);

  const filteredAssets = assets.filter(asset => {
    if (!asset) return false;
    
    // Filter based on search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        asset.name?.toLowerCase().includes(searchLower) ||
        asset.asset_type?.toLowerCase().includes(searchLower) ||
        (asset.Issued_by?.first_name?.toLowerCase().includes(searchLower) || false) ||
        (asset.Office?.toLowerCase().includes(searchLower) || false);
      if (!matchesSearch) return false;
    }
    
    // Filter based on asset type (physical/virtual)
    if (typeFilter && asset.asset_type?.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }
    
    return true;
  });

  console.log(filteredAssets);

  const handleRowClick = (id) => {
    const role = JSON.parse(localStorage.getItem("user")).role;
    if (role === "Admin" || role === "Superuser") {
      navigate(`/admin/assets/view/${id}`);
    }
    // If not admin/superuser, maybe show a detail view for regular users?
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-white text-xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading Your Assets...</p>
          <p className="text-sm text-gray-300 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Assets</h1>
            <p className="text-gray-500 mt-1">View all assets assigned to you</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar Filters */}
          <div className="w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              <div className="mb-4">
                <label className="block text-gray-700">Asset Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                >
                  <option value="">All Types</option>
                  <option value="physical">Physical</option>
                  <option value="virtual">Virtual</option>
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
                  placeholder="Search assets by name, type, or location..."
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

            {/* No Assets Message */}
            {assets.length === 0 && !loading && !error && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-md">
                <p className="text-yellow-700">No assets have been assigned to you yet.</p>
              </div>
            )}

            {/* Assets Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No assets found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr
                        key={asset._id}
                        onClick={() => handleRowClick(asset._id)}
                        className={`hover:bg-gray-50 transition-colors duration-200 ${
                          (JSON.parse(localStorage.getItem("user")).role === "Admin" || 
                           JSON.parse(localStorage.getItem("user")).role === "Superuser") 
                            ? "cursor-pointer" 
                            : "cursor-default"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Box size={20} className="text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">{asset.name || 'Unnamed Asset'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {asset.asset_type ? asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1) : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.Office || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.Issued_by && typeof asset.Issued_by === 'object' && asset.Issued_by.first_name
                            ? `${asset.Issued_by.first_name} ${asset.Issued_by.last_name || ''}`
                            : 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            asset.status === 'Available' 
                              ? 'bg-green-100 text-green-800' 
                              : asset.status === 'Maintenance'
                                ? 'bg-yellow-100 text-yellow-800'
                                : asset.status === 'Disposed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}>
                            {asset.status || 'Unknown'}
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

export default View_asset_for_user;