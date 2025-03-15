import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { Navigate } from "react-router-dom";


const Asset_add = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }else{
      const role = JSON.parse(localStorage.getItem("user")).role;
      console.log("Role:", role);
      if (role !== "Admin") {
        navigate("/login");
      }
    }
      
    const fetchData = async () => {
      try {
        const usersRes = await axios.get("http://localhost:3487/api/users", {
          withCredentials: true,
          headers: {
            token: localStorage.getItem("token")
          }
        });
        console.log("Users response:", usersRes.data);
        setUsers(usersRes.data);

        const projectsRes = await axios.get("http://localhost:3487/api/projects", { 
          withCredentials: true,
          headers: {
            token: localStorage.getItem("token")
          }
        });
        console.log("Projects response:", projectsRes.data);
        setProjects(projectsRes.data);
      } catch (error) {
        console.error("Error fetching users and projects:", error);
      }
    };
    fetchData();
    console.log("Projects:", projects);
    console.log("Users:", users);
  }, []);

  const adminUsers = users.filter((u) => u.role === "Admin");


  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  // Track whether the asset is Physical or Virtual
  const [assetType, setAssetType] = useState("physical");

  // Track whether asset is assigned to a Project or Individual
  const [assignedTo, setAssignedTo] = useState("project");

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.assetName);
    formData.append("Serial_number", data.serialNumber);
    formData.append("asset_type", data.assetType);
    formData.append("status", data.status);
    formData.append("Office", data.office);
    formData.append("assignment_status", data.assignmentStatus ? "true" : "false");
    formData.append("Sticker_seq", data.stickerSeq);
    if (data.imageFile && data.imageFile.length > 0) {
      formData.append("Img", data.imageFile[0]);
    }
    formData.append("description", data.description);
    formData.append("Invoice_id", data.invoiceId);
    formData.append("Issued_by", data.issuedBy);
    // For simplicity, just insert the user/project ID or name:
    formData.append("Issued_to", data.assignedToUser || "");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      const response = await axios.post("http://localhost:3487/api/assets/add-asset", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      if (response.status === 200) {
        alert("Asset added successfully");
      }

    } catch (error) {
      console.error("Error adding asset:", error);
    }
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

        {/* Serial Number */}
        <div>
          <label className="block font-semibold text-lg mb-1">Serial Number</label>
          <input
            {...register("serialNumber", { required: "Serial number is required" })}
            type="text"
            className="input input-bordered w-full"
          />
          {errors.serialNumber && <p className="text-red-500 text-sm mt-1">{errors.serialNumber.message}</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block font-semibold text-lg mb-1">Status</label>
          <input
            {...register("status", { required: "Status is required" })}
            type="text"
            className="input input-bordered w-full"
          />
          {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
        </div>

        {/* Office */}
        <div>
          <label className="block font-semibold text-lg mb-1">Office</label>
          <input
            {...register("office", { required: "Office is required" })}
            type="text"
            className="input input-bordered w-full"
          />
          {errors.office && <p className="text-red-500 text-sm mt-1">{errors.office.message}</p>}
        </div>

        {/* Issued By */}
        <div>
          <label className="block font-semibold text-lg mb-1">Issued By</label>
          <select
            {...register("issuedBy", { required: "Issued By is required" })}
            className="select select-bordered w-full"
          >
            <option value="">Select Admin</option>
            {adminUsers.map((admin) => (
              <option key={admin._id} value={admin._id}>
                {admin.first_name} {admin.last_name} ({admin.email})
              </option>
            ))}
          </select>
          {errors.issuedBy && <p className="text-red-500 text-sm mt-1">{errors.issuedBy.message}</p>}
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

        {/* Upload Invoice
        <div>
          <label className="block font-semibold text-lg mb-1">Upload Invoice</label>
          <input {...register("invoiceFile")} type="file" className="file-input file-input-bordered w-full" />
        </div> */}

        {/* Assigned To */}
        <div>
          <label className="block font-semibold text-lg mb-1">Assign Asset To (User)</label>
          <select
            {...register("assignedToUser", { required: "Please select a user" })}
            className="select select-bordered w-full"
          >
            <option value="">Select a user</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.first_name} {u.last_name} ({u.email})
              </option>
            ))}
          </select>
          {errors.assignedToUser && <p className="text-red-500">{errors.assignedToUser.message}</p>}
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

        {/* Assignment Status */}
        <div>
          <label className="block font-semibold text-lg mb-1">Assignment Status</label>
          <input
            {...register("assignmentStatus")}
            type="checkbox"
            className="checkbox"
          />
        </div>

        {/* Sticker Sequence */}
        <div>
          <label className="block font-semibold text-lg mb-1">Sticker Sequence</label>
          <input
            {...register("stickerSeq", { required: "Sticker sequence is required" })}
            type="text"
            className="input input-bordered w-full"
          />
          {errors.stickerSeq && <p className="text-red-500 text-sm mt-1">{errors.stickerSeq.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-lg mb-1">Description</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            className="textarea textarea-bordered w-full"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Invoice ID */}
        <div>
          <label className="block font-semibold text-lg mb-1">Invoice ID</label>
          <input
            {...register("invoiceId")}
            type="text"
            className="input input-bordered w-full"
          />
          {errors.invoiceId && <p className="text-red-500 text-sm mt-1">{errors.invoiceId.message}</p>}
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