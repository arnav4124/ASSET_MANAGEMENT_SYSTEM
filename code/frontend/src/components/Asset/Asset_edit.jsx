import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, ChevronLeft, Loader2, Upload, Check, Trash2, AlertCircle } from "lucide-react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";

const Asset_edit = () => {
    const { id } = useParams();
    const [categories, setCategories] = useState([]);
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [uploadedFiles, setUploadedFiles] = useState({
        imageFile: null,
        invoicePdf: null,
        additionalPdf: null
    });
    const [assetType, setAssetType] = useState("physical");
    const [assetData, setAssetData] = useState(null); // Store the raw asset data for debugging
    const [originalStickerSeq, setOriginalStickerSeq] = useState('');
    const [locationChanged, setLocationChanged] = useState(false);
    const [showUnassignWarning, setShowUnassignWarning] = useState(false);
    const [formData, setFormData] = useState(null);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();

    // Watch for office field changes
    const watchedOffice = watch("office");

    // Fetch asset data and other required data on component mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const role = JSON.parse(localStorage.getItem("user")).role;
        if (role !== "Admin") {
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch asset details
                const assetRes = await axios.get(`http://localhost:3487/api/assets/${id}`, {
                    headers: { token }
                });

                console.log("Asset data received:", assetRes.data);
                console.log("Warranty date:", assetRes.data.warranty_date);
                console.log("Insurance date:", assetRes.data.insurance_date);

                setAssetData(assetRes.data);
                setOriginalStickerSeq(assetRes.data.Sticker_seq);

                // Fetch categories
                const categoriesRes = await axios.get("http://localhost:3487/api/categories", {
                    headers: { token }
                });
                setCategories(categoriesRes.data);

                // Fetch office locations
                const officesRes = await axios.get("http://localhost:3487/api/locations", {
                    headers: { token }
                });
                setOffices(officesRes.data);

                // Set asset type state
                setAssetType(assetRes.data.asset_type);

                // Pre-populate form fields with asset data
                populateFormFields(assetRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error loading asset data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    // Function to update the sticker sequence when location changes
    useEffect(() => {
        const updateStickerSequence = async () => {
            console.log("Watched office:", watchedOffice);
            console.log("Asset data:", assetData);
            console.log("Original sticker sequence:", originalStickerSeq);
            if (watchedOffice && assetData && watchedOffice !== assetData.Office) {
                // Location has changed
                setLocationChanged(true);
                
                try {
                    // Fetch the short sequence for the new location
                    const response = await axios.get(`http://localhost:3487/api/locations/sticker-sequence/${watchedOffice}`, {
                        withCredentials: true,
                        headers: { token: localStorage.getItem("token") }
                    });
                    
                    if (response.data.success && response.data.sticker_short_seq) {
                        // We need to update only the location part of the sticker sequence
                        // Format: EKL/CENT/CAT/MON/YR/####
                        const newLocationShortSeq = response.data.sticker_short_seq;
                        const currentStickerSeq = originalStickerSeq || assetData.Sticker_seq;
                        
                        // Split the sticker sequence by '/'
                        const parts = currentStickerSeq.split('/');
                        if (parts.length >= 6) {
                            // Replace only the location part (index 1)
                            parts[1] = newLocationShortSeq;
                            
                            // Join the parts back together
                            const newStickerSeq = parts.join('/');
                            setValue("stickerSeq", newStickerSeq);
                            
                            // Display notification about sequence update
                            console.log(`Sticker sequence updated from ${currentStickerSeq} to ${newStickerSeq}`);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching location sticker sequence:", error);
                }
            } else {
                setLocationChanged(false);
            }
        };
        
        updateStickerSequence();
    }, [watchedOffice, assetData, originalStickerSeq, setValue]);

    // Helper function to populate form fields with existing asset data
    const populateFormFields = (asset) => {
        setValue("assetName", asset.name);
        setValue("brand_name", asset.brand);
        setValue("assetType", asset.asset_type);
        setValue("status", asset.status);
        setValue("office", asset.Office);
        setValue("stickerSeq", asset.Sticker_seq);
        setValue("description", asset.description);
        setValue("vendor_name", asset.vendor_name);
        setValue("vendor_email", asset.vendor_email);
        setValue("vendor_phone", asset.vendor_phone);
        setValue("vendor_city", asset.vendor_city);
        setValue("vendor_address", asset.vendor_address);
        setValue("warranty_date", asset.warranty_date);
        setValue("insurance_date", asset.insurance_date);
            
        setValue("category", asset.category ? asset.category._id : "");
        setValue("price", asset.price);
        setValue("Serial_number", asset.Serial_number);
        setValue("voucher_number", asset.voucher_number);

        // Format date for the date input (YYYY-MM-DD)
        if (asset.date_of_purchase) {
            const purchaseDate = new Date(asset.date_of_purchase);
            const formattedDate = purchaseDate.toISOString().split('T')[0];
            setValue("date_of_purchase", formattedDate);
        }

        // Format warranty date if it exists
        if (asset.warranty_date) {
            try {
                const warrantyDate = new Date(asset.warranty_date);
                const formattedWarrantyDate = warrantyDate.toISOString().split('T')[0];
                console.log("Setting warranty date value:", formattedWarrantyDate);
                setValue("warranty_date", formattedWarrantyDate);
            } catch (error) {
                console.error("Error formatting warranty date:", error);
            }
        }

        // Format insurance date if it exists
        if (asset.insurance_date) {
            try {
                const insuranceDate = new Date(asset.insurance_date);
                const formattedInsuranceDate = insuranceDate.toISOString().split('T')[0];
                console.log("Setting insurance date value:", formattedInsuranceDate);
                setValue("insurance_date", formattedInsuranceDate);
            } catch (error) {
                console.error("Error formatting insurance date:", error);
            }
        }
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
        // Check if asset is assigned and location is changed
        if (assetData && assetData.assignment_status && data.office !== assetData.Office) {
            // Store form data temporarily and show warning modal
            setFormData(data);
            setShowUnassignWarning(true);
            return;
        }
        
        // Otherwise proceed with normal submission
        await submitFormData(data);
    };
    
    // Function to handle the actual form submission
    const submitFormData = async (data) => {
        setIsSubmitting(true);
        setError(null);
        setShowSuccess(false);

        try {
            // Validate required fields (only for editable fields)
            const requiredFields = {
                status: 'Status',
                office: 'Office',
                stickerSeq: 'Sticker Sequence',
                price: 'Price',
                description: 'Description'
            };

            const missingFields = Object.entries(requiredFields)
                .filter(([key]) => !data[key])
                .map(([_, label]) => label);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const formData = new FormData();
            const issuedBy = JSON.parse(localStorage.getItem("user"))._id;

            // Check if location has changed
            const isLocationChanged = assetData && data.office !== assetData.Office;
            
            // Check if asset is assigned and location is changing
            const isAssignedAndLocationChanged = 
                assetData && 
                assetData.assignment_status && 
                isLocationChanged;

            // Keep all the existing fields in formData but don't modify them
            // These are just sent back for completeness
            formData.append("name", data.assetName);
            formData.append("brand_name", data.brand_name);
            formData.append("Serial_number", data.Serial_number);
            formData.append("voucher_number", data.voucher_number);
            formData.append("date_of_purchase", data.date_of_purchase);
            formData.append("vendor_name", data.vendor_name);
            formData.append("vendor_email", data.vendor_email);
            formData.append("vendor_phone", data.vendor_phone);
            formData.append("vendor_city", data.vendor_city);
            formData.append("vendor_address", data.vendor_address);

            // Editable fields
            formData.append("asset_type", data.assetType);
            formData.append("status", data.status);
            formData.append("Office", data.office);
            formData.append("Sticker_seq", data.stickerSeq);
            formData.append("description", data.description);
            formData.append("category", data.category);
            formData.append("price", data.price);
            formData.append("admin", issuedBy);  // Admin who is making the edit
            formData.append("isLocationChanged", isLocationChanged);  // Flag for location change
            formData.append("previousLocation", assetData ? assetData.Office : "");  // Store previous location
            
            // Add flag to indicate if asset should be unassigned due to location change
            formData.append("unassignDueToLocationChange", isAssignedAndLocationChanged ? "true" : "false");
            
            if (assetData && assetData.Issued_to) {
                formData.append("previousAssignee", assetData.Issued_to._id || "");
            }

            // Add warranty and insurance dates if provided
            console.log("Warranty date to save:", data.warranty_date);
            console.log("Insurance date to save:", data.insurance_date);

            if (data.warranty_date) {
                formData.append("warranty_date", data.warranty_date);
            } else if (assetData && assetData.warranty_date) {
                // If no new date is provided but there was an existing one, preserve it
                const warrantyDate = new Date(assetData.warranty_date);
                const formattedWarrantyDate = warrantyDate.toISOString().split('T')[0];
                formData.append("warranty_date", formattedWarrantyDate);
            }

            if (data.insurance_date) {
                formData.append("insurance_date", data.insurance_date);
            } else if (assetData && assetData.insurance_date) {
                // If no new date is provided but there was an existing one, preserve it
                const insuranceDate = new Date(assetData.insurance_date);
                const formattedInsuranceDate = insuranceDate.toISOString().split('T')[0];
                formData.append("insurance_date", formattedInsuranceDate);
            }

            // Add files if they exist
            if (uploadedFiles.imageFile) {
                formData.append("Img", uploadedFiles.imageFile);
            }
            if (uploadedFiles.invoicePdf) {
                formData.append("invoicePdf", uploadedFiles.invoicePdf);
            }
            if (uploadedFiles.additionalPdf) {
                formData.append("additionalPdf", uploadedFiles.additionalPdf);
            }

            // Send PUT request to update asset
            const response = await axios.put(`http://localhost:3487/api/assets/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    token: localStorage.getItem("token")
                },
                withCredentials: true
            });

            window.scrollTo(0, 0);
            if (response.status === 200) {
                setShowSuccess(true);
                console.log("Asset updated successfully:", response.data);
                setTimeout(() => {
                    navigate(`/admin/assets/view/${id}`);
                }, 2000);
            } else {
                throw new Error(response.data.error || 'Failed to update asset');
            }
        } catch (error) {
            console.error("Error updating asset:", error);
            let errorMessage = "Failed to update asset. Please try again.";

            if (error.response) {
                console.error('Error response:', error.response.data);
                errorMessage = error.response.data.error || errorMessage;
            } else if (error.request) {
                console.error('No response received:', error.request);
                errorMessage = "No response received from server. Please check if the server is running.";
            } else {
                console.error('Error setting up request:', error.message);
                errorMessage = error.message;
            }

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle confirmation to unassign
    const handleUnassignConfirm = () => {
        setShowUnassignWarning(false);
        if (formData) {
            submitFormData(formData);
        }
    };

    // Handle cancellation
    const handleUnassignCancel = () => {
        setShowUnassignWarning(false);
        setFormData(null);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="text-white text-xl text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl font-semibold">Loading...</p>
                    <p className="text-sm text-gray-300 mt-2">Please wait while we fetch the asset data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Unassignment Warning Modal */}
            {showUnassignWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex items-center text-amber-500 mb-4">
                            <AlertCircle className="h-6 w-6 mr-2" />
                            <h3 className="text-lg font-medium">Changing Location Requires Unassignment</h3>
                        </div>
                        
                        <p className="mb-4 text-gray-600">
                            This asset is currently assigned to{" "}
                            <span className="font-medium">
                                {assetData?.Issued_to?.first_name} {assetData?.Issued_to?.last_name || assetData?.Issued_to?.Project_name || ""}
                            </span>. 
                            Changing the location will unassign this asset.
                        </p>
                        
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to continue?
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleUnassignCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnassignConfirm}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            >
                                Unassign & Update Location
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-yellow-500 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Edit Asset</h1>
                            <p className="text-gray-500 mt-1">Update asset information</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-full">
                            <Box size={24} className="text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Information message about editable fields */}
                <div className="bg-blue-50 p-4 mb-6 rounded-md border-l-4 border-blue-500">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Basic information and vendor details cannot be edited to maintain data integrity.
                        You can update other fields like status, location, warranty date, and asset details.
                    </p>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-md animate-fadeIn">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-full mr-3">
                                <Check size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">Asset updated successfully!</p>
                                <p className="text-green-600 text-sm">The asset information has been updated.</p>
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
                        <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Basic Information (Read-only)</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Asset Name */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Asset Name</label>
                                <input
                                    {...register("assetName")}
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                    readOnly
                                />
                            </div>

                            {/* Brand Name */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Brand Name</label>
                                <input
                                    {...register("brand_name")}
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                    readOnly
                                />
                            </div>

                            {/* Serial Number - Read-only */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Serial Number</label>
                                <input
                                    {...register("Serial_number")}
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                    readOnly
                                />
                            </div>

                            {/* Voucher Number */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Voucher Number</label>
                                <input
                                    {...register("voucher_number")}
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">
                                Date of Purchase
                            </label>
                            <input
                                {...register("date_of_purchase")}
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                readOnly
                            />
                        </div>

                        {/* Vendor Information */}
                        <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Vendor Information (Read-only)</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Vendor Name */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Name</label>
                                <input
                                    {...register("vendor_name")}
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                    readOnly
                                />
                            </div>

                            {/* Vendor Email */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Email</label>
                                <input
                                    {...register("vendor_email")}
                                    type="email"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                    readOnly
                                />
                            </div>

                            {/* Vendor Phone */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Phone</label>
                                <input
                                    {...register("vendor_phone")}
                                    type="tel"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                    readOnly
                                />
                            </div>

                            {/* Vendor City */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Vendor City</label>
                                <input
                                    {...register("vendor_city")}
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                    readOnly
                                />
                            </div>

                            {/* Vendor Address */}
                            <div className="md:col-span-2">
                                <label className="block font-medium text-sm mb-1 text-gray-700">Vendor Address</label>
                                <textarea
                                    {...register("vendor_address")}
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                    rows="3"
                                    readOnly
                                />
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
                                <p className="text-amber-600 text-xs mt-1">
                                    <strong>Note:</strong> Changing asset type may affect how the asset is tracked and managed.
                                </p>
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
                                    <option value="">Selet Status</option>
                                    <option value="Available">Available</option>
                                    <option value="Unavailable">Unavailable</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Disposed">Disposed</option>
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
                                {locationChanged && (
                                    <p className="text-amber-600 text-xs mt-1">
                                        Location changed. Sticker sequence has been updated accordingly.
                                    </p>
                                )}
                                {errors.office && (
                                    <p className="text-red-500 text-sm mt-1">{errors.office.message}</p>
                                )}
                            </div>

                            {/* Category - Read-only */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Category (Read-only)</label>
                                <input
                                    type="text"
                                    value={assetData?.category?.name || ""}
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                                    readOnly
                                />
                                <input
                                    type="hidden"
                                    {...register("category")}
                                    value={assetData?.category?._id || ""}
                                />
                                <p className="text-amber-600 text-xs mt-1">
                                    Category cannot be changed to maintain asset categorization integrity.
                                </p>
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

                        {/* Warranty and Insurance Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Warranty Date */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Warranty Date</label>
                                <input
                                    {...register("warranty_date")}
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                />
                                {errors.warranty_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.warranty_date.message}</p>
                                )}
                            </div>

                            {/* Insurance Date */}
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Insurance Date</label>
                                <input
                                    {...register("insurance_date")}
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                />
                                {errors.insurance_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.insurance_date.message}</p>
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

                        {/* File Uploads Section */}
                        <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Update Files (Optional)</h2>

                        {/* Image Upload */}
                        <div className="mb-6">
                            <label className="block font-medium text-m mb-1 text-gray-700">Update Image</label>
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
                            <label className="block font-medium text-m mb-1 text-gray-700">Update Invoice PDF</label>
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
                            <label className="block font-medium text-m mb-1 text-gray-700">Update Additional Files</label>
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
                            onClick={() => navigate(`/admin/assets/view/${id}`)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                    Updating Asset...
                                </>
                            ) : (
                                'Update Asset'
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

export default Asset_edit;