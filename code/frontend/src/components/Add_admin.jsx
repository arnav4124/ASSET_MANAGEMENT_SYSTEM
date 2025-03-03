import React from "react";
import { useForm } from "react-hook-form";
import { UserPlus, ChevronLeft } from "lucide-react";

const AssignAdmin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: ""
    }
  });

  const onSubmit = (data) => {
    console.log("Admin data submitted:", data);
    // Here you would typically send the data to an API
    alert("Admin assigned successfully!");
    reset(); // Reset the form after submission
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Page Title - Centered alignment */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Assign Admin</h1>
       
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-6 bg-gray-50 p-6 rounded-lg border">
        {/* First Name */}
        <div className="mb-4">
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
        <div className="mb-4">
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

        {/* Email */}
        <div className="mb-4">
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

        {/* Assign as Admin Button */}
        <div className="text-center mt-6">
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 mx-auto"
          >
            <UserPlus size={18} />
            Assign as Admin
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignAdmin;