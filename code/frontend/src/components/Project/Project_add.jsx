import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from "react-hook-form";
import axios from 'axios';
import { FaProjectDiagram, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaChevronLeft, FaSpinner } from 'react-icons/fa';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const Project_add = () => {
  const [locations, setLocations] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const participantsPerPage = 10;

  // Fetch initial data
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
    else {
      const role = JSON.parse(localStorage.getItem('user')).role
      console.log(role)

      if (role !== 'Admin') {
        navigate('/login')
      }
    }
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch users with role 'User'
        const usersResponse = await api.get('http://localhost:3487/api/projects/users', {
          headers: { token: localStorage.getItem('token') }
        });
        setUsers(usersResponse.data);

        // Fetch locations
        const locationsResponse = await api.get('http://localhost:3487/api/projects/locations', {
          headers: { token: localStorage.getItem('token') }
        });
        setLocations(locationsResponse.data);

        // Fetch programmes
        const programmesResponse = await api.get('http://localhost:3487/api/programmes', {
          headers: { token: localStorage.getItem('token') }
        });
        setProgrammes(programmesResponse.data);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate pagination data
  const { currentParticipants, totalPages, indexOfFirstParticipant } = useMemo(() => {
    if (selectedParticipants.length === 0) {
      return {
        currentParticipants: [],
        totalPages: 0,
        indexOfFirstParticipant: 0
      };
    }

    const indexOfLastParticipant = currentPage * participantsPerPage;
    const indexOfFirstParticipant = indexOfLastParticipant - participantsPerPage;

    return {
      currentParticipants: selectedParticipants.slice(
        indexOfFirstParticipant,
        indexOfLastParticipant
      ),
      totalPages: Math.ceil(selectedParticipants.length / participantsPerPage),
      indexOfFirstParticipant
    };
  }, [selectedParticipants, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedParticipants.length]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedManager) {
        throw new Error('Please select a project manager');
      }

      if (selectedLocations.length === 0) {
        throw new Error('Please select at least one location');
      }

      const projectData = {
        Project_name: data.projectName,
        programme_name: data.programme,
        project_head: selectedManager._id,
        location: selectedLocations,
        description: data.projectDescription,
        deadline: data.deadline || null,
        participants: selectedParticipants.map(p => p._id)
      };

      const response = await api.post('http://localhost:3487/api/projects', projectData, {
        headers: { token: localStorage.getItem('token') }
      });

      if (response.status === 201) {
        alert('Project created successfully!');
        reset();
        setSelectedManager(null);
        setSelectedParticipants([]);
        setSelectedLocations([]);
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = (index) => {
    const usertoRemove = selectedParticipants[index];
    if (selectedManager && usertoRemove.email === selectedManager.email) {
      setSelectedManager(null);
      register("projectManager").onChange({ target: { value: '' } });
    }
    setSelectedParticipants(prev => {
      const updatedList = [...prev];
      updatedList.splice(index, 1);
      return updatedList;
    });
  };

  const handleLocationChange = (event) => {
    const { value, checked } = event.target;
    setSelectedLocations(prev =>
      checked ? [...prev, value] : prev.filter(loc => loc !== value)
    );
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-white text-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4">
            <FaSpinner className="text-white text-4xl" />
          </div>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-md">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-800">{error}</p>
              <p className="text-red-600 text-sm">Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with shadow and subtle gradient */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Add Project</h1>
              <p className="text-gray-500 mt-1">Create a new project and assign team members</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <FaProjectDiagram size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-6 space-y-6">
            {/* Project Basic Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 flex items-center">
                <FaProjectDiagram className="mr-2" /> Project Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="transition-all duration-200">
                  <label className="block font-medium text-sm mb-1 text-gray-700">Project Name</label>
                  <input
                    {...register("projectName", {
                      required: "Project name is required",
                      minLength: { value: 3, message: "Project name must be at least 3 characters" }
                    })}
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                    placeholder="Enter project name"
                  />
                  {errors.projectName && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.projectName.message}</p>
                  )}
                </div>

                <div className="transition-all duration-200">
                  <label className="block font-medium text-sm mb-1 text-gray-700">Programme</label>
                  <select
                    {...register("programme", { required: "Programme is required" })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  >
                    <option value="">Select a programme</option>
                    {programmes.map((prog) => (
                      <option key={prog._id} value={prog.name}>{prog.name}</option>
                    ))}
                  </select>
                  {errors.programme && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.programme.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Timeline */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 flex items-center">
                <FaCalendarAlt className="mr-2" /> Timeline
              </h2>
              <div className="transition-all duration-200">
                <label className="block font-medium text-sm mb-1 text-gray-700">Project Deadline</label>
                <input
                  {...register("deadline")}
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-gray-500 mt-1">Optional: Set a deadline for this project</p>
              </div>
            </div>

            {/* Project Locations */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 flex items-center">
                <FaMapMarkerAlt className="mr-2" /> Project Locations
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {locations.map((location) => (
                  <label key={location._id} className="flex items-center p-3 border rounded-md hover:bg-gray-50 transition-all duration-200">
                    <input
                      type="checkbox"
                      value={location.location_name}
                      checked={selectedLocations.includes(location.location_name)}
                      onChange={handleLocationChange}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-sm text-gray-700">{location.location_name}</span>
                  </label>
                ))}
              </div>
              {selectedLocations.length === 0 && (
                <p className="text-red-500 text-sm mt-2 animate-fadeIn">Please select at least one location</p>
              )}
            </div>

            {/* Project Team */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 flex items-center">
                <FaUsers className="mr-2" /> Project Team
              </h2>

              {/* Project Manager Selection */}
              <div className="mb-6">
                <label className="block font-medium text-sm mb-1 text-gray-700">Project Manager</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                    placeholder="Search manager by email"
                    value={managerSearchTerm}
                    onChange={(e) => setManagerSearchTerm(e.target.value)}
                  />
                  {managerSearchTerm && !selectedManager && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {users
                        .filter(user =>
                          user.email.toLowerCase().includes(managerSearchTerm.toLowerCase())
                        )
                        .map((user, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors duration-150"
                            onClick={() => {
                              setSelectedManager(user);
                              setManagerSearchTerm('');
                              const updatedManager = { ...user, role: `${user.role} (Project Manager)` };
                              setSelectedParticipants(prev => {
                                const exists = prev.some(p => p.email === user.email);
                                return exists
                                  ? prev.map(p => p.email === user.email ? updatedManager : p)
                                  : [...prev, updatedManager];
                              });
                            }}
                          >
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Add Team Members</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                    placeholder="Search participants by email"
                    value={participantSearchTerm}
                    onChange={(e) => setParticipantSearchTerm(e.target.value)}
                  />
                  {participantSearchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {users
                        .filter(user =>
                          user.email.toLowerCase().includes(participantSearchTerm.toLowerCase()) &&
                          !selectedParticipants.some(p => p.email === user.email)
                        )
                        .map((user, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors duration-150"
                            onClick={() => {
                              setSelectedParticipants([...selectedParticipants, user]);
                              setParticipantSearchTerm('');
                            }}
                          >
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Team Members Table */}
              {selectedParticipants.length > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentParticipants.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-3">{user.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeParticipant(index + indexOfFirstParticipant)}
                              className="text-red-500 hover:text-red-700 transition-colors duration-150"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md bg-white border text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-150"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md bg-white border text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-150"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Project Description */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Project Description</h2>
              <textarea
                {...register("projectDescription", { required: "Project description is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none min-h-[120px] resize-y"
                placeholder="Enter project description..."
              ></textarea>
              {errors.projectDescription && (
                <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.projectDescription.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4 border-t">
            <button
              type="button"
              onClick={() => {
                reset();
                setSelectedManager(null);
                setSelectedParticipants([]);
                setSelectedLocations([]);
              }}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FaProjectDiagram />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Back Navigation */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-150"
          >
            <FaChevronLeft className="mr-2" />
            <span>Back to Projects</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Project_add;