import React, { useState, useEffect } from "react";  // Added useState import
import { useForm } from "react-hook-form";
import { ChevronLeft, Clipboard } from "lucide-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const AddLocation = () => {
  const navigate = useNavigate();  // Keep navigate initialization
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
      parentLocation: ""
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
    else {
      const role = JSON.parse(localStorage.getItem('user')).role
      console.log(role)

      if (role !== 'Superuser') {
        navigate('/login')
      }
    }
    const fetchCities = async () => {
      setLoading(true);
      try {
        console.log("SENDING");
        const response = await axios.get("http://localhost:3487/api/locations/get_cities", {
          headers: {
            token: localStorage.getItem('token')
          }
        });
        if (response.data.success === false) {
          alert("unauthorized_access")
          navigate("/login")
        }
        console.log(response);
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

      console.log("Submitting data:", {
        location_name: data.cityName,
        location_type: data.locationType,
        parent_location: data.parentLocation,
        address: data.address,
        pincode: parseInt(data.pinCode)
      });

      const response = await axios.post("http://localhost:3487/api/locations/add_location", {
        location_name: data.cityName,
        location_type: data.locationType,
        parent_location: data.parentLocation,
        address: data.address,
        pincode: parseInt(data.pinCode)
      }, {
        withCredentials: true,
        headers: {
          token: localStorage.getItem('token')
        }
      },);

      console.log("Response:", response);

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        reset();
        alert("Location added successfully!");
        navigate("/superuser/add_location");
      }
    } catch (err) {
      console.error("Error submitting data:", err);
      setError(err.response?.data?.message || "Error in submitting data.");
    } finally {
      setLoading(false);
    }
  };

  // This is the main addition - rendering a loading overlay when loading is true
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

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Page Title - Centered alignment */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Add Location</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-6 bg-gray-50 p-6 rounded-lg border">
        {/* Location Type */}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-1 text-gray-700">Location Type</label>
          <select
            {...register("locationType", { required: "Location type is required" })}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {/* <option value="">Select location type</option> */}
            <option value="" disabled selected>Select location type</option>
            <option value="office">Office</option>
            <option value="center">Center</option>
          </select>
          {errors.locationType && (
            <p className="text-red-500 text-sm mt-1">{errors.locationType.message}</p>
          )}
        </div>

        {/* City Name */}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-1 text-gray-700">Location Name</label>
          <input
            {...register("cityName", {
              required: "City name is required",
              minLength: { value: 3, message: "City name must be at least 3 characters" }
            })}
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter location name"
          />
          {errors.cityName && (
            <p className="text-red-500 text-sm mt-1">{errors.cityName.message}</p>
          )}
        </div>

        {/*Parent location*/}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-1 text-gray-700">Parent Location</label>
          <select
            {...register("parentLocation", { required: "Parent location is required" })}
            className="w-full p-2 border border-gray-300 rounded"
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

        {/* Address */}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-1 text-gray-700">Address</label>
          <textarea
            {...register("address", {
              required: "Address is required",
              minLength: { value: 10, message: "Address must be at least 10 characters" }
            })}
            className="w-full p-2 border border-gray-300 rounded"
            rows="4"
            placeholder="Enter address"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Pin Code */}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-1 text-gray-700">Pin Code</label>
          <input
            {...register("pinCode", {
              required: "Pin code is required",
              pattern: { value: /^[0-9]{6}$/, message: "Pin code must be 6 digits" }
            })}
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter pin code"
          />
          {errors.pinCode && (
            <p className="text-red-500 text-sm mt-1">{errors.pinCode.message}</p>
          )}
        </div>

        {/* Add Location Button */}
        <div className="text-center mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 mx-auto"
          >
            <Clipboard size={18} />
            Add Location
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLocation;