import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    ChevronLeft, Clock, User, Wrench, CheckCircle, Package, ClipboardEdit, BarChart4,
    TagIcon, UserMinus, ArrowDownCircle, HardDrive, ShieldAlert,
    AlertTriangle, Truck, CircleDashed, MapPin, MoveRight, ArrowRightLeft,
    Calendar, Building
} from "lucide-react";

const Asset_history = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assetHistory, setAssetHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

        const fetchAssetHistory = async () => {
            try {
                const response = await axios.get(`http://localhost:3487/api/assets/${id}/history`, {
                    withCredentials: true,
                    headers: { token: localStorage.getItem("token") }
                });

                setAssetHistory(response.data);
                setLoading(false);

                // Process history records to populate user details if needed
                if (response.data && response.data.history && response.data.history.length > 0) {
                    const processedHistory = await Promise.all(response.data.history.map(async (record) => {
                        // If the record is a transfer and issued_to is an ID, try to fetch user details
                        if (record.operation_type === 'Transferred' && record.issued_to && typeof record.issued_to === 'string') {
                            try {
                                const userResponse = await axios.get(`http://localhost:3487/api/users/${record.issued_to}`, {
                                    headers: { token: localStorage.getItem("token") }
                                });
                                if (userResponse.data) {
                                    record.issued_to = userResponse.data;
                                }
                            } catch (err) {
                                console.error("Error fetching user details:", err);
                            }
                        }

                        // If performed_by is an ID, try to fetch user details
                        if (record.performed_by && typeof record.performed_by === 'string') {
                            try {
                                const adminResponse = await axios.get(`http://localhost:3487/api/users/${record.performed_by}`, {
                                    headers: { token: localStorage.getItem("token") }
                                });
                                if (adminResponse.data) {
                                    record.performed_by = adminResponse.data;
                                }
                            } catch (err) {
                                console.error("Error fetching admin details:", err);
                            }
                        }

                        return record;
                    }));

                    // Update history with populated user details
                    setAssetHistory({
                        ...response.data,
                        history: processedHistory
                    });
                }
            } catch (error) {
                console.error("Error fetching asset history:", error);
                setError("Failed to load asset history. Please try again later.");
                setLoading(false);
            }
        };

        fetchAssetHistory();
    }, [id, navigate]);

    // Format date to readable format
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Helper function to get user or project name
    const getAssigneeName = (record) => {
        if (!record.issued_to) {
            return 'Unknown';
        }

        if (record.assignment_type === 'Project') {
            return record.issued_to.Project_name || 'Unknown Project';
        } else {
            // For Individual assignments
            const firstName = record.issued_to.first_name || 'Unknown';
            const lastName = record.issued_to.last_name || 'User';
            return `${firstName} ${lastName}`;
        }
    };

    // Helper function to get transfer recipient name
    const getTransferRecipientName = (record) => {
        if (!record.issued_to) {
            return 'Unknown User';
        }

        // Check if issued_to is populated as an object with user details
        if (typeof record.issued_to === 'object' && record.issued_to !== null) {
            if (record.issued_to.first_name && record.issued_to.last_name) {
                return `${record.issued_to.first_name} ${record.issued_to.last_name}`;
            } else if (record.issued_to.email) {
                return record.issued_to.email;
            }
        }

        // If it's just an ID or other value
        return 'User ID: ' + record.issued_to;
    };

    // Helper function to get operation details
    const getOperationDetails = (record) => {
        switch (record.operation_type) {
            case 'Added':
                return {
                    icon: <Package size={18} className="text-white" />,
                    color: "bg-green-500",
                    title: "Asset Added"
                };
            case 'Created':
                return {
                    icon: <Package size={18} className="text-white" />,
                    color: "bg-green-500",
                    title: "Asset Created"
                };
            case 'Assigned':
                return {
                    icon: <User size={18} className="text-white" />,
                    color: "bg-blue-500",
                    title: `Assigned to ${getAssigneeName(record)}`
                };
            case 'Unassigned':
                return {
                    icon: <UserMinus size={18} className="text-white" />,
                    color: "bg-orange-500",
                    title: "Asset Unassigned"
                };
            case 'Updated':
                return {
                    icon: <ClipboardEdit size={18} className="text-white" />,
                    color: "bg-purple-500",
                    title: "Asset Updated"
                };
            case 'Maintenance_Sent':
                return {
                    icon: <Wrench size={18} className="text-white" />,
                    color: "bg-yellow-500",
                    title: `Sent for ${record.maintenance_type?.toLowerCase() || 'maintenance'}`
                };
            case 'Maintenance_Completed':
                return {
                    icon: <CheckCircle size={18} className="text-white" />,
                    color: "bg-teal-500",
                    title: `Returned from ${record.maintenance_type?.toLowerCase() || 'maintenance'}`
                };
            case 'Disposed':
                return {
                    icon: <AlertTriangle size={18} className="text-white" />,
                    color: "bg-red-500",
                    title: "Asset Disposed"
                };
            case 'Inactive':
                return {
                    icon: <CircleDashed size={18} className="text-white" />,
                    color: "bg-gray-500",
                    title: "Asset Deactivated"
                };
            case 'Repair':
                return {
                    icon: <Wrench size={18} className="text-white" />,
                    color: "bg-amber-500",
                    title: "Asset Repair"
                };
            case 'Removed':
                return {
                    icon: <CircleDashed size={18} className="text-white" />,
                    color: "bg-gray-500",
                    title: "Asset Deactivated"
                };
            case 'Location_Changed':
                return {
                    icon: <Building size={18} className="text-white" />,
                    color: "bg-blue-400",
                    title: "Location Changed"
                };
            case 'Transferred':
                return {
                    icon: <ArrowRightLeft size={18} className="text-white" />,
                    color: "bg-indigo-500",
                    title: "Asset Transferred"
                };
            default:
                return {
                    icon: <HardDrive size={18} className="text-white" />,
                    color: "bg-gray-500",
                    title: "Operation Performed"
                };
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="text-white text-xl text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl font-semibold">Loading...</p>
                    <p className="text-sm text-gray-300 mt-2">Please wait while we fetch the asset history</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
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
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Asset History</h1>
                            <p className="text-gray-500 mt-1">
                                {assetHistory?.asset?.name}
                                {assetHistory?.asset?.Serial_number && ` (SN: ${assetHistory?.asset?.Serial_number})`}
                                {assetHistory?.asset?.Sticker_seq && ` - ${assetHistory?.asset?.Sticker_seq}`}
                            </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Clock size={24} className="text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Timeline</h2>

                        {assetHistory?.history?.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="bg-gray-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Clock size={28} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500">No history records found for this asset.</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute top-0 bottom-0 left-6 ml-px w-0.5 bg-gray-200"></div>
                                <ul className="space-y-6">
                                    {assetHistory?.history?.map((record, index) => {
                                        const { icon, color, title } = getOperationDetails(record);

                                        return (
                                            <li key={record._id || index} className="relative pl-10">
                                                <div className={`absolute left-0 top-1 rounded-full p-2 ${color}`}>
                                                    {icon}
                                                </div>
                                                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h3 className="font-medium text-gray-900">{title}</h3>
                                                        <span className="text-sm text-gray-500">
                                                            {formatDate(record.operation_time)}
                                                        </span>
                                                    </div>

                                                    <p className="text-gray-600 mb-2">{record.comments}</p>

                                                    {/* Additional details based on record type */}
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        {record.operation_type === 'Assigned' && (
                                                            <div className="flex flex-col space-y-1">
                                                                <div className="flex items-center text-sm">
                                                                    <span className="text-gray-500 mr-2">Assigned to:</span>
                                                                    <span className="font-medium text-gray-700">
                                                                        {getAssigneeName(record)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center text-sm">
                                                                    <span className="text-gray-500 mr-2">Assignment Type:</span>
                                                                    <span className="font-medium text-gray-700">
                                                                        {record.assignment_type === 'Project' ? 'Project' : 'Individual User'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {record.operation_type === 'Transferred' && (
                                                            <div className="flex flex-col space-y-1">
                                                                {record.issued_to && (
                                                                    <div className="flex items-center text-sm">
                                                                        <span className="text-gray-500 mr-2">Transferred to:</span>
                                                                        <span className="font-medium text-gray-700">
                                                                            {getTransferRecipientName(record)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center text-sm">
                                                                    <span className="text-gray-500 mr-2">Transfer Type:</span>
                                                                    <span className="font-medium text-gray-700">
                                                                        {record.assignment_type || 'Individual'}
                                                                    </span>
                                                                </div>
                                                                {record.old_location && (
                                                                    <div className="flex items-center text-sm">
                                                                        <span className="text-gray-500 mr-2">From Location:</span>
                                                                        <span className="font-medium text-blue-600">
                                                                            {record.old_location}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {record.new_location && (
                                                                    <div className="flex items-center text-sm">
                                                                        <span className="text-gray-500 mr-2">To Location:</span>
                                                                        <span className="font-medium text-green-600">
                                                                            {record.new_location}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {record.old_location && record.new_location && (
                                                                    <div className="mt-1 bg-gray-50 p-2 rounded flex items-center text-sm">
                                                                        <MapPin size={14} className="text-blue-500 mr-1" />
                                                                        <span className="text-blue-600 font-medium">{record.old_location}</span>
                                                                        <MoveRight size={14} className="mx-2 text-gray-400" />
                                                                        <span className="text-green-600 font-medium">{record.new_location}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {(record.operation_type === 'Maintenance_Sent' || record.operation_type === 'Maintenance_Completed') && (
                                                            <div className="flex flex-col space-y-1">
                                                                <div className="flex items-center text-sm">
                                                                    <span className="text-gray-500 mr-2">Vendor:</span>
                                                                    <span className="font-medium text-gray-700">{record.vendor_name}</span>
                                                                </div>
                                                                <div className="flex items-center text-sm">
                                                                    <span className="text-gray-500 mr-2">Maintenance Type:</span>
                                                                    <span className="font-medium text-gray-700">{record.maintenance_type}</span>
                                                                </div>
                                                                {record.maintenance_cost && (
                                                                    <div className="flex items-center text-sm">
                                                                        <span className="text-gray-500 mr-2">Cost:</span>
                                                                        <span className="font-medium text-gray-700">₹{record.maintenance_cost}</span>
                                                                    </div>
                                                                )}
                                                                {record.expected_return_date && (
                                                                    <div className="flex items-center text-sm">
                                                                        <span className="text-gray-500 mr-2">Expected Return:</span>
                                                                        <span className="font-medium text-gray-700">
                                                                            {formatDate(record.expected_return_date)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {record.operation_type === 'Location_Changed' && (
                                                            <div className="flex flex-col space-y-1">
                                                                {/* Display previous and new location if available */}
                                                                {record.comments && record.comments.includes('from') && (
                                                                    <div className="flex items-center text-sm">
                                                                        <span className="text-gray-700">{record.comments}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Administrator who performed the action */}
                                                        {record.performed_by && (
                                                            <div className="flex items-center text-sm mt-2">
                                                                <span className="text-gray-500 mr-2">Done by:</span>
                                                                <span className="font-medium text-gray-700">
                                                                    {typeof record.performed_by === 'object' && record.performed_by !== null ?
                                                                        `${record.performed_by.first_name || ''} ${record.performed_by.last_name || ''}`.trim() || 'Unknown Admin' :
                                                                        `Admin ID: ${record.performed_by}`
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

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

export default Asset_history; 