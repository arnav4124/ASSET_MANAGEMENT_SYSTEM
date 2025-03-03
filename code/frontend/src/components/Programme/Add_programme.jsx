import React from "react";
import { useForm } from "react-hook-form";
import { ChevronLeft, Clipboard, Check } from "lucide-react";

const AddProgramme = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      programmeName: "",
      description: ""
    }
  });

  const onSubmit = (data) => {
    console.log("Programme data submitted:", data);
    // Here you would typically send the data to an API
    alert("Programme added successfully!");
    reset(); // Reset the form after submission
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Page Title - Centered alignment */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Add Programme</h1>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
          onClick={() => window.history.back()}
        >
          <ChevronLeft size={16} />
          <span className="text-sm">Back to Programmes List</span>
        </button>
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
            <div>
              <label className="block font-medium text-sm mb-1 text-gray-700">Expected Duration</label>
              <select
                {...register("duration")}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select duration</option>
                <option value="3months">3 months</option>
                <option value="6months">6 months</option>
                <option value="1year">1 year</option>
                <option value="2years">2 years</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
            
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
          <div className="mb-4">
            <label className="block font-medium text-sm mb-2 text-gray-700">Programme Categories</label>
            <div className="flex flex-wrap gap-6">
              {["Technology", "Health", "Education", "Environment", "Social"].map((category) => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={category}
                    {...register("categories")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Add Programme Button */}
        <div className="text-center mt-6">
          <button 
            type="submit" 
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