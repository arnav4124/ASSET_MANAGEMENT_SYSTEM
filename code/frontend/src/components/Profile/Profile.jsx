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
        axios.put(`http://localhost:3487/update-profile/${userId}`, updatedData)
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
                        {editing ? (
                            <input
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                type='text'
                                name="location"
                                value={updatedData.location || ''}
                                onChange={handleChange}
                            />
                        ) : (
                            <p className="text-gray-800 text-lg">{data.location}</p>
                        )}
                    </div>

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
        </div>
    );
}

export default Profile;
