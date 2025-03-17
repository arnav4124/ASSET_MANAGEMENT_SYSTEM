import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaUserTag } from 'react-icons/fa';

function Profile() {
    const [data, setData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        location: '',
        role: ''
    });
    const [editing, setEditing] = useState(false);
    const [updatedData, setUpdatedData] = useState({});
    const [message, setMessage] = useState(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [locationOptions, setLocationOptions] = useState([]);
    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem("user"))._id;

        axios.get(`http://localhost:3487/my-profile/${userId}`)
            .then((res) => {
                let userData = res.data?.user || res.data;
                if (userData) {
                    setData({
                        first_name: userData.first_name || '',
                        last_name: userData.last_name || '',
                        email: userData.email || '',
                        location: userData.location || '',
                        role: userData.role || ''
                    });
                    setUpdatedData(userData);

                    if (userData.role === 'Superuser') {
                        axios.get('http://localhost:3487/api/locations', {
                            headers: { token: localStorage.getItem("token") }
                        })
                            .then((resp) => {
                                setLocationOptions(resp.data || []);
                            })
                            .catch((err) => {
                                console.error("Error fetching location options", err);
                            });
                    }

                }
            })
            .catch((err) => {
                console.log("API Error:", err);
                setMessage({ type: 'error', text: 'Error getting profile' });
            });
    }, []);

    const handleChange = (e) => {
        setUpdatedData({ ...updatedData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const userId = JSON.parse(localStorage.getItem("user"))._id;
        axios.put(`http://localhost:3487/update-profile/${userId}`, updatedData, 
            { headers: { token: localStorage.getItem("token") } }
        )
            .then(() => {
                setData(updatedData);
                setEditing(false);
                setMessage({ type: 'success', text: 'Profile updated successfully' });
            })
            .catch((err) => {
                console.log("API Error:", err);
                setMessage({ type: 'error', text: 'Error updating profile' });
            });
    };

    const handlePasswordChange = () => {
        const userId = JSON.parse(localStorage.getItem("user"))._id;
        console.log("Changing password for user:", userId);
        axios.put(`http://localhost:3487/change-password/${userId}`, { currentPassword, newPassword },
            {   withCredentials: true,
                headers: { token: localStorage.getItem("token") }} 
        )
            .then((res) => {
                console.log("Password change response:", res.data);
                if(res.data.success){
                    setMessage({ type: 'success', text: 'Password changed successfully' });
                    setCurrentPassword('');
                    setNewPassword('');
                }else{
                    setMessage({ type: 'error', text: res.data.message || 'Error changing password' });
                }
            })
            .catch((err) => {
                console.log("Error changing password:", err);
                setMessage({ type: 'error', text: err.response?.data?.message || 'Error changing password' });
            }
            );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-xl p-8">
                <div className="flex items-center justify-center mb-8">
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <FaUser className="text-white text-5xl" />
                    </div>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">My Profile</h2>
                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} shadow-md`}>
                        {message.text}
                    </div>
                )}
                <div className='grid grid-cols-1 gap-6'>
                    <div className="grid grid-cols-2 gap-6">
                        {['first_name', 'last_name'].map((key) => (
                            <div key={key} className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <h3 className="font-semibold text-gray-600 mb-2 flex items-center">
                                    <FaUser className="mr-2" />
                                    {key.replace('_', ' ').toUpperCase()}
                                </h3>
                                {editing ? (
                                    <input
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        type='text'
                                        name={key}
                                        value={updatedData[key] || ''}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <p className="text-gray-800 text-lg">{data[key]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="font-semibold text-gray-600 mb-2 flex items-center">
                            <FaEnvelope className="mr-2" />
                            EMAIL
                        </h3>
                        <p className="text-gray-800 text-lg">{data.email}</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="font-semibold text-gray-600 mb-2 flex items-center">
                            <FaMapMarkerAlt className="mr-2" />
                            LOCATION
                        </h3>
                        {editing && data.role === 'Superuser' ? (
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                name="location"
                                value={updatedData.location || ''}
                                onChange={handleChange}
                            >
                                <option value="">Select location</option>
                                {locationOptions.map(loc => (
                                    <option key={loc._id} value={loc._id}>{loc.location_name}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-gray-800 text-lg">{data.location}</p>
                        )}
                    </div>

                    {editing ? (
                        <div className="bg-gray-50 p-6 mt-6 rounded-lg shadow-md transition-shadow">
                            <h3 className="font-semibold text-gray-600 mb-4">Change Password</h3>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Current Password</label>
                                <input
                                    type="password"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
                                <input
                                    type="password"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <button
                                className="bg-red-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-red-700 transition-colors text-lg font-semibold"
                                onClick={handlePasswordChange}
                            >
                                Update Password
                            </button>
                        </div>

                    ) : null}




                    <div className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="font-semibold text-gray-600 mb-2 flex items-center">
                            <FaUserTag className="mr-2" />
                            ROLE
                        </h3>
                        {editing ? (
                            <input
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                type='text'
                                name="role"
                                value={updatedData.role || ''}
                                onChange={handleChange}
                            />
                        ) : (
                            <p className="text-gray-800 text-lg">{data.role}</p>
                        )}
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    {editing ? (
                        <button
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                            onClick={handleSave}
                        >
                            Save Changes
                        </button>
                    ) : (
                        <button
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                            onClick={() => setEditing(true)}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
}

export default Profile;
