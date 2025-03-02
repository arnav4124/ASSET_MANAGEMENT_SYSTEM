import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";

const ProjectEdit = () => {
  const [editProjectName, setEditProjectName] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [editProgramme, setEditProgramme] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch 
  } = useForm({
    defaultValues: {
      projectName: "Sample Project",
      programme: "Programme A",
      description: "This is a sample project description."
    }
  });

  const programme = watch("programme");
  
  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission here
  };

  return (
    <div className="min-h-screen p-10">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Edit Project</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        
        {/* Project Name & Programme Inline */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Project Name */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block font-semibold text-lg">Project Name</label>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditProjectName(!editProjectName)}
              >
                <Pencil size={18} />
              </button>
            </div>
            <input
              {...register("projectName", { 
                required: "Project name is required",
                minLength: { value: 3, message: "Project name must be at least 3 characters" }
              })}
              type="text"
              className="input input-bordered w-full"
              disabled={!editProjectName}
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
            )}
          </div>

          {/* Programme Dropdown */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block font-semibold text-lg">Programme</label>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditProgramme(!editProgramme)}
              >
                <Pencil size={18} />
              </button>
            </div>
            <select
              {...register("programme", { required: "Programme is required" })}
              className="select select-bordered w-full"
              disabled={!editProgramme}
            >
              <option>Programme A</option>
              <option>Programme B</option>
              <option>Programme C</option>
            </select>
            {errors.programme && (
              <p className="text-red-500 text-sm mt-1">{errors.programme.message}</p>
            )}
          </div>

        </div>

        {/* Description Field */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="block font-semibold text-lg">Description</label>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setEditDescription(!editDescription)}
            >
              <Pencil size={18} />
            </button>
          </div>
          <textarea
            {...register("description", { 
              required: "Description is required",
              minLength: { value: 10, message: "Description must be at least 10 characters" }
            })}
            className="textarea textarea-bordered w-full"
            rows="4"
            disabled={!editDescription}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Save Button */}
        <div className="text-center mt-6">
          <button 
            type="submit" 
            className="btn btn-primary px-6"
            disabled={!editProjectName && !editDescription && !editProgramme}
          >
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProjectEdit;