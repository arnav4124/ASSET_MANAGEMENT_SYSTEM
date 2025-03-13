import React from "react";
import { useForm } from "react-hook-form";
import { ChevronLeft, Clipboard, Check } from "lucide-react";
import axios from "axios";

const AddProgramme = () => {
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

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/api/programmes", {
        name: data.programmeName,
        programme_type: data.type,
        programmes_description: data.description
      });

      if (response.status === 201) {
        alert("Programme added successfully!");
        reset();
      }
    } catch (error) {
      console.error("Error adding programme:", error);
      alert("Failed to add programme. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Page Title - Centered alignment */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Add Programme</h1>

      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-6 bg-gray-50 p-6 rounded-lg border">
        {/* Programme Name */}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-1 text-gray-700">Programme Name</label>
          <input
            {...register("programmeName", {
              required: "Programme name is required",
              minLength: { value: 3, message: "Programme name must be at least 3 characters" }
            })}
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter programme name"
          />
          {errors.programmeName && (
            <p className="text-red-500 text-sm mt-1">{errors.programmeName.message}</p>
          )}
        </div>

        {/* Programme Description */}
        <div className="mb-4">
          <label className="block font-medium text-sm mb-1 text-gray-700">Description</label>
          <textarea
            {...register("description", {
              required: "Programme description is required",
              minLength: { value: 10, message: "Description must be at least 10 characters" }
            })}
            className="w-full p-2 border border-gray-300 rounded"
            rows="6"
            placeholder="Enter programme description and details..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
          <div className="flex justify-end mt-1 text-gray-400 text-xs">
            <span>Provide a detailed description of the programme objectives and scope</span>
          </div>
        </div>

        {/* Additional Fields Section */}
        <div className="border rounded-lg p-4 bg-white mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-base">Additional Information</h2>
          </div>

          {/* Programme Duration */}
          <div className="grid grid-cols-2 gap-6 mb-4">



            {/* Programme Type */}
            <div>
              <label className="block font-medium text-sm mb-1 text-gray-700">Programme Type</label>
              <select
                {...register("type")}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select type</option>
                <option value="research">Research</option>
                <option value="development">Development</option>
                <option value="innovation">Innovation</option>
                <option value="education">Education</option>
                <option value="community">Community</option>
              </select>
            </div>
          </div>

          {/* Programme Categories - Checkboxes */}

        </div>

        {/* Add Programme Button */}
        <div className="text-center mt-6">
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 mx-auto"
          >
            <Clipboard size={18} />
            Add Programme
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProgramme;