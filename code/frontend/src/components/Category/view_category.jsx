import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Folder, Search } from "lucide-react";

const ViewCategory = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    
    const categoriesPerPage = 10;
    
    useEffect(() => {
        const token=localStorage.getItem('token')
        if(!token){
            navigate('/login')
        }
        else{
            console.log(localStorage.getItem('user'))
            const role =JSON.parse(localStorage.getItem('user')).role
            console.log(role)
            
            if(role!=='Superuser'){
                navigate('/login')
            }
        }
        fetchCategories();
    }, [navigate]);
    
    const fetchCategories = async () => {
        setLoading(true);
        const token=localStorage.getItem('token')
        try {
            const response = await axios.get('http://localhost:3487/api/superuser/get_categories',{
                headers:{
                    token:token
                }
            });
            if (response?.data?.success === false) {
                alert("unauthorized_access");
                navigate("/login");
                return;
            }
            setCategories(response.data.categories || []);
        } catch(err) {
            console.error("Error fetching categories:", err);
        } finally {
            setLoading(false);
        }
    };
    
    const toggleDescription = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Pagination calculations
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
    const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
    
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToAddCategory = () => {
        navigate('/superuser/add_category');
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full flex flex-col">
                {/* Header Section with centered title */}
                <div className="w-full p-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                    <p className="text-gray-500 mt-1">View and manage asset categories</p>
                </div>
                
                {/* Search with fixed icon placement */}
                <div className="w-full px-6 py-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search categories..." 
                                className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="w-full px-6 flex-grow">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 w-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-blue-200"></div>
                        </div>
                    ) : (
                        <>
                            {currentCategories.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto border-l-4 border-blue-500">
                                    <div className="text-center">
                                        <Folder size={40} className="text-blue-500 mx-auto mb-4" />
                                        <h2 className="text-xl font-semibold text-gray-800">No Categories Found</h2>
                                        <p className="text-gray-500 mt-1 mb-4">Add a new category to get started</p>
                                        <button 
                                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 transition-all duration-200 mx-auto"
                                            onClick={goToAddCategory}
                                        >
                                            <Plus size={18} />
                                            Add First Category
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-5xl mx-auto transition-all duration-300 hover:shadow-lg">
                                    <div className="overflow-x-auto w-full">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 border-b">
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Count</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {currentCategories.map((category, index) => (
                                                    <React.Fragment key={category._id}>
                                                        <tr 
                                                            className={`hover:bg-blue-50 transition-all ${expandedId === category._id ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {indexOfFirstCategory + index + 1}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div 
                                                                    className="flex items-center gap-2 cursor-pointer" 
                                                                    onClick={() => toggleDescription(category._id)}
                                                                >
                                                                    <Folder size={18} className="text-blue-500" />
                                                                    <span className="font-medium text-gray-800">{category.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium inline-block">
                                                                    {category.asset_count}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {expandedId === category._id && (
                                                            <tr className="bg-gray-50">
                                                                <td colSpan={3}>
                                                                    <div className="animate-[fadeIn_0.3s_ease-in-out] p-4 m-2 border-l-4 border-blue-500 bg-blue-50 rounded">
                                                                        <h4 className="font-medium text-gray-700 mb-2">Description:</h4>
                                                                        <p className="text-gray-600">{category.description}</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                {/* Add Category button below the table */}
                {!loading && currentCategories.length > 0 && (
                    <div className="w-full flex justify-center py-6">
                        <button 
                            onClick={goToAddCategory}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 transition-all duration-200"
                        >
                            <Plus size={18} />
                            Add Category
                        </button>
                    </div>
                )}
                
                {/* Pagination Section */}
                {!loading && totalPages > 1 && (
                    <div className="w-full flex items-center justify-center p-6 gap-2">
                        <button 
                            onClick={prevPage} 
                            disabled={currentPage === 1} 
                            className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <ChevronLeft size={16} className="text-gray-600" />
                        </button>
                        
                        <div className="flex gap-1">
                            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                                // Show first page, last page, current page and neighbors
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = index + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = index + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + index;
                                } else {
                                    pageNum = currentPage - 2 + index;
                                }
                                
                                return (
                                    <button
                                        key={index}
                                        className={`h-9 w-9 flex items-center justify-center rounded-md transition-all duration-200 ${currentPage === pageNum 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button 
                            onClick={nextPage} 
                            disabled={currentPage === totalPages} 
                            className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <ChevronRight size={16} className="text-gray-600" />
                        </button>
                    </div>
                )}
                
                {/* Summary Section */}
                {!loading && filteredCategories.length > 0 && (
                    <div className="w-full text-sm text-gray-500 p-4 text-center">
                        Showing {indexOfFirstCategory + 1}-{Math.min(indexOfLastCategory, filteredCategories.length)} of {filteredCategories.length} categories
                    </div>
                )}
                
                {/* Navigation Link */}
                <div className="w-full py-4 mb-6 text-center">
                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mx-auto transition-all duration-200"
                        onClick={() => navigate('/superuser/add_category')}
                    >
                        <ChevronLeft size={16} />
                        <span className="text-sm">Back</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewCategory;