import React, { useState } from "react";
import { Pencil, Trash2, UserPlus, ChevronRight, ChevronLeft, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";

const ProjectEdit = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [toBeDeletedParticipants, setToBeDeletedParticipants] = useState([]);

  const programmes = ["Programme A", "Programme B", "Programme C"];
  const locations = ["Location A", "Location B", "Location C"];

  // Sample participants data
  const [participants, setParticipants] = useState([
    { id: 1, name: "Jane Smith", email: "jane.smith@example.com", role: "Developer" },
    { id: 2, name: "John Doe", email: "john.doe@example.com", role: "Designer" },
    { id: 3, name: "Alice Johnson", email: "alice.johnson@example.com", role: "Project Manager" },
    { id: 4, name: "Bob Wilson", email: "bob.wilson@example.com", role: "Developer" },
    { id: 5, name: "Carol White", email: "carol.white@example.com", role: "QA Engineer" },
    { id: 6, name: "Dave Brown", email: "dave.brown@example.com", role: "Business Analyst" },
    { id: 7, name: "Eve Black", email: "eve.black@example.com", role: "UX Designer" },
    { id: 8, name: "Frank Green", email: "frank.green@example.com", role: "Backend Developer" },
    { id: 9, name: "Grace Lee", email: "grace.lee@example.com", role: "Frontend Developer" },
    { id: 10, name: "Harry Chen", email: "harry.chen@example.com", role: "DevOps Engineer" },
    { id: 11, name: "Ivy Wong", email: "ivy.wong@example.com", role: "Data Scientist" },
    { id: 12, name: "Jack Taylor", email: "jack.taylor@example.com", role: "Security Specialist" },
  ]);

  const participantsPerPage = 10;
  const pageCount = Math.ceil(participants.length / participantsPerPage);
  const paginatedParticipants = participants.slice(
    currentPage * participantsPerPage,
    (currentPage + 1) * participantsPerPage
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      projectName: "Sample Project",
      programme: "Programme A",
      description: "This is a sample project description."
    }
  });

  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission here
  };

  const addParticipant = () => {
    if (newParticipantEmail.trim() !== "") {
      const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
      const newParticipant = {
        id: newId,
        name: newParticipantEmail.split('@')[0].replace('.', ' '),
        email: newParticipantEmail,
        role: "Unassigned"
      };
      setParticipants([...participants, newParticipant]);
      setNewParticipantEmail("");
      setShowAddParticipant(false);
    }
  };

  const toggleParticipantForDeletion = (id) => {
    if (toBeDeletedParticipants.includes(id)) {
      setToBeDeletedParticipants(toBeDeletedParticipants.filter(pid => pid !== id));
    } else {
      setToBeDeletedParticipants([...toBeDeletedParticipants, id]);
    }
  };

  const selectAllParticipants = () => {
    setToBeDeletedParticipants(participants.map(p => p.id));
  };

  const clearSelectedParticipants = () => {
    setToBeDeletedParticipants([]);
  };

  const deleteSelectedParticipants = () => {
    setParticipants(participants.filter(p => !toBeDeletedParticipants.includes(p.id)));
    setToBeDeletedParticipants([]);
  };

  const deleteAllParticipants = () => {
    setParticipants([]);
    setToBeDeletedParticipants([]);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Navigation Bar */}


      {/* Page Title - Centered alignment */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Project</h1>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pencil size={16} />
          <span className="text-sm">Enable Edit</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        {/* Project Name & Number Inline */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Project Name */}
          <div>
            <label className="block font-medium text-sm mb-1 text-gray-700">Project Name</label>
            <input
              {...register("projectName", {
                required: "Project name is required",
                minLength: { value: 3, message: "Project name must be at least 3 characters" }
              })}
              type="text"
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              disabled={!isEditing}
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
            )}
          </div>
          {/* Project Number */}
          <div>
            <label className="block font-medium text-sm mb-1 text-gray-700">Project Number</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              disabled={true}
              value="123456"
              readOnly
            />
          </div>
        </div>

        {/* Project Head & Programme Inline */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Project Head */}
          <div>
            <label className="block font-medium text-sm mb-1 text-gray-700">Project Head</label>
            <input
              {...register("projectHead")}
              type="text"
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              disabled={!isEditing}
              defaultValue="John Doe"
            />
          </div>

          {/* Programme Dropdown */}
          <div>
            <label className="block font-medium text-sm mb-1 text-gray-700">Programme</label>
            <select
              {...register("programme")}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              disabled={!isEditing}
            >
              {programmes.map((programme) => (
                <option key={programme}>{programme}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Deadline */}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-1 text-gray-700">Project Deadline</label>
          <input
            {...register("deadline")}
            type="date"
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            disabled={!isEditing}
            min={new Date().toISOString().split('T')[0]}
          />
          <p className="text-sm text-gray-500 mt-1">Optional: Set a deadline for this project</p>
        </div>

        {/* Project Location */}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-2 text-gray-700">Project Location</label>
          <div className="flex flex-row gap-6">
            {locations.map((location) => (
              <label key={location} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={location}
                  {...register("location")}
                  disabled={!isEditing}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{location}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description Field */}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-1 text-gray-700">Description</label>
          <textarea
            {...register("description")}
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            rows="4"
            disabled={!isEditing}
          />
          <div className="flex justify-end mt-1">
            <Pencil size={14} className="text-gray-400" />
          </div>
        </div>

        {/* Participants Section */}
        <div className="border rounded-lg p-4 bg-gray-50 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-base">Project Participants</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm flex items-center"
                onClick={() => setShowAddParticipant(true)}
                disabled={!isEditing}
              >
                <UserPlus size={14} className="mr-1" />
                Add Participant
              </button>
            </div>
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
                  onClick={addParticipant}
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
                  <th className="w-1/4 text-left p-2 text-sm font-medium text-gray-700">Name</th>
                  <th className="w-2/5 text-left p-2 text-sm font-medium text-gray-700">Email</th>
                  <th className="w-1/4 text-left p-2 text-sm font-medium text-gray-700">Role</th>
                  <th className="w-1/12 text-right p-2 text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedParticipants.map((participant) => (
                  <tr
                    key={participant.id}
                    className={`border-b ${toBeDeletedParticipants.includes(participant.id) ? "bg-red-50" : "hover:bg-gray-50"
                      } group`}
                  >
                    <td className="p-2 text-sm">{participant.name}</td>
                    <td className="p-2 text-sm">{participant.email}</td>
                    <td className="p-2 text-sm">{participant.role}</td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => toggleParticipantForDeletion(participant.id)}
                        className={`${toBeDeletedParticipants.includes(participant.id)
                          ? "text-red-500"
                          : "text-gray-400 opacity-0 group-hover:opacity-100"
                          } transition-opacity duration-200`}
                        disabled={!isEditing}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedParticipants.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500 text-sm">
                      No participants found
                    </td>
                  </tr>
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

          {/* Deletion Controls - Show when users are selected */}
          {toBeDeletedParticipants.length > 0 && (
            <div className="mt-4 p-3 border rounded-md bg-red-50 flex justify-between items-center">
              <div>
                <span className="font-medium text-red-600 text-sm">
                  {toBeDeletedParticipants.length} participant(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1 text-gray-700 text-sm"
                  onClick={clearSelectedParticipants}
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                  onClick={selectAllParticipants}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                  onClick={deleteSelectedParticipants}
                  disabled={!isEditing}
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Delete All / Bulk Actions - Only show when no users are selected */}
          {participants.length > 0 && toBeDeletedParticipants.length === 0 && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm w-full"
                onClick={selectAllParticipants}
                disabled={!isEditing}
              >
                Delete All Participants
              </button>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="text-center mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md w-full"
            disabled={!isEditing}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectEdit;