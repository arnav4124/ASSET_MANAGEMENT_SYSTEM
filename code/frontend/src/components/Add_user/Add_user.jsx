import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, ChevronLeft, Check } from "lucide-react";

const AddEmployee = () => {
  // Sample data for managers and roles dropdowns
  const managers = [
    { id: 1, name: "Jane Smith" },
    { id: 2, name: "John Doe" },
    { id: 3, name: "Alice Johnson" },
    { id: 4, name: "Bob Wilson" },
  ];

  const roles = [
    "Developer",
    "Designer",
    "Project Manager",
    "QA Engineer",
    "Business Analyst",
    "UX Designer",
    "DevOps Engineer",
    "Data Scientist",
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      manager: "",
      role: ""
    }
  });

  const onSubmit = (data) => {
    console.log("Employee data submitted:", data);
    // Here you would typically send the data to an API
    alert("Employee added successfully!");
    reset(); // Reset the form after submission
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Page Title - Centered alignment */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Add Employee</h1>
        {/* <button
          type="button"
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
          onClick={() => window.history.back()}
        >
          <ChevronLeft size={16} />
          <span className="text-sm">Back to Employee List</span>
        </button> */}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-6 bg-gray-50 p-6 rounded-lg border">
        {/* First Name & Last Name Inline */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* First Name */}
          <div>
            <label className="block font-medium text-sm mb-1 text-gray-700">First Name</label>
            <input
              {...register("firstName", { 
                required: "First name is required",
                minLength: { value: 2, message: "First name must be at least 2 characters" }
              })}
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>
          
          {/* Last Name */}
          <div>
            <label className="block font-medium text-sm mb-1 text-gray-700">Last Name</label>
            <input
              {...register("lastName", { 
                required: "Last name is required",
                minLength: { value: 2, message: "Last name must be at least 2 characters" }
              })}
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email & Phone Number Inline */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Email */}
          <div>
            <label className="block font-medium text-sm mb-1 text-gray-700">Email</label>
            <input
              {...register("email", { 
                required: "Email is required",
                pattern: { 
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                  message: "Invalid email address" 
                }
              })}
              type="email"
              className="w-full p-2 border border-gray-300 rounded"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          {/* Phone Number */}
          <div>
            <label className="block font-medium text-sm mb-1 text-gray-700">Phone Number</label>
            <input
              {...register("phoneNumber", { 
                required: "Phone number is required",
                pattern: { 
                  value: /^[0-9+\-\s()]{7,15}$/, 
                  message: "Invalid phone number" 
                }
              })}
              type="tel"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., +1 (555) 123-4567"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>
        </div>

        {/* Manager & Role Inline */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Manager Dropdown */}
          <div>
            <label className="block font-medium text-sm mb-1 text-gray-700">Manager</label>
            <select
              {...register("manager", { 
                required: "Please select a manager" 
              })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select a manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
            {errors.manager && (
              <p className="text-red-500 text-sm mt-1">{errors.manager.message}</p>
            )}
          </div>
          
          {/* Role Dropdown */}
          <div>
            <label className="block font-medium text-sm mb-1 text-gray-700">Role</label>
            <select
              {...register("role", { 
                required: "Please select a role" 
              })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>
        </div>

        {/* Additional Notes (Optional) */}
       

        {/* Add Employee Button */}
        <div className="text-center mt-6">
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 mx-auto"
          >
            <UserPlus size={18} />
            Add Employee
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;