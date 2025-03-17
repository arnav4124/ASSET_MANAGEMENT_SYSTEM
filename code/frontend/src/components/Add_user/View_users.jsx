import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const ViewUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [locations, setLocations] = useState([]);
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                navigate('/login')
            } else {
                const role = JSON.parse(localStorage.getItem('user')).role
                console.log(role)
                setLocations(JSON.parse(localStorage.getItem('locations')))
                if (role !== 'Admin') {
                    navigate('/login')
                }
            }

            try {
                const token_string = localStorage.getItem('token');
                console.log(token_string)
                const response = await axios.get('http://localhost:3487/api/admin/users', {
                    headers: {
                        token: token_string
                    }
                });

                if (response.data.success) {
                    setUsers(response.data.users);
                    setFilteredUsers(response.data.users);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching users');
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };
        const fetchLocations = async () => {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                navigate('/login');
                return;
              }
              
              const currentUser = JSON.parse(localStorage.getItem('user'));
              const adminLocation = currentUser?.location;
              
              const response = await axios.get("http://localhost:3487/api/locations/admin-locations", {
                headers: { token }
              });
              
              console.log('Locations response:', response.data);
              
              // Create a new array with admin's location first, then child locations
              let allLocations = [];
              
              if (adminLocation) {
                // Add admin's own location first
                allLocations.push({
                  _id: "admin-location", // Use a unique identifier
                  location_name: adminLocation
                });
              }
              
              // Add child locations from API response
              if (response.data && Array.isArray(response.data)) {
                allLocations = [...allLocations, ...response.data];
              }
              
              console.log('All locations including admin:', allLocations);
              setLocations(allLocations);
              
              // Optionally store in localStorage for persistence
              localStorage.setItem('locations', JSON.stringify(allLocations));
              
            } catch (err) {
              console.error('Error fetching locations:', err);
              setError('Error fetching locations');
            }
          };
          
        fetchUsers();
        fetchLocations();
    }, []);

    const handleLocationToggle = (locationName) => {
        setSelectedLocations(prev => {
            if (prev.includes(locationName)) {
                return prev.filter(loc => loc !== locationName);
            } else {
                return [...prev, locationName];
            }
        });
    };

    // Update filtering logic to handle multiple location selection
    useEffect(() => {
        let filtered = users;
        
        // Filter by search term if provided
        if (searchTerm.trim() !== '') {
          const searchTermLower = searchTerm.toLowerCase();
          filtered = filtered.filter(user => {
            const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
            return fullName.includes(searchTermLower) ||
                   user.first_name.toLowerCase().includes(searchTermLower) ||
                   user.last_name.toLowerCase().includes(searchTermLower) ||
                   user.email.toLowerCase().includes(searchTermLower);
          });
        }
        
        // Filter by selected locations if any are selected
        if (selectedLocations.length > 0) {
          filtered = filtered.filter(user => selectedLocations.includes(user.location));
        }
        
        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [searchTerm, selectedLocations, users]);

    // Get current users for pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Calculate total pages
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Change page
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(()=>{
        console.log("LOCATIONS",locations)
    },[locations])
    
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="text-white text-xl text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl font-semibold">Loading Users...</p>
                    <p className="text-sm text-gray-300 mt-2">Please wait while we fetch the data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
                {/* Left Sidebar for Location Filter */}
                <div className="w-full md:w-64 mt-60 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
                        <h2 className="font-bold text-gray-700 mb-3 border-b pb-2">Filter by Location</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {locations.map((location) => (
                                <div key={location._id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`loc-${location._id}`}
                                        checked={selectedLocations.includes(location.location_name)}
                                        onChange={() => handleLocationToggle(location.location_name)}
                                        className="h-4 w-4 text-blue-500 focus:ring-blue-400 rounded"
                                    />
                                    <label htmlFor={`loc-${location._id}`} className="ml-2 text-sm text-gray-700">
                                        {location.location_name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {selectedLocations.length > 0 && (
                            <div className="mt-4 pt-2 border-t">
                                <button 
                                    onClick={() => setSelectedLocations([])}
                                    className="text-xs text-blue-500 hover:text-blue-700"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header with Add User button */}
                    <div className="bg-white rounded-lg shadow-md mb-6 p-6 border-l-4 border-blue-500 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">View Users</h1>
                            <p className="text-gray-500 mt-1">Manage and view all users in your location</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/add_user')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                        >
                            <UserPlus size={20} />
                            Add User
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
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

                    {/* Active Filters Summary */}
                    {selectedLocations.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded-md mb-6">
                            <div className="flex items-center flex-wrap gap-2">
                                <span className="text-sm text-blue-700 mr-2">Active filters:</span>
                                {selectedLocations.map(loc => (
                                    <span key={loc} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center">
                                        {loc}
                                        <button 
                                            onClick={() => handleLocationToggle(loc)} 
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                                {searchTerm || selectedLocations.length > 0 ? 'No users found matching your criteria' : 'No users available'}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentUsers.map((user, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{user.location}</div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination controls */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {filteredUsers.length > 0 ? `${indexOfFirstUser + 1}-${Math.min(indexOfLastUser, filteredUsers.length)} of ${filteredUsers.length}` : '0'} users
                        </div>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-gray-600">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                            <button 
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`p-2 rounded-md ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewUsers;