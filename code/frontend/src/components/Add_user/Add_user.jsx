import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, ChevronLeft, Check, Loader2 } from "lucide-react";

const AddEmployee = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
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
      role: "",
      notes: ""
    }
  });

  const onSubmit = (data) => {
    setIsSubmitting(true);
    console.log("Employee data submitted:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        reset(); // Reset the form after submission
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with shadow and subtle gradient */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Add Employee</h1>
              <p className="text-gray-500 mt-1">Enter employee details to add them to the system</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <UserPlus size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Success message with animation */}
        {showSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-md animate-fadeIn">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Check size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Employee added successfully!</p>
                <p className="text-green-600 text-sm">The employee has been added to the system.</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          {/* Form Sections */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Personal Information</h2>
            
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* First Name */}
              <div className="transition-all duration-200">
                <label className="block font-medium text-sm mb-1 text-gray-700">First Name</label>
                <input
                  {...register("firstName", { 
                    required: "First name is required",
                    minLength: { value: 2, message: "First name must be at least 2 characters" }
                  })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.firstName.message}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div className="transition-all duration-200">
                <label className="block font-medium text-sm mb-1 text-gray-700">Last Name</label>
                <input
                  {...register("lastName", { 
                    required: "Last name is required",
                    minLength: { value: 2, message: "Last name must be at least 2 characters" }
                  })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-2">Contact Information</h2>
            
            {/* Email & Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Email */}
              <div className="transition-all duration-200">
                <label className="block font-medium text-sm mb-1 text-gray-700">Email Address</label>
                <input
                  {...register("email", { 
                    required: "Email is required",
                    pattern: { 
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                      message: "Invalid email address" 
                    }
                  })}
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="example@company.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.email.message}</p>
                )}
              </div>
              
              {/* Phone Number */}
              <div className="transition-all duration-200">
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-2">Role Information</h2>
            
            {/* Manager & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Manager Dropdown */}
              <div className="transition-all duration-200">
                <label className="block font-medium text-sm mb-1 text-gray-700">Manager</label>
                <div className="relative">
                  <select
                    {...register("manager", { 
                      required: "Please select a manager" 
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  >
                    <option value="">Select a manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.manager && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.manager.message}</p>
                )}
              </div>
              
              {/* Role Dropdown */}
              <div className="transition-all duration-200">
                <label className="block font-medium text-sm mb-1 text-gray-700">Role</label>
                <div className="relative">
                  <select
                    {...register("role", { 
                      required: "Please select a role" 
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.role.message}</p>
                )}
              </div>
            </div>

            {/* Additional Notes (Optional) */}
            <div className="mb-6">
              <label className="block font-medium text-sm mb-1 text-gray-700">Additional Notes <span className="text-gray-400 text-xs">(Optional)</span></label>
              <textarea
                {...register("notes")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                rows="3"
                placeholder="Enter any additional information about the employee"
              ></textarea>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 p-6 flex justify-end border-t">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 mr-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-all duration-200"
            >
              Reset
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>

        {/* Navigation Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mx-auto transition-all duration-200"
            onClick={() => window.history.back()}
          >
            <ChevronLeft size={16} />
            <span className="text-sm">Back to Employee List</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;