import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Box } from "lucide-react";
import axios from "axios";

const ViewYourProject = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('');

  useEffect(() => {
    const getProjects = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      try {
        const token_string = localStorage.getItem("token");
        const user_id = JSON.parse(localStorage.getItem("user"))._id;
        const response = await axios.get(`http://localhost:3487/api/projects/get_user_projects/${user_id}`, {
          headers: { token: token_string }
        });
        setProjects(response.data);
      } catch (err) {
        console.error(err);
        setError('Error fetching your projects');
      } finally {
        setLoading(false);
      }
    };
    
    getProjects();
  }, [navigate]);

  // Derive available programmes from project.programme_name values
  const availableProgrammes = [
    ...new Set(projects.map((proj) => proj.programme_name).filter(Boolean))
  ];

  // Derive available types if needed
  const availableTypes = [
    ...new Set(projects.map((proj) => proj.type).filter(Boolean))
  ];

  const filteredProjects = projects.filter((proj) => {
    // Filter based on search term (matches Project Name and Programme Name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !proj.Project_name?.toLowerCase().includes(term) &&
        !proj.programme_name?.toLowerCase().includes(term)
      )
        return false;
    }
    
    // Filter based on type if available
    if (typeFilter && proj.type !== typeFilter) return false;
    
    // Filter based on Programme Name
    if (programmeFilter && proj.programme_name !== programmeFilter) return false;
    
    return true;
  });

  const handleViewDetails = (id) => {
    navigate(`/user/project/details/${id}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading Your Projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Your Projects</h1>
            <p className="text-gray-500 mt-1">View all projects you're involved with</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar Filters */}
          <div className="w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              
              {availableTypes.length > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  >
                    <option value="">All Types</option>
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700">Programme</label>
                <select
                  value={programmeFilter}
                  onChange={(e) => setProgrammeFilter(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                >
                  <option value="">All Programmes</option>
                  {availableProgrammes.map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Main Table Content */}
          <div className="w-3/4">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search projects by name or programme..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Programme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Head
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((proj) => (
                      <tr
                        key={proj._id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      >
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => handleViewDetails(proj._id)}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {proj.Project_name}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => handleViewDetails(proj._id)}
                        >
                          <div className="text-sm text-gray-500">
                            {proj.programme_name || "N/A"}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => handleViewDetails(proj._id)}
                        >
                          <div className="text-sm text-gray-500">
                            {proj.project_head && proj.project_head.name ? proj.project_head.name : "N/A"}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => handleViewDetails(proj._id)}
                        >
                          <div className="text-sm text-gray-500">
                            {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : "N/A"}
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(proj._id);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            View Details
                          </button>
                        </td> */}
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

export default ViewYourProject;