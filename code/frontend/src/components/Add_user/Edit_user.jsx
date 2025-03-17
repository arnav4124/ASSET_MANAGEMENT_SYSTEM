import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, ChevronLeft, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';

const EditUser = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [verified, setVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");
    const [locations, setLocations] = useState([]);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token_st = localStorage.getItem("token")
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
        }
        else {
            const role = JSON.parse(localStorage.getItem('user')).role
            console.log(role)

            if (role !== 'Admin') {
                navigate('/login')
            }
        }
        if (!token_st) {
            alert("unauthorized_access")
            navigate("/login")
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:3487/api/admin/user/${userId}`, {
                    headers: {
                        token: token_st
                    }
                });
                setUserData(response.data);
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Error fetching user data");
            }
        };

        const fetchLocations = async () => {
            setLoading(true)
            try {
                console.log("SENDING REQ FOR LOCATIONS")
                const response = await axios.get("http://localhost:3487/api/locations/get_all_cities", {
                    headers: {
                        token: token_st
                    }
                })
                if (response?.data?.success === false) {
                    alert("unauthorized_access")
                    navigate("/login")
                }
                console.log(response)
                setLocations(response.data)
            }
            catch (err) {
                console.log("Error fetching locations:", err)
                setError("Error fetching locations")
            }
            finally {
                setLoading(false)
                setVerified(true)
            }
        }

        fetchUserData();
        fetchLocations();
    }, [navigate, userId])

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm({
        defaultValues: {
            location: ""
        }
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true)
            setError(null)
            setShowSuccess(false)
            setIsSubmitting(true)
            console.log("Submitting data:")
            console.log(data)
            const response = await axios.put(`http://localhost:3487/api/admin/edit_user/${userId}`, {
                location: data.location
            }, {
                headers: {
                    token: localStorage.getItem("token")
                }
            })
            console.log(response)
            if (response.status === 200) {
                setShowSuccess(true);
                setMessage("User updated successfully")
                setTimeout(() => {
                    navigate("/admin/view_users");
                }, 2000);
            }
        }
        catch (err) {
            console.error("Error updating user:", err);
            setMessage(err.response?.data?.message || "Error updating user")
            setError("Error updating user")
        }
        finally {
            setLoading(false)
            setIsSubmitting(false)
            window.scrollTo(0, 0);
        }
    }

    if (!verified || !userData) {
        return <div>Loading...</div>
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="text-white text-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
                            <p className="text-gray-500 mt-1">Update user details</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <UserPlus size={24} className="text-blue-500" />
                        </div>
                    </div>
                </div>

                {showSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-md animate-fadeIn">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-full mr-3">
                                <Check size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">User updated successfully!</p>
                                <p className="text-green-600 text-sm">Redirecting to users list...</p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">User Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    value={userData.first_name}
                                    disabled
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    value={userData.last_name}
                                    disabled
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={userData.email}
                                    disabled
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    value={userData.phoneNumber}
                                    disabled
                                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                                />
                            </div>
                        </div>

                        <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-2">Update Information</h2>

                        <h2 className="text-lg font-medium text-gray-700 mb-4">Select Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {locations.map((loc, index) => (
                                <label key={index} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        value={loc}
                                        {...register("location", { required: "Please select a location" })}
                                        className="form-radio"
                                        defaultChecked={loc === userData.location}
                                    />
                                    <span>{loc}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 flex justify-end border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/view_users')}
                            className="px-4 py-2 mr-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Update User
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mx-auto transition-all duration-200"
                        onClick={() => navigate('/admin/view_users')}
                    >
                        <ChevronLeft size={16} />
                        <span className="text-sm">Back to User List</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUser;
