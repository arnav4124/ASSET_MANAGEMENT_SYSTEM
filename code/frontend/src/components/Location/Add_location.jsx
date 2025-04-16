import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, ChevronLeft, Loader2, Clipboard, Check } from "lucide-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const AddLocation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cities, setCities] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      locationType: "",
      address: "",
      pinCode: "",
      cityName: "",
      parentLocation: "",
      sticker_short_seq: ""
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
    else {
      const role = JSON.parse(localStorage.getItem('user')).role
      if (role !== 'Superuser') {
        navigate('/login')
      }
    }
    const fetchCities = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3487/api/locations/get_cities", {
          headers: {
            token: localStorage.getItem('token')
          }
        });
        if (response.data.success === false) {
          alert("unauthorized_access")
          navigate("/login")
        }
        setCities(response.data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await axios.post("http://localhost:3487/api/locations/add_location", {
        location_name: data.cityName,
        location_type: data.locationType,
        parent_location: data.parentLocation,
        address: data.address,
        pincode: parseInt(data.pinCode),
        sticker_short_seq: data.sticker_short_seq
      }, {
        withCredentials: true,
        headers: {
          token: localStorage.getItem('token')
        }
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        reset();
        setTimeout(() => {
          navigate("/superuser/view_location");
        }, 2000);
      }
    } catch (err) {
      console.error("Error submitting data:", err);
      setError(err.response?.data?.message || "Error in submitting data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-white text-xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading...</p>
          <p className="text-sm text-gray-300 mt-2">Please wait while we fetch the data</p>
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
              <h1 className="text-2xl font-bold text-gray-800">Add Location</h1>
              <p className="text-gray-500 mt-1">Enter location details to add to the system</p>
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
                <p className="font-medium text-green-800">Location added successfully!</p>
                <p className="text-green-600 text-sm">Redirecting to locations list...</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Location Type */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Location Type</label>
                <select
                  {...register("locationType", { required: "Location type is required" })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  disabled={loading}
                >
                  <option value="" disabled selected>Select location type</option>
                  <option value="office">Office</option>
                  <option value="center">Center</option>
                </select>
                {errors.locationType && (
                  <p className="text-red-500 text-sm mt-1">{errors.locationType.message}</p>
                )}
              </div>

              {/* Location Name */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Location Name</label>
                <input
                  {...register("cityName", {
                    required: "Location name is required",
                    minLength: { value: 3, message: "Location name must be at least 3 characters" }
                  })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter location name"
                  disabled={loading}
                />
                {errors.cityName && (
                  <p className="text-red-500 text-sm mt-1">{errors.cityName.message}</p>
                )}
              </div>
            </div>

            {/* Location Details */}
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Location Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Parent Location */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Parent Location</label>
                <select
                  {...register("parentLocation", { required: "Parent location is required" })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  disabled={loading}
                >
                  <option value="" disabled selected>Select Parent location</option>
                  {cities && cities.length > 0 ? (
                    cities.map((city, index) => (
                      <option key={index} value={city._id}>
                        {city.location_name}
                      </option>
                    ))
                  ) : (
                    <option value="">No locations available</option>
                  )}
                </select>
                {errors.parentLocation && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentLocation.message}</p>
                )}
              </div>

              {/* Pin Code */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Pin Code</label>
                <input
                  {...register("pinCode", {
                    required: "Pin code is required",
                    pattern: { value: /^[0-9]{6}$/, message: "Pin code must be 6 digits" }
                  })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter pin code"
                  disabled={loading}
                />
                {errors.pinCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.pinCode.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <label className="block font-medium text-sm mb-1 text-gray-700">Address</label>
              <textarea
                {...register("address", {
                  required: "Address is required",
                  minLength: { value: 10, message: "Address must be at least 10 characters" }
                })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                rows="4"
                placeholder="Enter complete address"
                disabled={loading}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
              <div className="flex justify-end mt-1 text-gray-400 text-xs">
                <span>Provide a detailed address of the location</span>
              </div>
            </div>

            {/* Additional Information */}
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Additional Information</h2>
            
            <div className="mb-6">
              <label className="block font-medium text-sm mb-1 text-gray-700">Sticker Sequence</label>
              <input
                {...register("sticker_short_seq", {
                  required: "Sticker sequence is required",
                  minLength: { value: 3, message: "Sticker sequence must be at least 3 characters" },
                  maxLength: { value: 3, message: "Sticker sequence must be at most 3 characters" }
                })}
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                placeholder="Enter sticker sequence (3 characters)"
                disabled={loading}
              />
              {errors.sticker_short_seq && (
                <p className="text-red-500 text-sm mt-1">{errors.sticker_short_seq.message}</p>
              )}
              <div className="flex justify-end mt-1 text-gray-400 text-xs">
                <span>3-character code used for location identification</span>
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
                  Adding Location...
                </>
              ) : (
                'Add Location'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocation;