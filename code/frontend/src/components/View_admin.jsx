import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Users } from 'lucide-react';
import axios from 'axios';

const View_admin = () => {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3487/api/superuser/get_all_admins', {
                withCredentials: true,
                headers: {
                    token: token
                }
            });
            
            if (response.data.admins) {
                setAdmins(response.data.admins);
                setFilteredAdmins(response.data.admins);
            } else {
                setError('No data received from API');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching administrators');
            console.error('Error fetching admins:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            const userString = localStorage.getItem('user');
            if (!userString) {
                console.error('No user data found in localStorage');
                navigate('/login');
                return;
            }
            
            try {
                const userData = JSON.parse(userString);
                console.log('User role:', userData.role);
                
                if (!userData.role || userData.role !== 'Superuser') {
                    console.log('User is not a Superuser:', userData.role);
                    navigate('/login');
                    return;
                }
                
                // Only fetch admins if all checks pass
                fetchAdmins();
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                navigate('/login');
            }
        } catch (error) {
            console.error('Error in useEffect:', error);
            navigate('/login');
        }
    }, [navigate]);

    // Handle search
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredAdmins(admins);
            return;
        }

        const searchTermLower = searchTerm.toLowerCase();
        const filtered = admins.filter(admin =>
            (admin.first_name?.toLowerCase() || '').includes(searchTermLower) ||
            (admin.last_name?.toLowerCase() || '').includes(searchTermLower) ||
            (admin.email?.toLowerCase() || '').includes(searchTermLower) ||
            (admin.location?.toLowerCase() || '').includes(searchTermLower)
        );
        setFilteredAdmins(filtered);
    }, [searchTerm, admins]);

    // Function to get full name
    const getFullName = (admin) => {
        return `${admin.first_name || ''} ${admin.last_name || ''}`.trim();
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="text-white text-xl text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl font-semibold">Loading Administrators...</p>
                    <p className="text-sm text-gray-300 mt-2">Please wait while we fetch the data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header with Add Admin button */}
                <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">View Administrators</h1>
                        <p className="text-gray-500 mt-1">Manage and view all administrators in the system</p>
                    </div>
                    <button
                        onClick={() => navigate('superuser/assign-admin')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                    >
                        <UserPlus size={20} />
                        Add Admin
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Admins Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAdmins.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                            {searchTerm ? 'No administrators match your search' : 'No administrators found'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAdmins.map((admin) => (
                                        <tr key={admin._id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{getFullName(admin)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{admin.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{admin.location || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    {admin.role || 'Admin'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-gray-500">
                    Showing {filteredAdmins.length} of {admins.length} administrators
                </div>
            </div>
        </div>
    );
};

export default View_admin;