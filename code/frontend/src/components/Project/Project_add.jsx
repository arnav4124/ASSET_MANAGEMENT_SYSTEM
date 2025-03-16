import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from "react-hook-form";
import axios from 'axios';

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
    if(selectedManager && usertoRemove.email === selectedManager.email){
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Add Project</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Project Name */}
          <div>
            <label className="block font-semibold text-lg mb-1">Project Name</label>
            <input
              {...register("projectName", {
                required: "Project name is required",
                minLength: { value: 3, message: "Project name must be at least 3 characters" }
              })}
              type="text"
              className="input input-bordered w-full"
              disabled={loading}
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
            )}
          </div>

          {/* Programme Dropdown */}
          <div>
            <label className="block font-semibold text-lg mb-1">Programme</label>
            <select
              {...register("programme", { required: "Programme is required" })}
              className="select select-bordered w-full"
              disabled={loading}
            >
              <option value="">Select a programme</option>
              {programmes.map((prog) => (
                <option key={prog._id} value={prog.name}>{prog.name}</option>
              ))}
            </select>
            {errors.programme && (
              <p className="text-red-500 text-sm mt-1">{errors.programme.message}</p>
            )}
          </div>
        </div>

        {/* Project Deadline */}
        <div className="mb-6">
          <label className="block font-semibold text-lg mb-1">Project Deadline</label>
          <input
            {...register("deadline")}
            type="date"
            className="input input-bordered w-full"
            min={new Date().toISOString().split('T')[0]} // Set minimum date to today
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">Optional: Set a deadline for this project</p>
        </div>

        {/* Project Locations */}
        <div>
          <label className="block font-semibold text-lg mb-1">Project Location</label>
          <div className="flex flex-wrap gap-4">
            {locations.map((location) => (
              <label key={location._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={location.location_name}
                  checked={selectedLocations.includes(location.location_name)}
                  onChange={handleLocationChange}
                  className="checkbox"
                  disabled={loading}
                />
                {location.location_name}
              </label>
            ))}
          </div>
          {selectedLocations.length === 0 && (
            <p className="text-red-500 text-sm mt-1">Please select at least one location</p>
          )}
        </div>

        {/* Project Manager */}
        <div>
          <label className="block font-semibold text-lg mb-1">Project Manager</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Search manager by email"
            value={managerSearchTerm}
            onChange={(e) => setManagerSearchTerm(e.target.value)}
          />
          {managerSearchTerm && !selectedManager && (
            <div className="mt-2 border rounded-md shadow-sm">
              {users
                .filter(user =>
                  user.email.toLowerCase().includes(managerSearchTerm.toLowerCase())
                )
                .map((user, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedManager(user);
                      setManagerSearchTerm('');

                      // Modify role to include "(Project Manager)"
                      const updatedManager = { ...user, role: `${user.role} (Project Manager)` };

                      setSelectedParticipants(prevParticipants => {
                        const exists = prevParticipants.some(p => p.email === user.email);
                        if (exists) {
                          // Update existing participant's role
                          return prevParticipants.map(p =>
                            p.email === user.email ? updatedManager : p
                          );
                        } else {
                          // Add new participant
                          return [...prevParticipants, updatedManager];
                        }
                      });

                      register("projectManager").onChange({
                        target: { value: user.email }
                      });
                    }}
                  >
                    <div>{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                ))}
            </div>
          )}
          {selectedManager && (
            <div className="mt-2 bg-blue-100 p-2 rounded-md">
              <div>{selectedManager.name}</div>
              <div className="text-sm text-gray-600">{selectedManager.email}</div>
              <button
                type="button"
                onClick={() => {
                  setSelectedManager(null);
                  register("projectManager").onChange({ target: { value: '' } });

                  // Restore original role without removing from participants
                  setSelectedParticipants(prevParticipants =>
                    prevParticipants.map(p =>
                      p.email === selectedManager.email
                        ? { ...p, role: p.role.replace(" (Project Manager)", "") }
                        : p
                    )
                  );
                }}
                className="text-red-500 hover:text-red-700 text-sm mt-1"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block font-semibold text-lg mb-1">Add Participants</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Search participants by email"
            value={participantSearchTerm}
            onChange={(e) => setParticipantSearchTerm(e.target.value)}
          />
          {participantSearchTerm && (
            <div className="mt-2 border rounded-md shadow-sm">
              {users
                .filter(user =>
                  user.email.toLowerCase().includes(participantSearchTerm.toLowerCase()) &&
                  !selectedParticipants.some(p => p.email === user.email)
                )
                .map((user, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedParticipants([...selectedParticipants, user]);
                      setParticipantSearchTerm('');
                    }}
                  >
                    <div>{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Participants Table */}
        <div>
          {selectedParticipants.length > 0 && (
            <div className="mt-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Name</th>
                    <th className="border p-2 text-left">Email</th>
                    <th className='border p-2 text-left'>Role</th>
                    <th className="border p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentParticipants.map((user, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className='p-2'>{user.role}</td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeParticipant(index + indexOfFirstParticipant)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50"
                  >
                    &lt;
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Project Description */}
        <div>
          <label className="block font-semibold text-lg mb-1">Project Description</label>
          <textarea
            {...register("projectDescription", { required: "Project description is required" })}
            className="w-full p-2 border rounded-md resize-y"
            placeholder="Project Description"
          ></textarea>
          {errors.projectDescription && (
            <p className="text-red-500 text-sm mt-1">{errors.projectDescription.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className={`btn btn-primary px-6 py-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Project_add;