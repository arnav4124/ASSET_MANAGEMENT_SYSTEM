import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, ChevronLeft, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const AssignAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(true);

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
      setIsSubmitting(false);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with shadow and subtle gradient */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Assign Admin</h1>
              <p className="text-gray-500 mt-1">Add a new administrator to the system</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <UserPlus size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Success message with animation */}
        {success && (
          <div className={`bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-md animate-fadeIn transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Check size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Admin assigned successfully!</p>
                <p className="text-green-600 text-sm">The new admin has been added to the system.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <p className="text-red-700">{error}</p>
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
                  disabled={loading}
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
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
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
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 p-6 flex justify-end border-t">
            <button
              type="button"
              onClick={() => {
                reset();
                navigate('/admin/view_users');
              }}
              className="px-4 py-2 mr-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Assign as Admin
                </>
              )}
            </button>
          </div>
        </form>

        {/* Navigation Link */}
       
      </div>
    </div>
  );
};

export default AssignAdmin;