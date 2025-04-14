import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, ChevronLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AssetEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [uploadedFiles, setUploadedFiles] = useState({
        imageFile: null,
        invoicePdf: null,
        additionalPdf: null
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`http://localhost:3487/api/assets/${id}`, {
            headers: { token },
            withCredentials: true
        })
            .then(res => {
                const asset = res.data;
                // Manually set each field so that the form shows
                setValue("assetName", asset.name || "");
                setValue("brand_name", asset.brand_name || "");
                setValue("assetType", asset.asset_type || "");
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

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append("name", data.assetName);
            formData.append("brand_name", data.brand_name);
            formData.append("asset_type", data.assetType);
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
            setUploadedFiles((prev) => ({ ...prev, [type]: files[0] }));
        }
    };

    const handleFileRemove = (type) => {
        setUploadedFiles((prev) => ({ ...prev, [type]: null }));
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 mb-1">Asset Name</label>
                            <input {...register("assetName", { required: "Asset name is required" })} className="w-full p-2 border rounded-md" />
                            {errors.assetName && <p className="text-red-500 text-sm">{errors.assetName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Brand Name</label>
                            <input {...register("brand_name", { required: "Brand name is required" })} className="w-full p-2 border rounded-md" />
                            {errors.brand_name && <p className="text-red-500 text-sm">{errors.brand_name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Asset Type</label>
                            <input {...register("assetType", { required: "Asset type is required" })} className="w-full p-2 border rounded-md" />
                            {errors.assetType && <p className="text-red-500 text-sm">{errors.assetType.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Status</label>
                            <input {...register("status", { required: "Status is required" })} className="w-full p-2 border rounded-md" />
                            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Office</label>
                            <input {...register("office", { required: "Office is required" })} className="w-full p-2 border rounded-md" />
                            {errors.office && <p className="text-red-500 text-sm">{errors.office.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Sticker Sequence</label>
                            <input {...register("stickerSeq", { required: "Sticker sequence is required" })} className="w-full p-2 border rounded-md" />
                            {errors.stickerSeq && <p className="text-red-500 text-sm">{errors.stickerSeq.message}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 mb-1">Description</label>
                            <textarea {...register("description", { required: "Description is required" })} className="w-full p-2 border rounded-md" rows="3" />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Vendor Name</label>
                            <input {...register("vendor_name", { required: "Vendor name is required" })} className="w-full p-2 border rounded-md" />
                            {errors.vendor_name && <p className="text-red-500 text-sm">{errors.vendor_name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Vendor Email</label>
                            <input {...register("vendor_email", { required: "Vendor email is required" })} type="email" className="w-full p-2 border rounded-md" />
                            {errors.vendor_email && <p className="text-red-500 text-sm">{errors.vendor_email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Vendor Phone</label>
                            <input {...register("vendor_phone", { required: "Vendor phone is required" })} className="w-full p-2 border rounded-md" />
                            {errors.vendor_phone && <p className="text-red-500 text-sm">{errors.vendor_phone.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Vendor City</label>
                            <input {...register("vendor_city", { required: "Vendor city is required" })} className="w-full p-2 border rounded-md" />
                            {errors.vendor_city && <p className="text-red-500 text-sm">{errors.vendor_city.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Vendor Address</label>
                            <input {...register("vendor_address", { required: "Vendor address is required" })} className="w-full p-2 border rounded-md" />
                            {errors.vendor_address && <p className="text-red-500 text-sm">{errors.vendor_address.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Price</label>
                            <input {...register("price", { required: "Price is required" })} type="number" step="0.01" className="w-full p-2 border rounded-md" />
                            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Voucher Number</label>
                            <input {...register("voucher_number", { required: "Voucher number is required" })} className="w-full p-2 border rounded-md" />
                            {errors.voucher_number && <p className="text-red-500 text-sm">{errors.voucher_number.message}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Date of Purchase</label>
                            <input {...register("date_of_purchase")} type="date" className="w-full p-2 border rounded-md" />
                        </div>
                    </div>
                    {/* File Uploads */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Image Upload</label>
                            {uploadedFiles.imageFile ? (
                                <div className="relative">
                                    <img src={URL.createObjectURL(uploadedFiles.imageFile)} alt="Preview" className="h-20 w-auto mb-2 rounded" />
                                    <button type="button" onClick={() => handleFileRemove("imageFile")} className="text-red-500 text-xs">Remove</button>
                                </div>
                            ) : (
                                <>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files, "imageFile")} />
                                </>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Invoice PDF</label>
                            {uploadedFiles.invoicePdf ? (
                                <div className="relative">
                                    <p className="text-sm mb-2">{uploadedFiles.invoicePdf.name}</p>
                                    <button type="button" onClick={() => handleFileRemove("invoicePdf")} className="text-red-500 text-xs">Remove</button>
                                </div>
                            ) : (
                                <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e.target.files, "invoicePdf")} />
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Additional PDF</label>
                            {uploadedFiles.additionalPdf ? (
                                <div className="relative">
                                    <p className="text-sm mb-2">{uploadedFiles.additionalPdf.name}</p>
                                    <button type="button" onClick={() => handleFileRemove("additionalPdf")} className="text-red-500 text-xs">Remove</button>
                                </div>
                            ) : (
                                <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e.target.files, "additionalPdf")} />
                            )}
                        </div>
                    </div>
                    {/* Form Actions */}
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Update Asset</button>
                    </div>
                    {error && <p className="mt-4 text-red-500">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default AssetEdit;