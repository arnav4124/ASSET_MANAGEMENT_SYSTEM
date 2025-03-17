import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, ChevronLeft, Loader2, Upload, Check, Plus, Trash2 } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);
  const [serialNumbers, setSerialNumbers] = useState(['']);
  const [uploadedFiles, setUploadedFiles] = useState({
    imageFile: null,
    invoicePdf: null,
    additionalPdf: null
  });

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

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value) || 1;
    setQuantity(newQuantity);
    setSerialNumbers(Array(newQuantity).fill(''));
  };

  const handleSerialNumberChange = (index, value) => {
    const newSerialNumbers = [...serialNumbers];
    newSerialNumbers[index] = value;
    setSerialNumbers(newSerialNumbers);
  };

  const handleFileUpload = (file, type) => {
    if (file && file[0]) {
      setUploadedFiles(prev => ({
        ...prev,
        [type]: file[0]
      }));
    }
  };

  const handleFileRemove = (type) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);

    try {
      console.log('Submitting form data:', data);
      console.log('Serial numbers:', serialNumbers);

      // Validate serial numbers
      if (serialNumbers.some(sn => !sn)) {
        throw new Error('All serial numbers must be filled');
      }

      // Validate required fields
      const requiredFields = {
        assetName: 'Asset Name',
        brand_name: 'Brand Name',
        brand: 'Brand',
        assetType: 'Asset Type',
        status: 'Status',
        office: 'Office',
        stickerSeq: 'Sticker Sequence',
        description: 'Description',
        vendor_name: 'Vendor Name',
        vendor_email: 'Vendor Email',
        vendor_phone: 'Vendor Phone',
        vendor_city: 'Vendor City',
        vendor_address: 'Vendor Address',
        price: 'Price'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !data[key])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const formData = new FormData();
      formData.append("name", data.assetName);
      formData.append("brand_name", data.brand_name);
      formData.append("brand", data.brand);
      formData.append("asset_type", data.assetType);
      formData.append("status", data.status);
      formData.append("Office", data.office);
      formData.append("assignment_status", data.assignmentStatus ? "true" : "false");
      formData.append("Sticker_seq", data.stickerSeq);
      formData.append("description", data.description);
      formData.append("Issued_by", data.issuedBy || null);
      formData.append("Issued_to", data.assignedToUser || "");
      formData.append("vendor_name", data.vendor_name);
      formData.append("vendor_email", data.vendor_email);
      formData.append("vendor_phone", data.vendor_phone);
      formData.append("vendor_city", data.vendor_city);
      formData.append("vendor_address", data.vendor_address);
      formData.append("category", data.category);
      formData.append("price", data.price);
      formData.append("quantity", quantity);
      formData.append("serialNumbers", JSON.stringify(serialNumbers));

      if (uploadedFiles.imageFile) {
        formData.append("Img", uploadedFiles.imageFile);
      }
      if (uploadedFiles.invoicePdf) {
        formData.append("invoicePdf", uploadedFiles.invoicePdf);
      }
      if (uploadedFiles.additionalPdf) {
        formData.append("additionalPdf", uploadedFiles.additionalPdf);
      }

      // Log the form data for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      console.log('Sending request to backend...');
      const response = await axios.post("http://localhost:3487/api/assets/add-asset", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: localStorage.getItem("token")
        },
        withCredentials: true
      });

      console.log('Backend response:', response.data);

      if (response.data.success) {
        setShowSuccess(true);
        reset();
        setQuantity(1);
        setSerialNumbers(['']);
        setUploadedFiles({
          imageFile: null,
          invoicePdf: null,
          additionalPdf: null
        });
        setTimeout(() => {
          navigate("/admin/asset/view");
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Failed to add assets');
      }
    } catch (error) {
      console.error("Error adding assets:", error);
      let errorMessage = "Failed to add assets. Please try again.";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data.error || errorMessage;
        if (error.response.data.details) {
          errorMessage += `\nDetails: ${JSON.stringify(error.response.data.details)}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = "No response received from server. Please check if the server is running.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        errorMessage = error.message;
      }

      setError(errorMessage);
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

              {/* Brand Name */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Brand Name</label>
                <input
                  {...register("brand_name", { required: "Brand name is required" })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter brand name"
                />
                {errors.brand_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand_name.message}</p>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Brand</label>
                <input
                  {...register("brand", { required: "Brand is required" })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter brand"
                />
                {errors.brand && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Vendor Information */}
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Vendor Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Vendor Name */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Name</label>
                <input
                  {...register("vendor_name", { required: "Vendor name is required" })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter vendor name"
                />
                {errors.vendor_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.vendor_name.message}</p>
                )}
              </div>

              {/* Vendor Email */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Email</label>
                <input
                  {...register("vendor_email", {
                    required: "Vendor email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter vendor email"
                />
                {errors.vendor_email && (
                  <p className="text-red-500 text-sm mt-1">{errors.vendor_email.message}</p>
                )}
              </div>

              {/* Vendor Phone */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Phone</label>
                <input
                  {...register("vendor_phone", { required: "Vendor phone is required" })}
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter vendor phone"
                />
                {errors.vendor_phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.vendor_phone.message}</p>
                )}
              </div>

              {/* Vendor City */}
              <div>
                <label className="block font-medium text-sm mb-1 text-gray-700">Vendor City</label>
                <input
                  {...register("vendor_city", { required: "Vendor city is required" })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter vendor city"
                />
                {errors.vendor_city && (
                  <p className="text-red-500 text-sm mt-1">{errors.vendor_city.message}</p>
                )}
              </div>

              {/* Vendor Address */}
              <div className="md:col-span-2">
                <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Address</label>
                <textarea
                  {...register("vendor_address", { required: "Vendor address is required" })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  rows="3"
                  placeholder="Enter vendor address"
                />
                {errors.vendor_address && (
                  <p className="text-red-500 text-sm mt-1">{errors.vendor_address.message}</p>
                )}
              </div>
            </div>

            {/* Serial Numbers */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Serial Numbers</h3>
              <div className="space-y-3">
                {serialNumbers.map((serialNumber, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => handleSerialNumberChange(index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                      placeholder={`Enter serial number ${index + 1}`}
                      required
                    />
                    {index === serialNumbers.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuantity(prev => prev + 1);
                          setSerialNumbers(prev => [...prev, '']);
                        }}
                        className="p-3 text-blue-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuantity(prev => prev - 1);
                          setSerialNumbers(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="p-3 text-red-500 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
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
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
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


            {/* File Uploads Section */}
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">File Uploads</h2>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block font-medium text-m mb-1 text-gray-700">Upload Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  {uploadedFiles.imageFile ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(uploadedFiles.imageFile)}
                        alt="Preview"
                        className="max-h-32 mx-auto mb-2 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleFileRemove('imageFile')}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                      <p className="text-sm text-gray-600">{uploadedFiles.imageFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <Upload className="h-12 w-12" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            {...register("imageFile")}
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files, 'imageFile')}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice PDF Upload */}
            <div className="mb-6">
              <label className="block font-medium text-m mb-1 text-gray-700">Upload Invoice PDF</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  {uploadedFiles.invoicePdf ? (
                    <div className="relative">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleFileRemove('invoicePdf')}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                        <p className="text-sm text-gray-600">{uploadedFiles.invoicePdf.name}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <Upload className="h-12 w-12" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload PDF</span>
                          <input
                            {...register("invoicePdf")}
                            type="file"
                            className="sr-only"
                            accept="application/pdf"
                            onChange={(e) => handleFileUpload(e.target.files, 'invoicePdf')}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF files up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Additional PDF Upload */}
            <div className="mb-6">
              <label className="block font-medium text-m mb-1 text-gray-700">Upload Additional Files</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  {uploadedFiles.additionalPdf ? (
                    <div className="relative">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleFileRemove('additionalPdf')}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                        <p className="text-sm text-gray-600">{uploadedFiles.additionalPdf.name}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <Upload className="h-12 w-12" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload PDF</span>
                          <input
                            {...register("additionalPdf")}
                            type="file"
                            className="sr-only"
                            accept="application/pdf"
                            onChange={(e) => handleFileUpload(e.target.files, 'additionalPdf')}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF files up to 10MB</p>
                    </>
                  )}
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