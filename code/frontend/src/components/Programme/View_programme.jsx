import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronDown, ChevronRight, Folder, Users, Calendar, FileText } from 'lucide-react';
import axios from 'axios';

const ProjectCard = ({ project }) => {
    return (
        <div className="ml-8 mb-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">{project.Project_name}</h4>
                <span className="text-sm text-gray-500">
                    {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                        Project Head: {project.project_head_name}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                        {project.description.substring(0, 100)}...
                    </span>
                </div>
            </div>
        </div>
    );
};

const ProgrammeCard = ({ programme, expanded, onToggle, searchTerm }) => {
    const matchesSearch = (prog) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            prog.name.toLowerCase().includes(searchLower) ||
            prog.programme_type.toLowerCase().includes(searchLower) ||
            prog.programmes_description.toLowerCase().includes(searchLower)
        );
    };

    const shouldShow = !searchTerm || matchesSearch(programme);
    if (!shouldShow) return null;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onToggle(programme._id)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            {expanded.includes(programme._id) ? (
                                <ChevronDown size={20} />
                            ) : (
                                <ChevronRight size={20} />
                            )}
                        </button>
                        <h3 className="font-semibold text-lg">{programme.name}</h3>
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                            {programme.programme_type}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Folder size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                            {programme.stats.projectCount} Projects
                        </span>
                    </div>
                </div>

                <div className="mt-2">
                    <p className="text-gray-600 text-sm">{programme.programmes_description}</p>
                </div>
            </div>

            {expanded.includes(programme._id) && (
                <div className="border-t border-gray-200 p-4">
                    {programme.stats.projects.length > 0 ? (
                        programme.stats.projects.map(project => (
                            <ProjectCard key={project._id} project={project} />
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center">No projects in this programme</p>
                    )}
                </div>
            )}
        </div>
    );
};

const ViewProgramme = () => {
    const navigate = useNavigate();
    const [programmes, setProgrammes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            const role = JSON.parse(localStorage.getItem('user')).role;
            if (role !== 'Superuser') {
                navigate('/login');
            }
        }
    }, [navigate]);

    useEffect(() => {
        const fetchProgrammes = async () => {
            try {
                const response = await axios.get('http://localhost:3487/api/superuser/programmes', {
                    headers: {
                        token: localStorage.getItem('token')
                    }
                });

                if (response.data.success) {
                    setProgrammes(response.data.programmes);
                    // Initially expand all programmes
                    setExpanded(response.data.programmes.map(prog => prog._id));
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching programmes');
                console.error('Error fetching programmes:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgrammes();
    }, []);

    const toggleExpand = (programmeId) => {
        setExpanded(prev =>
            prev.includes(programmeId)
                ? prev.filter(id => id !== programmeId)
                : [...prev, programmeId]
        );
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="text-white text-xl text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl font-semibold">Loading Programmes...</p>
                    <p className="text-sm text-gray-300 mt-2">Please wait while we fetch the data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header with Add Programme button */}
                <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">View Programmes</h1>
                        <p className="text-gray-500 mt-1">Manage and view all programmes and their projects</p>
                    </div>
                    <button
                        onClick={() => navigate('/superuser/add_programme')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Programme
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search programmes by name, type, or description..."
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

                {/* Programmes List */}
                <div className="space-y-4">
                    {programmes.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No programmes found
                        </div>
                    ) : (
                        programmes.map(programme => (
                            <ProgrammeCard
                                key={programme._id}
                                programme={programme}
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

export default ViewProgramme;
