import React, { useState, useEffect } from "react";
import { Pencil, Trash2, UserPlus, ChevronRight, ChevronLeft, Check, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [toBeDeletedParticipants, setToBeDeletedParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [assets, setAssets] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  const participantsPerPage = 10;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const role = JSON.parse(localStorage.getItem('user'))?.role;
    if (role !== 'Admin') {
      navigate('/login');
      return;
    }

    // Validate MongoDB ObjectId format
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(id)) {
      setError('Invalid project ID format');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project details
        const projectRes = await axios.get(`http://localhost:3487/api/projects/${id}`, {
          headers: { token: localStorage.getItem('token') }
        });

        if (!projectRes.data) {
          throw new Error('Project not found');
        }

        setProject(projectRes.data);
        setSelectedLocations(projectRes.data.location || []);

        // Set form values
        setValue("projectName", projectRes.data.Project_name);
        setValue("programme", projectRes.data.programme_name);
        setValue("description", projectRes.data.description);
        setValue("project_head", projectRes.data.project_head?._id || "");
        if (projectRes.data.deadline) {
          setValue("deadline", new Date(projectRes.data.deadline).toISOString().split('T')[0]);
        }

        // Fetch all data in parallel
        const [participantsRes, assetsRes, programmesRes, locationsRes, usersRes] = await Promise.all([
          axios.get(`http://localhost:3487/api/projects/${id}/participants`, {
            headers: { token: localStorage.getItem('token') }
          }),
          axios.get(`http://localhost:3487/api/projects/${id}/assets`, {
            headers: { token: localStorage.getItem('token') }
          }),
          axios.get('http://localhost:3487/api/programmes', {
            headers: { token: localStorage.getItem('token') }
          }),
          axios.get('http://localhost:3487/api/locations/get_all_cities', {
            headers: { token: localStorage.getItem('token') }
          }),
          axios.get('http://localhost:3487/api/projects/users', {
            headers: { token: localStorage.getItem('token') }
          })
        ]);

        setParticipants(participantsRes.data);
        setAssets(assetsRes.data);
        setProgrammes(programmesRes.data);
        setLocations(locationsRes.data);
        setAvailableUsers(usersRes.data);

      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 404) {
          setError('Project not found');
        } else if (err.response?.status === 400) {
          setError(err.response.data.message || 'Invalid project ID');
        } else {
          setError(err.response?.data?.message || 'Error loading project data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, setValue]);

  const pageCount = Math.ceil(participants.length / participantsPerPage);
  const paginatedParticipants = participants.slice(
    currentPage * participantsPerPage,
    (currentPage + 1) * participantsPerPage
  );

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:3487/api/projects/${id}`,
        {
          Project_name: data.projectName,
          programme_name: data.programme,
          description: data.description,
          deadline: data.deadline || null,
          location: selectedLocations,
          project_head: data.project_head
        },
        {
          headers: { token: localStorage.getItem('token') }
        }
      );

      if (response.status === 200) {
        setProject(response.data.project);
        setIsEditing(false);
        alert('Project updated successfully!');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.message || 'Error updating project');
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipantForDeletion = (id) => {
    if (toBeDeletedParticipants.includes(id)) {
      setToBeDeletedParticipants(toBeDeletedParticipants.filter(pid => pid !== id));
    } else {
      setToBeDeletedParticipants([...toBeDeletedParticipants, id]);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-white text-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Project</h1>
              <p className="text-gray-500 mt-1">Update project details and manage participants</p>
            </div>
            <button
              type="button"
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200 ${isEditing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil size={16} />
              {isEditing ? 'Editing...' : 'Enable Edit'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Project Basic Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Project Details</h2>
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
                    disabled={!isEditing}
                  />
                  {errors.projectName && (
                    <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
                  )}
                </div>

                <div className="transition-all duration-200">
                  <label className="block font-medium text-sm mb-1 text-gray-700">Programme</label>
                  <select
                    {...register("programme")}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                    disabled={!isEditing}
                  >
                    {programmes.map((prog) => (
                      <option key={prog._id} value={prog.name}>{prog.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Project Head & Deadline */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Project Timeline & Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="transition-all duration-200">
                  <label className="block font-medium text-sm mb-1 text-gray-700">Project Head</label>
                  {isEditing ? (
                    <div>
                      <select
                        {...register("project_head", { required: "Project head is required" })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                      >
                        <option value="">Select Project Head</option>
                        {availableUsers.map((user) => (
                          <option key={user._id} value={user._id}>
                            {`${user.first_name} ${user.last_name} (${user.email})`}
                          </option>
                        ))}
                      </select>
                      {errors.project_head && (
                        <p className="text-red-500 text-sm mt-1">{errors.project_head.message}</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {project?.project_head ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">{`${project.project_head.first_name} ${project.project_head.last_name}`}</p>
                            <p className="text-sm text-gray-500">{project.project_head.email}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No project head assigned</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="transition-all duration-200">
                  <label className="block font-medium text-sm mb-1 text-gray-700">Project Deadline</label>
                  <input
                    {...register("deadline")}
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Project Description</h2>
              <textarea
                {...register("description")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none min-h-[120px]"
                disabled={!isEditing}
                rows="4"
              />
            </div>

            {/* Project Locations */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Project Locations</h2>
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {locations.map((loc) => (
                        <label key={loc} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(loc)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLocations([...selectedLocations, loc]);
                              } else {
                                setSelectedLocations(selectedLocations.filter(l => l !== loc));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{loc}</span>
                        </label>
                      ))}
                    </div>
                    {selectedLocations.length === 0 && (
                      <p className="text-red-500 text-sm">Please select at least one location</p>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedLocations.map((loc) => (
                      <div key={loc} className="p-2 bg-blue-50 rounded-md text-blue-700 text-sm">
                        {loc}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Project Assets */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Project Assets</h2>
              <div className="overflow-x-auto border rounded">
                <table className="w-full bg-white">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Asset Name</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Category</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-gray-500">No assets assigned</td>
                      </tr>
                    ) : (
                      assets.map((asset) => (
                        <tr key={asset._id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm">{asset.name}</td>
                          <td className="p-3 text-sm">{asset.category?.name || 'N/A'}</td>
                          <td className="p-3 text-sm">{asset.Office}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Participants Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-700">Project Participants</h2>
                {isEditing && (
                  <button
                    type="button"
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm flex items-center gap-2"
                    onClick={() => setShowAddParticipant(true)}
                  >
                    <UserPlus size={14} />
                    Add Participant
                  </button>
                )}
              </div>

              {/* Add Participant Form */}
              {showAddParticipant && (
                <div className="mb-4 p-3 border rounded-md bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={newParticipantEmail}
                      onChange={(e) => setNewParticipantEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 p-2 border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      className="p-2 bg-blue-500 text-white rounded-md"
                      onClick={() => {/* Add participant logic */ }}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-500 rounded-md"
                      onClick={() => setShowAddParticipant(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Participants Table */}
              <div className="overflow-x-auto border rounded">
                <table className="w-full bg-white">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Email</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Role</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedParticipants.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-gray-500">
                          No participants found
                        </td>
                      </tr>
                    ) : (
                      paginatedParticipants.map((participant) => (
                        <tr
                          key={participant._id}
                          className={`border-b ${toBeDeletedParticipants.includes(participant._id)
                            ? "bg-red-50"
                            : "hover:bg-gray-50"
                            } group`}
                        >
                          <td className="p-3 text-sm">{`${participant.first_name} ${participant.last_name}`}</td>
                          <td className="p-3 text-sm">{participant.email}</td>
                          <td className="p-3 text-sm">{participant.role}</td>
                          <td className="p-3 text-right">
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => toggleParticipantForDeletion(participant._id)}
                                className={`${toBeDeletedParticipants.includes(participant._id)
                                  ? "text-red-500"
                                  : "text-gray-400 opacity-0 group-hover:opacity-100"
                                  } transition-opacity duration-200`}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {pageCount > 1 && (
                <div className="flex justify-center mt-4 gap-2 items-center">
                  <button
                    type="button"
                    className="p-1 border rounded"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage + 1} of {pageCount}
                  </span>
                  <button
                    type="button"
                    className="p-1 border rounded"
                    onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))}
                    disabled={currentPage === pageCount - 1}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* Deletion Controls */}
              {toBeDeletedParticipants.length > 0 && isEditing && (
                <div className="mt-4 p-3 border rounded-md bg-red-50 flex justify-between items-center">
                  <span className="font-medium text-red-600 text-sm">
                    {toBeDeletedParticipants.length} participant(s) selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 text-gray-700 text-sm"
                      onClick={() => setToBeDeletedParticipants([])}
                    >
                      Clear Selection
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                      onClick={() => {/* Delete participants logic */ }}
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 p-6 flex justify-between items-center border-t">
            <button
              type="button"
              className="px-4 py-2 text-gray-600 flex items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={16} />
              Back
            </button>
            {isEditing && (
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEdit;