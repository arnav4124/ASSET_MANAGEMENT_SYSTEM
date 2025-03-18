import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, ChevronLeft, Loader2, Clipboard, Check } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddProgramme = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      programmeName: "",
      description: "",
      type: ""
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const role = JSON.parse(localStorage.getItem("user")).role;
      if (role !== "Superuser") {
        navigate("/login");
      }
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await axios.post("http://localhost:3487/api/programmes", {
        name: data.programmeName,
        programme_type: data.type,
        programmes_description: data.description,
        token: localStorage.getItem('token')
      });

      if (response.status === 201) {
        setSuccess(true);
        reset();
        setTimeout(() => {
          navigate("/superuser/view_programme");
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding programme:", error);
      let errorMessage = "Failed to add programme. ";

      if (error.response) {
        errorMessage += error.response.data.message || error.response.data.error || '';
      } else if (error.request) {
        errorMessage += "No response from server. Please check if the server is running.";
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Add Programme</h1>
              <p className="text-gray-500 mt-1">Enter programme details to add to the system</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Clipboard size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-md animate-fadeIn">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Check size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Programme added successfully!</p>
                <p className="text-green-600 text-sm">Redirecting to programmes list...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-6">
            {/* Basic Information */}
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Basic Information</h2>

            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* Programme Name */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Programme Name</label>
                <input
                  {...register("programmeName", {
                    required: "Programme name is required",
                    minLength: { value: 3, message: "Programme name must be at least 3 characters" }
                  })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter programme name"
                  disabled={loading}
                />
                {errors.programmeName && (
                  <p className="text-red-500 text-sm mt-1">{errors.programmeName.message}</p>
                )}
              </div>

              {/* Programme Description */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Description</label>
                <textarea
                  {...register("description", {
                    required: "Programme description is required",
                    minLength: { value: 10, message: "Description must be at least 10 characters" }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  rows="6"
                  placeholder="Enter programme description and details..."
                  disabled={loading}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
                <div className="flex justify-end mt-1 text-gray-400 text-xs">
                  <span>Provide a detailed description of the programme objectives and scope</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Additional Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Programme Type */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Programme Type</label>
                <select
                  {...register("type", { required: "Programme type is required" })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  disabled={loading}
                >
                  <option value="">Select type</option>
                  <option value="research">Research</option>
                  <option value="development">Development</option>
                  <option value="innovation">Innovation</option>
                  <option value="education">Education</option>
                  <option value="community">Community</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4 border-t">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Adding Programme...
                </>
              ) : (
                'Add Programme'
              )}
            </button>
          </div>
        </form>

        {/* Navigation Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/superuser/view_programme')}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mx-auto transition-all duration-200"
          >
            <ChevronLeft size={16} />
            <span className="text-sm">Back to Programmes List</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProgramme;