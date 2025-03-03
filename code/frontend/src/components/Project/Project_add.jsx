import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from "react-hook-form";

const Project_add = () => {
  const [locations, setLocation] = useState(["bhopal", "Hoshangabad"]);
  const [programme, setProgramme] = useState(["Programme A", "Programme B", "Programme C"]);
  const [users, setUsers] = useState([
    { id: 1, name: "Jane Smith", email: "jane.smith@example.com", role: "Developer" },
    { id: 2, name: "John Doe", email: "john.doe@example.com", role: "Designer" },
    { id: 3, name: "Alice Johnson", email: "alice.johnson@example.com", role: "lead" },
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
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const participantsPerPage = 10;

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

  // Reset to first page when participants list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedParticipants.length]);

  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission here
  };

  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Function to remove a participant by index
  const removeParticipant = (index) => {
    setSelectedParticipants(prev => {
      const updatedList = [...prev];
      updatedList.splice(index, 1);
      return updatedList;
    });
  };

  return (
    <div className="min-h-screen p-10">
      {/* Page Title */}
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
            >
              <option value="">Select a programme</option>
              {programme.map((prog, index) => (
                <option key={index} value={prog}>{prog}</option>
              ))}
            </select>
            {errors.programme && (
              <p className="text-red-500 text-sm mt-1">{errors.programme.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-lg mb-1">Project Location</label>
          <div className="flex flex-row gap-10">
            {locations.map((location) => (
              <label key={location} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={location}
                  {...register("location", { required: "Location is required" })}
                  className="checkbox"
                />
                {location}
              </label>
            ))}
          </div>
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
          )}
        </div>
        
        {/* Project Manager */}
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
          <button type="submit" className="btn btn-primary px-6 py-2">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default Project_add;