import React, { useState, useEffect } from 'react';
import { Box, ChevronLeft, Loader2, Check, Users, FolderGit2 } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AssignAsset = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignType, setAssignType] = useState("user");
    const [assignList, setAssignList] = useState([]);
    const [selectedValue, setSelectedValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {

        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/login');
        } else {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user.role !== "Admin") {
                navigate('/login');
            }
        }
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const adminData = JSON.parse(localStorage.getItem("user"));
                const adminLocation = adminData.location;
                console.log("Admin location:", adminLocation);
                const endpoint = assignType === "user"
                    ? `user?adminLocation=${adminLocation}`
                    : "projects";
                const res = await axios.get(`http://localhost:3487/api/${endpoint}`, {
                    withCredentials: true,
                    headers: {
                        token: localStorage.getItem("token"),
                    },
                });
                setAssignList(res.data);
                console.log(res.data);
            } catch (error) {
                console.error("Fetch error:", error);
                setError("Failed to fetch " + (assignType === "user" ? "users" : "projects"));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [assignType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setShowSuccess(false);

        try {
            await axios.post(`http://localhost:3487/api/assets/assign_asset/${id}`, {
                assignType,
                assignId: selectedValue
            });
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/admin/assets');
            }, 2000);
        } catch (error) {
            console.error("Assign error:", error);
            setError("Failed to assign asset. Please try again.");
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
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Assign Asset</h1>
                            <p className="text-gray-500 mt-1">Select a user or project to assign this asset</p>
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
                                <p className="font-medium text-green-800">Asset assigned successfully!</p>
                                <p className="text-green-600 text-sm">The asset has been assigned.</p>
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
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="p-8">
                        {/* Assignment Type */}
                        <h2 className="text-xl font-medium text-gray-700 mb-6 border-b pb-2 text-center">Assignment Details</h2>

                        <div className="space-y-8">
                            {/* Assign Type Selection */}
                            <div className="flex flex-col items-center">
                                <label className="block font-medium text-base mb-4 text-gray-700">Assign to:</label>
                                <div className="flex justify-center gap-6 w-full max-w-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setAssignType("user")}
                                        className={`flex-1 py-6 px-8 border-2 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md ${assignType === "user"
                                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                                            }`}
                                    >
                                        <Users size={24} className={assignType === "user" ? "text-blue-600" : "text-gray-400"} />
                                        <span className="text-lg font-medium">User</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAssignType("project")}
                                        className={`flex-1 py-6 px-8 border-2 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md ${assignType === "project"
                                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                                            }`}
                                    >
                                        <FolderGit2 size={24} className={assignType === "project" ? "text-blue-600" : "text-gray-400"} />
                                        <span className="text-lg font-medium">Project</span>
                                    </button>
                                </div>
                            </div>

                            {/* Selection Dropdown */}
                            <div className="flex flex-col items-center">
                                <label className="block font-medium text-base mb-3 text-gray-700">
                                    {assignType === "user" ? "Select User" : "Select Project"}
                                </label>
                                <div className="w-full max-w-2xl">
                                    <select
                                        value={selectedValue}
                                        onChange={(e) => setSelectedValue(e.target.value)}
                                        className="w-full p-4 text-lg border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 outline-none hover:border-blue-300"
                                        required
                                    >
                                        <option value="">--Choose {assignType === "user" ? "a user" : "a project"}--</option>
                                        {assignList.map((item) => (
                                            <option key={item._id} value={item._id}>
                                                {assignType === "user"
                                                    ? `${item.first_name} ${item.last_name}`
                                                    : item.Project_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="bg-gray-50 px-8 py-6 flex justify-center items-center space-x-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/assets')}
                            className="min-w-[140px] py-3 px-6 border-2 border-gray-200 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedValue}
                            className={`min-w-[180px] py-3 px-6 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 flex items-center justify-center ${(isSubmitting || !selectedValue) ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin mr-2" />
                                    Assigning...
                                </>
                            ) : (
                                'Assign Asset'
                            )}
                        </button>
                    </div>
                </form>

                {/* Navigation Link */}
                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/assets')}
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 font-medium transition-all duration-200 group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="text-base">Back to Assets List</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignAsset;