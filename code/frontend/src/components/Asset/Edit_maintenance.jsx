import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, ChevronLeft, Loader2, Check } from "lucide-react";
import React, { useState, useEffect } from "react";
const Edit_maintenance = () => {
    const { id } = useParams(); // This is the asset ID
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [maintenanceRecord, setMaintenanceRecord] = useState(null);
    const [maintenanceId, setMaintenanceId] = useState(null);
    const [formData, setFormData] = useState({
        expected_date_of_return: "",
        description: "",
        maintenance_type: "Repair",
        maintenance_cost: 0,
        vendor_name: "",
        vendor_contact: "",
        vendor_address: "",
        vendor_email: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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

        // Fetch asset details
        const fetchData = async () => {
            try {
                // 1. First fetch the asset details
                const assetResponse = await axios.get(`http://localhost:3487/api/assets/${id}`, {
                    withCredentials: true,
                    headers: { token },
                });
                setAsset(assetResponse.data);

                // 2. Then fetch maintenance records for this asset
                const maintenanceResponse = await axios.get(
                    `http://localhost:3487/api/admin/assets/maintenance?asset_id=${id}`,
                    {
                        withCredentials: true,
                        headers: { token },
                    }
                );

                // Find the pending maintenance record (should be only one)
                const pendingMaintenance = maintenanceResponse.data.data.find(
                    (record) => record.status === "Pending"
                );

                if (pendingMaintenance) {
                    setMaintenanceRecord(pendingMaintenance);
                    setMaintenanceId(pendingMaintenance._id);

                    // Format the date to YYYY-MM-DD for input
                    const formatDate = (dateString) => {
                        const date = new Date(dateString);
                        return date.toISOString().split("T")[0];
                    };

                    // Set form data from maintenance record
                    setFormData({
                        expected_date_of_return: formatDate(pendingMaintenance.expected_date_of_return),
                        description: pendingMaintenance.description,
                        maintenance_type: pendingMaintenance.maintenance_type,
                        maintenance_cost: pendingMaintenance.maintenance_cost,
                        vendor_name: pendingMaintenance.vendor_name,
                        vendor_contact: pendingMaintenance.vendor_contact,
                        vendor_address: pendingMaintenance.vendor_address,
                        vendor_email: pendingMaintenance.vendor_email
                    });
                } else {
                    setError("No pending maintenance record found for this asset");
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Failed to load asset or maintenance information");
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setShowSuccess(false);

        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const admin_id = user._id;

            // Update the maintenance record
            await axios.put(
                `http://localhost:3487/api/admin/assets/maintenance/${maintenanceId}`,
                {
                    ...formData,
                    admin_id
                },
                {
                    withCredentials: true,
                    headers: { token },
                }
            );

            window.scrollTo(0, 0);
            setShowSuccess(true);
            setTimeout(() => {
                navigate(`/admin/assets/details/${id}`);
            }, 2000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to update maintenance details");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkAsCompleted = async () => {
        if (!window.confirm("Are you sure you want to mark this maintenance as completed? The asset will be marked as Available.")) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const admin_id = user._id;

            // Update maintenance record with status Completed and today's date as return date
            await axios.put(
                `http://localhost:3487/api/admin/assets/maintenance/${maintenanceId}`,
                {
                    status: "Completed",
                    date_of_return: new Date().toISOString(),
                    admin_id
                },
                {
                    withCredentials: true,
                    headers: { token },
                }
            );

            setShowSuccess(true);
            setTimeout(() => {
                navigate(`/admin/assets/details/${id}`);
            }, 2000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to complete maintenance");
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
                    <p className="text-sm text-gray-300 mt-2">Please wait while we load maintenance information</p>
                </div>
            </div>
        );
    }

    if (error && !maintenanceRecord) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="text-red-500 text-center mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-800">Error</h3>
                <p className="text-gray-600 mt-2 text-center">{error}</p>
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-yellow-500 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Edit Maintenance Details</h1>
                            <p className="text-gray-500 mt-1">
                                Asset: {asset?.name} (SN: {asset?.Serial_number})
                            </p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-full">
                            <Box size={24} className="text-yellow-500" />
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
                                <p className="font-medium text-green-800">Maintenance details updated successfully!</p>
                                <p className="text-green-600 text-sm">You will be redirected back to asset details.</p>
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

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="p-6">
                        {/* Maintenance Information */}
                        <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Maintenance Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Maintenance Type - Readonly since we don't want to change this */}
                            <div>
                                <label htmlFor="maintenance_type" className="block font-medium text-sm mb-1 text-gray-700">
                                    Maintenance Type
                                </label>
                                <select
                                    id="maintenance_type"
                                    name="maintenance_type"
                                    value={formData.maintenance_type}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    required
                                >
                                    <option value="Repair">Repair</option>
                                    <option value="Replacement">Replacement</option>
                                </select>
                            </div>

                            {/* Expected Return Date */}
                            <div>
                                <label htmlFor="expected_date_of_return" className="block font-medium text-sm mb-1 text-gray-700">
                                    Expected Return Date
                                </label>
                                <input
                                    type="date"
                                    id="expected_date_of_return"
                                    name="expected_date_of_return"
                                    value={formData.expected_date_of_return}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    required
                                />
                            </div>

                            {/* Maintenance Cost */}
                            <div>
                                <label htmlFor="maintenance_cost" className="block font-medium text-sm mb-1 text-gray-700">
                                    Maintenance Cost
                                </label>
                                <input
                                    type="number"
                                    id="maintenance_cost"
                                    name="maintenance_cost"
                                    value={formData.maintenance_cost}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Vendor Information */}
                        <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Vendor Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Vendor Name */}
                            <div>
                                <label htmlFor="vendor_name" className="block font-medium text-sm mb-1 text-gray-700">
                                    Vendor Name
                                </label>
                                <input
                                    type="text"
                                    id="vendor_name"
                                    name="vendor_name"
                                    value={formData.vendor_name}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    required
                                    placeholder="Enter vendor name"
                                />
                            </div>

                            {/* Vendor Contact */}
                            <div>
                                <label htmlFor="vendor_contact" className="block font-medium text-sm mb-1 text-gray-700">
                                    Vendor Contact
                                </label>
                                <input
                                    type="text"
                                    id="vendor_contact"
                                    name="vendor_contact"
                                    value={formData.vendor_contact}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    required
                                    placeholder="Enter vendor contact number"
                                />
                            </div>

                            {/* Vendor Email */}
                            <div>
                                <label htmlFor="vendor_email" className="block font-medium text-sm mb-1 text-gray-700">
                                    Vendor Email
                                </label>
                                <input
                                    type="email"
                                    id="vendor_email"
                                    name="vendor_email"
                                    value={formData.vendor_email}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    required
                                    placeholder="Enter vendor email"
                                />
                            </div>

                            {/* Vendor Address */}
                            <div className="md:col-span-2">
                                <label htmlFor="vendor_address" className="block font-medium text-sm mb-1 text-gray-700">
                                    Vendor Address
                                </label>
                                <textarea
                                    id="vendor_address"
                                    name="vendor_address"
                                    value={formData.vendor_address}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    required
                                    rows="3"
                                    placeholder="Enter vendor address"
                                />
                            </div>
                        </div>

                        {/* Maintenance Description */}
                        <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-4">Maintenance Details</h2>

                        <div className="mb-6">
                            <label htmlFor="description" className="block font-medium text-sm mb-1 text-gray-700">
                                Maintenance Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                required
                                rows="4"
                                placeholder="Describe the maintenance needed for this asset"
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between space-x-4 border-t">
                        <button
                            type="button"
                            onClick={handleMarkAsCompleted}
                            disabled={isSubmitting}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                            {isSubmitting ? "Processing..." : "Mark as Completed"}
                        </button>

                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/assets/details/${id}`)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Update Maintenance Details'
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Navigation Link */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => navigate(`/admin/assets/details/${id}`)}
                        className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mx-auto transition-all duration-200"
                    >
                        <ChevronLeft size={16} />
                        <span className="text-sm">Back to Asset Details</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Edit_maintenance;
