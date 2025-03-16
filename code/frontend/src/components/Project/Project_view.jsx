import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";

const ViewProject = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:3487/api/projects", {
          headers: { token }
        });
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
        setError("Error fetching projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [navigate]);

  // Derive available locations from the project.location arrays
  const availableLocations = [
    ...new Set(projects.flatMap((proj) => proj.location || []))
  ];
  // Derive available programmes from project.programme_name values
  const availableProgrammes = [
    ...new Set(projects.map((proj) => proj.programme_name))
  ];

  const filteredProjects = projects.filter((proj) => {
    // Filter based on search term (matches Project Name and Programme Name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !proj.Project_name.toLowerCase().includes(term) &&
        !proj.programme_name.toLowerCase().includes(term)
      )
        return false;
    }
    // Filter based on location – check if any location in the project matches
    if (locationFilter && !(proj.location || []).includes(locationFilter))
      return false;
    // Filter based on Programme Name
    if (programmeFilter && proj.programme_name !== programmeFilter) return false;
    return true;
  });

  const handleRowClick = (id) => {
    navigate(`/admin/projects/view/${id}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading Projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">View Projects</h1>
            <p className="text-gray-500 mt-1">Manage and view all projects</p>
          </div>
          <button
            onClick={() => navigate("/admin/project/add")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Project
          </button>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar Filters */}
          <div className="w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              <div className="mb-4">
                <label className="block text-gray-700">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                >
                  <option value="">All Locations</option>
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((proj) => (
                      <tr
                        key={proj._id}
                        onClick={() => handleRowClick(proj._id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {proj.Project_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {proj.programme_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {proj.project_head}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : "N/A"}
                          </div>
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

export default ViewProject;