import React from "react";
import { useForm } from "react-hook-form";
import { ChevronLeft, Clipboard } from "lucide-react";

const AddLocation = () => {
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
      cityName: ""
    }
  });

  const onSubmit = (data) => {
    console.log("Location data submitted:", data);
    // Here you would typically send the data to an API
    alert("Location added successfully!");
    reset(); // Reset the form after submission
  };

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
            <option value="">Select location type</option>
            <option value="office">Office</option>
            <option value="center">Center</option>
          </select>
          {errors.locationType && (
            <p className="text-red-500 text-sm mt-1">{errors.locationType.message}</p>
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

        {/* City Name */}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-1 text-gray-700">City Name</label>
          <input
            {...register("cityName", { 
              required: "City name is required",
              minLength: { value: 3, message: "City name must be at least 3 characters" }
            })}
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter city name"
          />
          {errors.cityName && (
            <p className="text-red-500 text-sm mt-1">{errors.cityName.message}</p>
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