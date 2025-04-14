import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, ChevronLeft, Loader2, Trash2, Plus, Upload } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AssetEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();

    // Local states for file uploads, asset type and dropdowns
    const [uploadedFiles, setUploadedFiles] = useState({
        imageFile: null,
        invoicePdf: null,
        additionalPdf: null
    });
    const [assetType, setAssetType] = useState("physical");
    const [offices, setOffices] = useState([]);
    const [categories, setCategories] = useState([]);

    // Fetch asset details
    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`http://localhost:3487/api/assets/${id}`, {
            headers: { token },
            withCredentials: true
        })
            .then(res => {
                const asset = res.data;
                // Set the form values from asset details
                setValue("assetName", asset.name || "");
                setValue("brand_name", asset.brand_name || "");
                setValue("assetType", asset.asset_type || "physical");
                setAssetType(asset.asset_type || "physical");
                setValue("status", asset.status || "");
                setValue("office", asset.Office || "");
                setValue("stickerSeq", asset.Sticker_seq || "");
                setValue("description", asset.description || "");
                setValue("vendor_name", asset.vendor_name || "");
                setValue("vendor_email", asset.vendor_email || "");
                setValue("vendor_phone", asset.vendor_phone || "");
                setValue("vendor_city", asset.vendor_city || "");
                setValue("vendor_address", asset.vendor_address || "");
                setValue("price", asset.price || "");
                setValue("voucher_number", asset.voucher_number || "");
                if (asset.date_of_purchase)
                    setValue("date_of_purchase", asset.date_of_purchase.split("T")[0]);
                setLoadingData(false);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load asset data");
                setLoadingData(false);
            });
    }, [id, setValue]);

    // Fetch additional data for dropdowns (offices and categories)
    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get("http://localhost:3487/api/locations?type=office", {
            headers: { token },
            withCredentials: true
        })
            .then(res => {
                setOffices(res.data);
            })
            .catch(err => console.error("Error fetching offices:", err));

        axios.get("http://localhost:3487/api/categories", {
            headers: { token },
            withCredentials: true
        })
            .then(res => {
                setCategories(res.data);
            })
            .catch(err => console.error("Error fetching categories:", err));
    }, []);

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append("name", data.assetName);
            formData.append("brand_name", data.brand_name);
            // Use the assetType from the state or form
            formData.append("asset_type", assetType);
            formData.append("status", data.status);
            formData.append("Office", data.office);
            formData.append("Sticker_seq", data.stickerSeq);
            formData.append("description", data.description);
            formData.append("vendor_name", data.vendor_name);
            formData.append("vendor_email", data.vendor_email);
            formData.append("vendor_phone", data.vendor_phone);
            formData.append("vendor_city", data.vendor_city);
            formData.append("vendor_address", data.vendor_address);
            formData.append("price", data.price);
            formData.append("voucher_number", data.voucher_number);
            formData.append("date_of_purchase", data.date_of_purchase || "");
            if (uploadedFiles.imageFile) {
                formData.append("Img", uploadedFiles.imageFile);
            }
            if (uploadedFiles.invoicePdf) {
                formData.append("invoicePdf", uploadedFiles.invoicePdf);
            }
            if (uploadedFiles.additionalPdf) {
                formData.append("additionalPdf", uploadedFiles.additionalPdf);
            }
            const token = localStorage.getItem("token");
            const res = await axios.put(`http://localhost:3487/api/assets/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    token
                },
                withCredentials: true
            });
            if (res.data.success) {
                navigate(`/admin/assets/view/${id}`);
            } else {
                setError("Failed to update asset");
            }
        } catch (err) {
            console.error(err);
            setError("Error updating asset");
        }
    };

    const handleFileUpload = (files, type) => {
        if (files && files[0]) {
            setUploadedFiles(prev => ({ ...prev, [type]: files[0] }));
        }
    };

    const handleFileRemove = (type) => {
        setUploadedFiles(prev => ({ ...prev, [type]: null }));
    };

    if (loadingData) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin" size={24} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline">
                        &larr; Back
                    </button>
                    <h1 className="ml-4 text-2xl font-bold">Edit Asset</h1>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
                    {/* Basic Information */}
                    <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Asset Name */}
                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Asset Name</label>
                            <input
                                {...register("assetName", { required: "Asset name is required" })}
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                                placeholder="Enter asset name"
                            />
                            {errors.assetName && <p className="text-red-500 text-sm mt-1">{errors.assetName.message}</p>}
                        </div>
                        {/* Brand Name */}
                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Brand Name</label>
                            <input
                                {...register("brand_name", { required: "Brand name is required" })}
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                                placeholder="Enter brand name"
                            />
                            {errors.brand_name && <p className="text-red-500 text-sm mt-1">{errors.brand_name.message}</p>}
                        </div>
                    </div>
                    {/* Asset Type and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Asset Type as Radio Buttons */}
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
                            {errors.assetType && <p className="text-red-500 text-sm mt-1">{errors.assetType.message}</p>}
                        </div>
                        {/* Status Dropdown */}
                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Status</label>
                            <select
                                {...register("status", { required: "Status is required" })}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                            >
                                <option value="">Select Status</option>
                                <option value="Available">Available</option>
                                <option value="Unavailable">Unavailable</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                        </div>
                    </div>
                    {/* Location Information */}
                    <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Location Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Office Dropdown */}
                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Office</label>
                            <select
                                {...register("office", { required: "Office is required" })}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                            >
                                <option value="">Select Office</option>
                                {offices.map((office) => (
                                    <option key={office._id} value={office.location_name}>
                                        {office.location_name}
                                    </option>
                                ))}
                            </select>
                            {errors.office && <p className="text-red-500 text-sm mt-1">{errors.office.message}</p>}
                        </div>
                        {/* Category Dropdown */}
                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Category</label>
                            <select
                                {...register("category", { required: "Category is required" })}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                        </div>
                    </div>
                    {/* Asset Details */}
                    <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Asset Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Sticker Sequence */}
                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Sticker Sequence</label>
                            <input
                                {...register("stickerSeq", { required: "Sticker sequence is required" })}
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                                placeholder="Enter sticker sequence"
                            />
                            {errors.stickerSeq && <p className="text-red-500 text-sm mt-1">{errors.stickerSeq.message}</p>}
                        </div>
                        {/* Price */}
                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Price</label>
                            <input
                                {...register("price", { required: "Price is required" })}
                                type="number"
                                step="0.01"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                                placeholder="Enter price"
                            />
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                        </div>
                    </div>
                    {/* Description */}
                    <div className="mb-6">
                        <label className="block font-medium text-sm mb-1 text-gray-700">Description</label>
                        <textarea
                            {...register("description", { required: "Description is required" })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                            rows="4"
                            placeholder="Enter asset description"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                    </div>
                    {/* Vendor Information */}
                    <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Vendor Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Vendor Name */}
                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Name</label>
                            <input
                                {...register("vendor_name", { required: "Vendor name is required" })}
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                                placeholder="Enter vendor name"
                            />
                            {errors.vendor_name && <p className="text-red-500 text-sm mt-1">{errors.vendor_name.message}</p>}
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
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                                placeholder="Enter vendor email"
                            />
                            {errors.vendor_email && <p className="text-red-500 text-sm mt-1">{errors.vendor_email.message}</p>}
                        </div>
                        {/* Vendor Phone */}
                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Phone</label>
                            <input
                                {...register("vendor_phone", { required: "Vendor phone is required" })}
                                type="tel"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                                placeholder="Enter vendor phone"
                            />
                            {errors.vendor_phone && <p className="text-red-500 text-sm mt-1">{errors.vendor_phone.message}</p>}
                        </div>
                        {/* Vendor City */}
                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Vendor City</label>
                            <input
                                {...register("vendor_city", { required: "Vendor city is required" })}
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                                placeholder="Enter vendor city"
                            />
                            {errors.vendor_city && <p className="text-red-500 text-sm mt-1">{errors.vendor_city.message}</p>}
                        </div>
                        {/* Vendor Address */}
                        <div className="md:col-span-2">
                            <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Address</label>
                            <textarea
                                {...register("vendor_address", { required: "Vendor address is required" })}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                                rows="3"
                                placeholder="Enter vendor address"
                            />
                            {errors.vendor_address && <p className="text-red-500 text-sm mt-1">{errors.vendor_address.message}</p>}
                        </div>
                    </div>
                    {/* File Uploads */}
                    <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">File Uploads</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-gray-700 mb-1">Image Upload</label>
                            {uploadedFiles.imageFile ? (
                                <div className="relative">
                                    <img src={URL.createObjectURL(uploadedFiles.imageFile)} alt="Preview" className="h-20 w-auto mb-2 rounded" />
                                    <button type="button" onClick={() => handleFileRemove("imageFile")} className="text-red-500 text-xs">Remove</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg p-4 hover:border-blue-500 transition-colors">
                                    <Upload className="h-12 w-12 text-gray-400" />
                                    <label className="cursor-pointer text-blue-600 hover:text-blue-500">
                                        Upload Image
                                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileUpload(e.target.files, "imageFile")} />
                                    </label>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            )}
                        </div>
                        {/* Invoice PDF Upload */}
                        <div>
                            <label className="block text-gray-700 mb-1">Invoice PDF</label>
                            {uploadedFiles.invoicePdf ? (
                                <div className="relative">
                                    <p className="text-sm mb-2">{uploadedFiles.invoicePdf.name}</p>
                                    <button type="button" onClick={() => handleFileRemove("invoicePdf")} className="text-red-500 text-xs">Remove</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg p-4 hover:border-blue-500 transition-colors">
                                    <Upload className="h-12 w-12 text-gray-400" />
                                    <label className="cursor-pointer text-blue-600 hover:text-blue-500">
                                        Upload PDF
                                        <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => handleFileUpload(e.target.files, "invoicePdf")} />
                                    </label>
                                    <p className="text-xs text-gray-500">PDF files up to 10MB</p>
                                </div>
                            )}
                        </div>
                        {/* Additional PDF Upload */}
                        <div>
                            <label className="block text-gray-700 mb-1">Additional PDF</label>
                            {uploadedFiles.additionalPdf ? (
                                <div className="relative">
                                    <p className="text-sm mb-2">{uploadedFiles.additionalPdf.name}</p>
                                    <button type="button" onClick={() => handleFileRemove("additionalPdf")} className="text-red-500 text-xs">Remove</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg p-4 hover:border-blue-500 transition-colors">
                                    <Upload className="h-12 w-12 text-gray-400" />
                                    <label className="cursor-pointer text-blue-600 hover:text-blue-500">
                                        Upload PDF
                                        <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => handleFileUpload(e.target.files, "additionalPdf")} />
                                    </label>
                                    <p className="text-xs text-gray-500">PDF files up to 10MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 border-t bg-gray-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm flex items-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Update Asset
                        </button>
                    </div>
                    {error && <p className="mt-4 text-red-500">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default AssetEdit;