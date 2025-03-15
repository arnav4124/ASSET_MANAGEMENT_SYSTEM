import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, ChevronLeft } from "lucide-react";
import axios from "axios";

const AssignAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);

  // Effect to handle success message timeout
  useEffect(() => {
    if (success) {
      // Start fade out after 4 seconds
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 4000);

      // Clear success message after 5 seconds
      const clearTimer = setTimeout(() => {
        setSuccess(null);
        setFadeOut(false);
      }, 5000);

      // Cleanup timers
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [success]);

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

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setFadeOut(false);

      const response = await axios.post(
        'http://localhost:3487/api/add_admin/assign',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
          }
        }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        reset();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while assigning admin role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Page Title - Centered alignment */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Assign Admin</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div
            className={`bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'
              }`}
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
          </div>
        )}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Assign as Admin Button */}
        <div className="text-center mt-6">
          <button
            type="submit"
            className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 mx-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? 'Assigning...' : 'Assign as Admin'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignAdmin;