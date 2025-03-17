import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, ChevronLeft, Loader2, Upload, Check } from "lucide-react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const Asset_add = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const role = JSON.parse(localStorage.getItem("user")).role;
      if (role !== "Admin") {
        navigate("/login");
      }
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const usersRes = await axios.get("http://localhost:3487/api/user", {
          withCredentials: true,
          headers: { token: localStorage.getItem("token") }
        });
        setUsers(usersRes.data);

        const projectsRes = await axios.get("http://localhost:3487/api/projects", {
          withCredentials: true,
          headers: { token: localStorage.getItem("token") }
        });
        setProjects(projectsRes.data);

        const categoriesRes = await axios.get("http://localhost:3487/api/categories", {
          withCredentials: true,
          headers: { token: localStorage.getItem("token") }
        });
        setCategories(categoriesRes.data);

        const officesRes = await axios.get("http://localhost:3487/api/locations?type=office", {
          withCredentials: true,
          headers: { token: localStorage.getItem("token") }
        });
        setOffices(officesRes.data);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching required data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const adminUsers = users.filter((u) => u.role === "Admin");

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [assetType, setAssetType] = useState("physical");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);

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
    formData.append("Issued_to", data.assignedToUser || "");

    try {
      const response = await axios.post("http://localhost:3487/api/assets/add-asset", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      if (response.status === 200) {
        setShowSuccess(true);
        reset();
        setTimeout(() => {
          navigate("/admin/assets");
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding asset:", error);
      setError("Failed to add asset. Please try again.");
    } finally {
      setIsSubmitting(false);
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
              <h1 className="text-2xl font-bold text-gray-800">Add Asset</h1>
              <p className="text-gray-500 mt-1">Enter asset details to add to the system</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Box size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-md animate-fadeIn">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Check size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Asset added successfully!</p>
                <p className="text-green-600 text-sm">The asset has been added to the system.</p>
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
              {/* Asset Name */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Asset Name</label>
                <input
                  {...register("assetName", { required: "Asset name is required" })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter asset name"
                />
                {errors.assetName && (
                  <p className="text-red-500 text-sm mt-1">{errors.assetName.message}</p>
                )}
              </div>

              {/* Serial Number */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Serial Number</label>
                <input
                  {...register("serialNumber", { required: "Serial number is required" })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter serial number"
                />
                {errors.serialNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.serialNumber.message}</p>
                )}
              </div>
            </div>

            {/* Asset Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Asset Type */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Asset Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="physical"
                      {...register("assetType", { required: "Please select asset type" })}
                      checked={assetType === "physical"}
                      onChange={() => setAssetType("physical")}
                      className="form-radio text-blue-500"
                    />
                    <span>Physical</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="virtual"
                      {...register("assetType")}
                      checked={assetType === "virtual"}
                      onChange={() => setAssetType("virtual")}
                      className="form-radio text-blue-500"
                    />
                    <span>Virtual</span>
                  </label>
                </div>
                {errors.assetType && (
                  <p className="text-red-500 text-sm mt-1">{errors.assetType.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Status</label>
                <select
                  {...register("status", { required: "Status is required" })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                >
                  <option value="">Select Status</option>
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Location Information */}
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Location Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Office */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Office</label>
                <select
                  {...register("office", { required: "Office is required" })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                >
                  <option value="">Select Office</option>
                  {offices.map((office) => (
                    <option key={office._id} value={office.location_name}>
                      {office.location_name}
                    </option>
                  ))}
                </select>
                {errors.office && (
                  <p className="text-red-500 text-sm mt-1">{errors.office.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Category</label>
                <select
                  {...register("category")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.category_name}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Asset Details */}
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Asset Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Price */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Price</label>
                <input
                  {...register("price", { required: "Price is required" })}
                  type="number"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter price"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              {/* Sticker Sequence */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Sticker Sequence</label>
                <input
                  {...register("stickerSeq", { required: "Sticker sequence is required" })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter sticker sequence"
                />
                {errors.stickerSeq && (
                  <p className="text-red-500 text-sm mt-1">{errors.stickerSeq.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block font-medium text-sm mb-1 text-gray-700">Description</label>
              <textarea
                {...register("description", { required: "Description is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                rows="4"
                placeholder="Enter asset description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Assignment Information */}
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Assignment Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Issued By */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Issued By</label>
                <select
                  {...register("issuedBy", { required: "Issued By is required" })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                >
                  <option value="">Select Admin</option>
                  {adminUsers.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.first_name} {admin.last_name} ({admin.email})
                    </option>
                  ))}
                </select>
                {errors.issuedBy && (
                  <p className="text-red-500 text-sm mt-1">{errors.issuedBy.message}</p>
                )}
              </div>

              {/* Invoice ID */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Invoice ID</label>
                <input
                  {...register("invoiceId")}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter invoice ID"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block font-medium text-sm mb-1 text-gray-700">Upload Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input {...register("imageFile")} type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
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
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Adding Asset...
                </>
              ) : (
                'Add Asset'
              )}
            </button>
          </div>
        </form>

        {/* Navigation Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/admin/assets')}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mx-auto transition-all duration-200"
          >
            <ChevronLeft size={16} />
            <span className="text-sm">Back to Assets List</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Asset_add;