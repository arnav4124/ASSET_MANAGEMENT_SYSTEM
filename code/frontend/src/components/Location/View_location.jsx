import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronDown, ChevronRight, MapPin, Users, User } from 'lucide-react';
import axios from 'axios';





const LocationCard = ({ location, depth = 0, expanded, onToggle, searchTerm }) => {
    const matchesSearch = (loc) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            loc.location_name.toLowerCase().includes(searchLower) ||
            loc.location_type.toLowerCase().includes(searchLower) ||
            loc.address.toLowerCase().includes(searchLower) ||
            (loc.stats.admin?.name || '').toLowerCase().includes(searchLower)
        );
    };
    const navigate = useNavigate();
    useEffect(()=>{
        const token=localStorage.getItem('token')
        if(!token){
            navigate('/login')
        }
        else{
            const role =JSON.parse(localStorage.getItem('user')).role
            console.log(role)

            if(role!=='Superuser'){
                navigate('/login')
            }
        }
    },[])
    const shouldShow = !searchTerm || matchesSearch(location);
    const hasMatchingChildren = location.children.some(child => matchesSearch(child));

    if (!shouldShow && !hasMatchingChildren) return null;

    return (
        <div className="border-l-2 border-gray-200" style={{ marginLeft: `${depth * 20}px` }}>
            <div className={`p-4 bg-white rounded-lg shadow-sm mb-2 ${depth === 0 ? 'border-l-4 border-blue-500' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {location.children.length > 0 && (
                            <button
                                onClick={() => onToggle(location._id)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                {expanded.includes(location._id) ? (
                                    <ChevronDown size={20} />
                                ) : (
                                    <ChevronRight size={20} />
                                )}
                            </button>
                        )}
                        <h3 className="font-semibold text-lg">{location.location_name}</h3>
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                            {location.location_type}
                        </span>
                    </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">{location.address}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600">
                                {location.stats.userCount} users
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600">
                                Admin: {location.stats.admin ? location.stats.admin.name : 'None'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {expanded.includes(location._id) && location.children.map(child => (
                <LocationCard
                    key={child._id}
                    location={child}
                    depth={depth + 1}
                    expanded={expanded}
                    onToggle={onToggle}
                    searchTerm={searchTerm}
                />
            ))}
        </div>
    );
};

const ViewLocation = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get('http://localhost:3487/api/superuser/locations', {
                    headers: {
                       
                        token: localStorage.getItem('token')
                    }
                });

                if (response.data.success) {
                    setLocations(response.data.locations);
                    // Initially expand root level locations
                    setExpanded(response.data.locations.map(loc => loc._id));
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching locations');
                console.error('Error fetching locations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    const toggleExpand = (locationId) => {
        setExpanded(prev =>
            prev.includes(locationId)
                ? prev.filter(id => id !== locationId)
                : [...prev, locationId]
        );
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="text-white text-xl text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl font-semibold">Loading Locations...</p>
                    <p className="text-sm text-gray-300 mt-2">Please wait while we fetch the data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header with Add Location button */}
                <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">View Locations</h1>
                        <p className="text-gray-500 mt-1">Manage and view all locations</p>
                    </div>
                    <button
                        onClick={() => navigate('/superuser/add_location')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Location
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search locations by name, type, address, or admin..."
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

                {/* Locations List */}
                <div className="space-y-4">
                    {locations.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No locations found
                        </div>
                    ) : (
                        locations.map(location => (
                            <LocationCard
                                key={location._id}
                                location={location}
                                expanded={expanded}
                                onToggle={toggleExpand}
                                searchTerm={searchTerm}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewLocation;
