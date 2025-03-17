import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>
                {message && (
                    <div className={`p-3 mb-4 rounded-md text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {message.text}
                    </div>
                )}
                <div className='grid grid-cols-1 gap-4'>
                    {['first_name', 'last_name', 'location', 'role'].map((key) => (
                        <div key={key}>
                            <h3 className="font-semibold text-gray-600">{key.replace('_', ' ').toUpperCase()}</h3>
                            {editing ? (
                                <input 
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    type='text' 
                                    name={key} 
                                    value={updatedData[key] || ''} 
                                    onChange={handleChange} 
                                />
                            ) : (
                                <p className="text-gray-800">{data[key]}</p>
                            )}
                        </div>
                    ))}
                    <div>
                        <h3 className="font-semibold text-gray-600">EMAIL</h3>
                        <p className="text-gray-800">{data.email}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    {editing ? (
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md" onClick={handleSave}>Save</button>
                    ) : (
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md" onClick={() => setEditing(true)}>Edit</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
