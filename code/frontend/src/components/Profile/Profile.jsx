import React, { useState, useEffect } from 'react';
import './Profile.css';
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

    useEffect(() => {
        const userId = localStorage.getItem('userID');
        
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
                alert('Error getting profile');
            });
    }, []);

    const handleChange = (e) => {
        setUpdatedData({ ...updatedData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const userId = localStorage.getItem('userID');
        axios.put(`http://localhost:3487/update-profile/${userId}`, updatedData)
            .then(() => {
                setData(updatedData);
                setEditing(false);
                alert('Profile updated successfully');
            })
            .catch((err) => {
                console.log("API Error:", err);
                alert('Error updating profile');
            });
    };

    return (
        <div className="profile-wrapper">
            <h2 className="profile-title">My Profile</h2>
            <div className='profile-container'>
                {['first_name', 'last_name', 'location', 'role'].map((key) => (
                    <div className='profile-item' key={key}>
                        <h3 className="profile-label">{key.replace('_', ' ').toUpperCase()}</h3>
                        {editing ? (
                            <input 
                                className="profile-input"
                                type='text' 
                                name={key} 
                                value={updatedData[key] || ''} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <p className="profile-text">{data[key]}</p>
                        )}
                    </div>
                ))}
                <div className='profile-item'>
                    <h3 className="profile-label">EMAIL</h3>
                    <p className="profile-text">{data.email}</p>
                </div>
            </div>
            <div className="button-container">
                {editing ? (
                    <button className="profile-button" onClick={handleSave}>Save</button>
                ) : (
                    <button className="profile-button" onClick={() => setEditing(true)}>Edit</button>
                )}
            </div>
        </div>
    );
}

export default Profile;
