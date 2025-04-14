import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, ChevronLeft, Loader2, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AssetEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

    // For simplicity, reusing similar states as Asset_add if needed (e.g., uploadedFiles)
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
                // Set form default values
                setValue("assetName", asset.name);
                setValue("brand_name", asset.brand_name);
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
                setValue("price", asset.price);
                setValue("voucher_number", asset.voucher_number);
                if (asset.date_of_purchase) {
                    setValue("date_of_purchase", asset.date_of_purchase.split("T")[0]);
                }
                // If you stored files URLs you might set them into uploadedFiles state as needed.
                reset(asset);
                setLoadingData(false);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load asset data");
                setLoadingData(false);
            });
    }, [id, reset, setValue]);

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
            // Append files if changed
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
                    {/* Input fields similar to Asset_Add.jsx */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 mb-1">Asset Name</label>
                            <input {...register("assetName", { required: "Asset name is required" })} className="w-full p-2 border rounded-md" />
                            {errors.assetName && <p className="text-red-500 text-sm">{errors.assetName.message}</p>}
                        </div>
                        {/* Include similar fields for brand_name, assetType, status, office, stickerSeq, description, vendor info, etc. */}
                    </div>
                    {/* File uploads and form actions */}
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
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