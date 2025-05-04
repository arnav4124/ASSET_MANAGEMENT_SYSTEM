import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, ChevronLeft, Check, Loader2, X, AlertCircle } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';



const EditUser = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [verified, setVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(true); // Start with loading true
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");
    const [locations, setLocations] = useState([]);
    const [userData, setUserData] = useState(null);
    const [userAssets, setUserAssets] = useState([]);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState({});
    const [selectedLocation, setSelectedLocation] = useState("");
    const [showDeactivationModal, setShowDeactivationModal] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    useEffect(() => {
        const token_st = localStorage.getItem("token");
        const token = localStorage.getItem('token');

        // Validate token and role first
        if (!token) {
            navigate('/login');
            return;
        } else {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || user.role !== 'Admin') {
                    navigate('/login');
                    return;
                }
            } catch (err) {
                console.error("Error parsing user data:", err);
                navigate('/login');
                return;
            }
        }

        if (!token_st) {
            alert("unauthorized_access");
            navigate("/login");
            return;
        }

        // Validate userId
        if (!userId) {
            setError("Invalid user ID");
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:3487/api/admin/user/${userId}`, {
                    headers: {
                        token: token_st
                    }
                });
                if (!response.data) {
                    throw new Error("No user data returned");
                }
                setUserData(response.data);
                setSelectedLocation(response.data.location || "");
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Error fetching user data: " + (err.response?.data?.message || err.message));
                setLoading(false);
            }
        };

        const fetchUserAssets = async () => {
            try {
                const response = await axios.get(`http://localhost:3487/api/assets/get_user_assets/${userId}`, {
                    headers: {
                        token: token_st
                    }
                });
                const assets = response.data || [];
                setUserAssets(assets);

                // Initialize all assets as selected (to be retained)
                const initialSelection = {};
                assets.forEach(asset => {
                    if (asset && asset._id) {
                        initialSelection[asset._id] = true;
                    }
                });
                setSelectedAssets(initialSelection);
            } catch (err) {
                console.error("Error fetching user assets:", err);
                // Don't set error here as it's not critical
            }
        };

        const fetchLocations = async () => {
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
                    return;
                }
                setLocations(response.data || []);
            } catch (err) {
                console.log("Error fetching locations:", err)
                setError("Error fetching locations: " + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
                setVerified(true);
            }
        }

        // Execute all fetch operations
        Promise.all([fetchUserData(), fetchUserAssets(), fetchLocations()])
            .catch(err => {
                console.error("Error in data fetching:", err);
                setLoading(false);
            });

    }, [navigate, userId]);

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

    const handleLocationChange = (e) => {
        const newLocation = e.target.value;
        setSelectedLocation(newLocation);
    };

    const toggleAssetSelection = (assetId) => {
        setSelectedAssets(prev => ({
            ...prev,
            [assetId]: !prev[assetId]
        }));
    };

    const onSubmit = async (data) => {
        try {
            console.log("user assets",userAssets)
            setLoading(true)
            setError(null)
            setShowSuccess(false)
            setIsSubmitting(true)

            // If the location has changed and user has assets, show the modal
            if (userData && userData.location !== data.location && userAssets.length > 0) {
                setShowAssetModal(true);
                setLoading(false);
                setIsSubmitting(false);
                return;
            }

            // Otherwise, proceed with updating just the location
            await updateUserLocation(data.location, {});
        }
        catch (err) {
            console.error("Error updating user:", err);
            setMessage(err.response?.data?.message || "Error updating user")
            setError("Error updating user: " + (err.response?.data?.message || err.message))
            setLoading(false);
            setIsSubmitting(false);
        }
        
    }

    const updateUserLocation = async (newLocation, assetSelections = selectedAssets) => {
        try {
            if (!userId) {
                throw new Error("Invalid user ID");
            }

            setLoading(true);
            setIsSubmitting(true);
            console.log("Updating user location to:", newLocation);
            console.log("Selected assets:", assetSelections);
            const user = JSON.parse(localStorage.getItem('user'));
            const admin_id = user._id;
            const response = await axios.put(`http://localhost:3487/api/admin/edit_user/${userId}`, {
                location: newLocation,
                assetSelections,
                // send admin id
                admin_id: admin_id
            }, {
                headers: {
                    token: localStorage.getItem("token")
                }
            });

            console.log(response);
            if (response.status === 200) {
                setShowSuccess(true);
                setMessage("User updated successfully");
                setShowAssetModal(false);
                setTimeout(() => {
                    navigate("/admin/view_users");
                }, 2000);
            }
        } catch (err) {
            console.error("Error updating user:", err);
            setMessage(err.response?.data?.message || "Error updating user");
            setError("Error updating user: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
            setIsSubmitting(false);
            window.scrollTo(0, 0);
        }
    };

    const confirmAssetTransfer = () => {
        updateUserLocation(selectedLocation, selectedAssets);
    };

    const AssetSelectionModal = () => {
        if (!showAssetModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Select Assets to Retain</h2>

                    <div className="p-6">
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-yellow-700">
                                        You're changing this user's location from <span className="font-semibold">{userData.location}</span> to <span className="font-semibold">{selectedLocation}</span>.
                                    </p>
                                    <p className="text-yellow-700 mt-2">
                                        Select which assets should move with the user to the new location. Unselected assets will be unassigned and remain at their current location.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {userAssets.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No assets assigned to this user</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Select
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Asset Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Current Location
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {userAssets.map((asset) => (
                                            <tr key={asset._id} className={selectedAssets[asset._id] ? "bg-blue-50" : ""}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        id={`asset-${asset._id}`}
                                                        checked={selectedAssets[asset._id] || false}
                                                        onChange={() => toggleAssetSelection(asset._id)}
                                                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {asset.name || 'Unnamed Asset'}
                                                    </div>
                                                    {asset.Serial_number && (
                                                        <div className="text-xs text-gray-500">
                                                            SN: {asset.Serial_number}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        {asset.asset_type || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {asset.Office || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {selectedAssets[asset._id] ? (
                                                        <span className="text-blue-600 font-medium">
                                                            Move to {selectedLocation}
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-600 font-medium">
                                                            Unassign & keep at {asset.Office || 'current location'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            onClick={() => {
                                setShowAssetModal(false);
                                setIsSubmitting(false);
                            }}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmAssetTransfer}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Updating...
                                </span>
                            ) : (
                                'Confirm Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleDeactivateUser = async () => {
        try {
            setIsDeactivating(true);
            
            const response = await axios.put(
                `http://localhost:3487/api/admin/deactivate_user/${userId}`, 
                {},
                {
                    headers: {
                        token: localStorage.getItem("token")
                    }
                }
            );
    
            if (response.status === 200) {
                setShowSuccess(true);
                setMessage("User deactivated successfully");
                setShowDeactivationModal(false);
                
                // Increase the timeout to ensure the message is visible
                setTimeout(() => {
                    navigate("/admin/view_users");
                }, 2500);
            }
        } catch (err) {
            console.error("Error deactivating user:", err);
            setError("Error deactivating user: " + (err.response?.data?.message || err.message));
        } finally {
            setIsDeactivating(false);
        }
    };

    const DeactivationModal = () => {
        if (!showDeactivationModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Remove User</h2>

                    <div className="p-6">
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-red-700 font-medium">
                                        You are about to deactivate {userData.first_name} {userData.last_name}
                                    </p>
                                    <p className="text-red-700 mt-2">
                                        This user will be marked as inactive and removed from all projects.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {userAssets.length > 0 ? (
                            <>
                                <p className="text-gray-700 mb-4">
                                    The following assets will be unassigned and kept at <span className="font-semibold">{userData.location}</span>:
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Asset Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Current Location
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {userAssets.map((asset) => (
                                                <tr key={asset._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {asset.name || 'Unnamed Asset'}
                                                        </div>
                                                        {asset.Serial_number && (
                                                            <div className="text-xs text-gray-500">
                                                                SN: {asset.Serial_number}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                            {asset.asset_type || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {asset.Office || 'Unknown'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-500 py-4">No assets assigned to this user</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            onClick={() => setShowDeactivationModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeactivateUser}
                            disabled={isDeactivating}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeactivating ? (
                                <span className="flex items-center">
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Processing...
                                </span>
                            ) : (
                                'Confirm Removal'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Show error page if needed
    if (error && !loading && !userData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-red-100 p-3 rounded-full">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Error Loading User</h2>
                    <p className="text-gray-600 text-center mb-6">{error}</p>
                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate('/admin/view_users')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Back to Users List
                        </button>
                    </div>
                </div>
            </div>
        );
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

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <AlertCircle size={32} className="text-yellow-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">User Not Found</h2>
                    <p className="text-gray-600 text-center mb-6">The requested user could not be found.</p>
                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate('/admin/view_users')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Back to Users List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <AssetSelectionModal />
            <DeactivationModal />
            <div className="max-w-4xl mx-auto"></div>
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
                                value={userData.first_name || ''}
                                disabled
                                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Last Name</label>
                            <input
                                type="text"
                                value={userData.last_name || ''}
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
                                value={userData.email || ''}
                                disabled
                                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-sm mb-1 text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                value={userData.phoneNumber || ''}
                                disabled
                                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block font-medium text-sm mb-1 text-gray-700">Status</label>
                        <div className="flex items-center">
                            <span 
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    userData.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                            >
                                <span className={`h-2 w-2 rounded-full mr-2 ${
                                    userData.active !== false ? 'bg-green-500' : 'bg-red-500'
                                }`}></span>
                                {userData.active !== false ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-2">Update Information</h2>

                    <h2 className="text-lg font-medium text-gray-700 mb-4">Select Location</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {locations.length === 0 ? (
                            <div className="col-span-2 text-center text-gray-500 py-4">
                                No locations available
                            </div>
                        ) : (
                            locations.map((loc, index) => (
                                <label key={index} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        value={loc}
                                        {...register("location", { required: "Please select a location" })}
                                        className="form-radio"
                                        defaultChecked={loc === userData.location}
                                        onChange={handleLocationChange}
                                    />
                                    <span>{loc}</span>
                                </label>
                            ))
                        )}
                    </div>
                    {errors.location && (
                        <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
                    )}

                    {userAssets.length > 0 && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                    <AlertCircle size={18} className="text-blue-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        This user has <span className="font-semibold">{userAssets.length}</span> assigned assets. Changing location will prompt you to choose which assets to keep with the user.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-6 flex justify-between border-t">
                    <button
                        type="button"
                        onClick={() => setShowDeactivationModal(true)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 flex items-center gap-2"
                    >
                        <X size={18} />
                        Remove User
                    </button>
                    
                    <div className="flex">
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
    );
};

export default EditUser;