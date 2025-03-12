//// filepath: /home/mrudani/dass-spring-2025-project-team-3/code/frontend/src/components/Asset/Asset_add.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const Asset_add = () => {
  // Hardcoded lists (Projects, their heads, and users)
  const [projects] = useState([
    { id: 1, name: "Project Alpha", head: "Alice Johnson" },
    { id: 2, name: "Project Beta", head: "Bob Smith" },
    { id: 3, name: "Project Gamma", head: "Charlie Davis" },
  ]);

  const [users] = useState([
    { id: 1, name: "Jane Smith" },
    { id: 2, name: "John Doe" },
    { id: 3, name: "Alice Johnson" },
    { id: 4, name: "Bob Wilson" },
  ]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  // Track whether the asset is Physical or Virtual
  const [assetType, setAssetType] = useState("physical");

  // Track whether asset is assigned to a Project or Individual
  const [assignedTo, setAssignedTo] = useState("project");

  const onSubmit = (data) => {
    console.log("Form data:", data);
    // Handle form logic here
  };

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Add Asset</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        {/* Physical / Virtual */}
        <div>
          <label className="block font-semibold text-lg mb-1">Asset Type</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="physical"
                {...register("assetType", { required: true })}
                checked={assetType === "physical"}
                onChange={() => setAssetType("physical")}
              />
              Physical
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="virtual"
                {...register("assetType", { required: true })}
                checked={assetType === "virtual"}
                onChange={() => setAssetType("virtual")}
              />
              Virtual
            </label>
          </div>
          {errors.assetType && <p className="text-red-500 text-sm mt-1">Please select asset type.</p>}
        </div>

        {/* Asset Name */}
        <div>
          <label className="block font-semibold text-lg mb-1">Asset Name</label>
          <input
            {...register("assetName", { required: "Asset name is required" })}
            type="text"
            className="input input-bordered w-full"
          />
          {errors.assetName && (
            <p className="text-red-500 text-sm mt-1">{errors.assetName.message}</p>
          )}
        </div>

        {/* Issued By */}
        <div>
          <label className="block font-semibold text-lg mb-1">Issued By</label>
          <input
            {...register("issuedBy", { required: "Issued By is required" })}
            type="text"
            className="input input-bordered w-full"
          />
          {errors.issuedBy && (
            <p className="text-red-500 text-sm mt-1">{errors.issuedBy.message}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block font-semibold text-lg mb-1">Price</label>
          <input
            {...register("price", { required: "Price is required" })}
            type="number"
            step="0.01"
            className="input input-bordered w-full"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Upload Image */}
        <div>
          <label className="block font-semibold text-lg mb-1">Upload Image</label>
          <input {...register("imageFile")} type="file" className="file-input file-input-bordered w-full" />
        </div>

        {/* Upload Invoice */}
        <div>
          <label className="block font-semibold text-lg mb-1">Upload Invoice</label>
          <input {...register("invoiceFile")} type="file" className="file-input file-input-bordered w-full" />
        </div>

        {/* Assigned To */}
        <div>
          <label className="block font-semibold text-lg mb-1">Assign Asset To</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="project"
                {...register("assignedTo", { required: true })}
                checked={assignedTo === "project"}
                onChange={() => setAssignedTo("project")}
              />
              Project
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="individual"
                {...register("assignedTo", { required: true })}
                checked={assignedTo === "individual"}
                onChange={() => setAssignedTo("individual")}
              />
              Individual
            </label>
          </div>
          {errors.assignedTo && <p className="text-red-500 text-sm mt-1">Please select an assignment.</p>}
        </div>

        {/* Issued To (Project or Individual) */}
        <div>
          <label className="block font-semibold text-lg mb-1">Issued To</label>
          {assignedTo === "project" ? (
            <select
              {...register("issuedToProject", { required: assignedTo === "project" })}
              className="select select-bordered w-full"
            >
              <option value="">Select a project</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.name}>{proj.name} (Head: {proj.head})</option>
              ))}
            </select>
          ) : (
            <select
              {...register("issuedToIndividual", { required: assignedTo === "individual" })}
              className="select select-bordered w-full"
            >
              <option value="">Select a user</option>
              {users.map((u) => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block font-semibold text-lg mb-1">Category</label>
          <input
            {...register("category", { required: "Category is required" })}
            type="text"
            className="input input-bordered w-full"
          />
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button type="submit" className="btn btn-primary px-6 py-2">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default Asset_add;