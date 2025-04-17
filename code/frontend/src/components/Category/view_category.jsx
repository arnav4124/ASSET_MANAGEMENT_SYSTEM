import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Folder, Search, Edit, X, Save } from "lucide-react";
import { useForm } from "react-hook-form";

const ViewCategory = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm();

    const categoriesPerPage = 10;

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
        }
        else {
            console.log(localStorage.getItem('user'))
            const role = JSON.parse(localStorage.getItem('user')).role
            console.log(role)

            if (role !== 'Superuser') {
                navigate('/login')
            }
        }
        fetchCategories();
    }, [navigate]);

    const fetchCategories = async () => {
        setLoading(true);
        const token = localStorage.getItem('token')
        try {
            const response = await axios.get('http://localhost:3487/api/superuser/get_categories', {
                headers: {
                    token: token
                }
            });
            if (response?.data?.success === false) {
                alert("unauthorized_access");
                navigate("/login");
                return;
            }
            setCategories(response.data.categories || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleDescription = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        // Populate form fields
        setValue("name", category.name);
        setValue("description", category.description);
        setValue("sticker_short_seq", category.sticker_short_seq);
        setValue("lifespan", category.lifespan);
        setValue("depreciation_rate", category.depreciation_rate);
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedCategory(null);
        setUpdateError(null);
        reset();
    };

    const handleUpdateCategory = async (data) => {
        setIsUpdating(true);
        setUpdateError(null);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.put(
                `http://localhost:3487/api/superuser/update_category/${selectedCategory._id}`,
                data,
                {
                    headers: {
                        token: token
                    }
                }
            );

            if (response.data.success) {
                // Update the local categories list
                setCategories(prev =>
                    prev.map(cat =>
                        cat._id === selectedCategory._id ? { ...cat, ...response.data.category } : cat
                    )
                );
                closeEditModal();
                fetchCategories(); // Refresh the list
            }
        } catch (err) {
            setUpdateError(err.response?.data?.message || "An error occurred while updating the category");
        } finally {
            setIsUpdating(false);
        }
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
                                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <button
                                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openEditModal(category);
                                                                    }}
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        {expandedId === category._id && (
                                                            <tr className="bg-gray-50">
                                                                <td colSpan={4}>
                                                                    <div className="animate-[fadeIn_0.3s_ease-in-out] p-4 m-2 border-l-4 border-blue-500 bg-blue-50 rounded">
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                                                            <div>
                                                                                <h4 className="font-medium text-gray-700 mb-1">Description:</h4>
                                                                                <p className="text-gray-600">{category.description}</p>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-medium text-gray-700 mb-1">Sticker Sequence:</h4>
                                                                                <p className="text-gray-600">{category.sticker_short_seq}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div>
                                                                                <h4 className="font-medium text-gray-700 mb-1">Lifespan:</h4>
                                                                                <p className="text-gray-600">
                                                                                    {category.lifespan ? `${category.lifespan} years` : 'Not specified'}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-medium text-gray-700 mb-1">Depreciation Rate:</h4>
                                                                                <p className="text-gray-600">
                                                                                    {category.depreciation_rate}% per annum
                                                                                </p>
                                                                            </div>
                                                                        </div>
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
                            Add New Category
                        </button>
                    </div>
                )}

                {/* Pagination controls */}
                {!loading && totalPages > 1 && (
                    <div className="w-full flex justify-center gap-2 py-4">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md flex items-center ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="flex items-center px-4">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md flex items-center ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Category Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-[fadeIn_0.2s_ease-in-out]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Edit Category</h2>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {updateError && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                                <p className="text-red-800 text-sm">{updateError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(handleUpdateCategory)}>
                            {/* Category Name */}
                            <div className="mb-4">
                                <label className="block font-medium text-sm mb-1 text-gray-700">Category Name</label>
                                <input
                                    {...register("name", {
                                        required: "Category name is required",
                                        minLength: { value: 2, message: "Category name must be at least 2 characters" }
                                    })}
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    placeholder="Enter category name"
                                    disabled={isUpdating}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Category Description */}
                            <div className="mb-4">
                                <label className="block font-medium text-sm mb-1 text-gray-700">Description</label>
                                <textarea
                                    {...register("description", {
                                        required: "Description is required",
                                        minLength: { value: 10, message: "Description must be at least 10 characters" }
                                    })}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none resize-none h-24"
                                    placeholder="Enter category description"
                                    disabled={isUpdating}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Sticker Sequence */}
                            <div className="mb-4">
                                <label className="block font-medium text-sm mb-1 text-gray-700">Sticker Sequence Short Form</label>
                                <input
                                    {...register("sticker_short_seq", {
                                        required: "Sticker is required",
                                        minLength: { value: 3, message: "Sticker should be of length 3 characters" },
                                        maxLength: { value: 3, message: "Sticker should be of length 3 characters" }
                                    })}
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    placeholder="Enter sticker code (3 characters)"
                                    disabled={isUpdating}
                                />
                                {errors.sticker_short_seq && (
                                    <p className="text-red-500 text-sm mt-1">{errors.sticker_short_seq.message}</p>
                                )}
                            </div>

                            {/* Lifespan */}
                            <div className="mb-4">
                                <label className="block font-medium text-sm mb-1 text-gray-700">Lifespan (in years)</label>
                                <input
                                    {...register("lifespan", {
                                        validate: {
                                            positive: value => {
                                                if (!value && value !== 0) return true; // Optional field

                                                const numValue = parseFloat(value);
                                                if (isNaN(numValue)) return "Please enter a valid number";
                                                if (numValue <= 0) return "Lifespan must be greater than 0";

                                                return true;
                                            }
                                        }
                                    })}
                                    type="number"
                                    step="any"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    placeholder="Enter asset lifespan in years (optional)"
                                    disabled={isUpdating}
                                />
                                {errors.lifespan && (
                                    <p className="text-red-500 text-sm mt-1">{errors.lifespan.message}</p>
                                )}
                            </div>

                            {/* Depreciation Rate */}
                            <div className="mb-6">
                                <label className="block font-medium text-sm mb-1 text-gray-700">Depreciation Rate (% per annum)<span className="text-red-500 ml-1">*</span></label>
                                <input
                                    {...register("depreciation_rate", {
                                        required: "Depreciation rate is required",
                                        validate: {
                                            positive: value => {
                                                const numValue = parseFloat(value);
                                                if (isNaN(numValue)) return "Please enter a valid number";
                                                if (numValue < 0) return "Depreciation rate must be a positive number";
                                                return true;
                                            }
                                        }
                                    })}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                    placeholder="Enter annual depreciation rate (%)"
                                    disabled={isUpdating}
                                />
                                {errors.depreciation_rate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.depreciation_rate.message}</p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">Example: 10 for 10% depreciation per year</p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-2 transition-colors"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewCategory;