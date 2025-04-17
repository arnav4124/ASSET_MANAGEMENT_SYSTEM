import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [category, setCategory] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [stickerShortSeq, setStickerShortSeq] = useState('');
    const [lifespan, setLifespan] = useState('');
    const [depreciationRate, setDepreciationRate] = useState('');
    const [nameError, setNameError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [stickerError, setStickerError] = useState('');
    const [lifespanError, setLifespanError] = useState('');
    const [depreciationRateError, setDepreciationRateError] = useState('');
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        // Check for authentication
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.role !== 'Superuser') {
            navigate('/login');
            return;
        }

        // Fetch category data
        fetchCategory();
    }, [id, navigate]);

    const fetchCategory = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(`http://localhost:3487/api/superuser/get_category/${id}`, {
                headers: { token }
            });

            if (response.data.success) {
                const categoryData = response.data.category;
                setCategory(categoryData);
                setName(categoryData.name || '');
                setDescription(categoryData.description || '');
                setStickerShortSeq(categoryData.sticker_short_seq || '');
                setLifespan(categoryData.lifespan || '');
                setDepreciationRate(categoryData.depreciation_rate || '');
            } else {
                setServerError('Failed to fetch category details');
                setTimeout(() => navigate('/superuser/view_category'), 3000);
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            setServerError('Error fetching category details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        let isValid = true;

        // Reset errors
        setNameError('');
        setDescriptionError('');
        setStickerError('');
        setLifespanError('');
        setDepreciationRateError('');

        // Validate name
        if (!name.trim()) {
            setNameError('Category name is required');
            isValid = false;
        } else if (name.length < 2) {
            setNameError('Category name must be at least 2 characters');
            isValid = false;
        }

        // Validate description
        if (!description.trim()) {
            setDescriptionError('Description is required');
            isValid = false;
        } else if (description.length < 10) {
            setDescriptionError('Description must be at least 10 characters');
            isValid = false;
        }

        // Validate sticker short sequence
        if (!stickerShortSeq.trim()) {
            setStickerError('Sticker sequence is required');
            isValid = false;
        } else if (stickerShortSeq.length !== 3) {
            setStickerError('Sticker sequence must be exactly 3 characters');
            isValid = false;
        }

        // Validate lifespan (optional)
        if (lifespan.trim() !== '') {
            const lifespanValue = parseFloat(lifespan);
            if (isNaN(lifespanValue)) {
                setLifespanError('Lifespan must be a valid number');
                isValid = false;
            } else if (lifespanValue <= 0) {
                setLifespanError('Lifespan must be greater than 0');
                isValid = false;
            }
        }

        // Validate depreciation rate
        if (!depreciationRate.trim()) {
            setDepreciationRateError('Depreciation rate is required');
            isValid = false;
        } else {
            const depreciationRateValue = parseFloat(depreciationRate);
            if (isNaN(depreciationRateValue)) {
                setDepreciationRateError('Depreciation rate must be a valid number');
                isValid = false;
            } else if (depreciationRateValue < 0) {
                setDepreciationRateError('Depreciation rate must be a positive number');
                isValid = false;
            }
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!validateForm()) {
            return;
        }

        setUpdating(true);
        const token = localStorage.getItem('token');

        const updateData = {
            name,
            description,
            sticker_short_seq: stickerShortSeq,
            depreciation_rate: depreciationRate
        };

        // Only include lifespan if it's not empty
        if (lifespan.trim() !== '') {
            updateData.lifespan = parseFloat(lifespan);
        }

        try {
            const response = await axios.put(
                `http://localhost:3487/api/superuser/update_category/${id}`,
                updateData,
                {
                    headers: { token }
                }
            );

            if (response.data.success) {
                navigate('/superuser/view_category');
            } else {
                setServerError(response.data.message || 'Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            setServerError(error.response?.data?.message || 'Error updating category. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-blue-200"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700 mb-4">{serverError || 'Category not found'}</p>
                    <button
                        onClick={() => navigate('/superuser/view_category')}
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Back to Categories
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-blue-500 text-white">
                    <h2 className="text-xl font-bold">Edit Category</h2>
                </div>

                {serverError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{serverError}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Category Name */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-300 ${nameError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter category name"
                        />
                        {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-300 ${descriptionError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter category description"
                            rows="4"
                        />
                        {descriptionError && <p className="text-red-500 text-xs mt-1">{descriptionError}</p>}
                    </div>

                    {/* Sticker Short Sequence */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stickerShortSeq">
                            Sticker Short Sequence <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="stickerShortSeq"
                            type="text"
                            value={stickerShortSeq}
                            onChange={(e) => setStickerShortSeq(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-300 ${stickerError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="3 characters (e.g., LPT)"
                            maxLength="3"
                        />
                        {stickerError && <p className="text-red-500 text-xs mt-1">{stickerError}</p>}
                    </div>

                    {/* Lifespan */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lifespan">
                            Lifespan (in years)
                        </label>
                        <input
                            id="lifespan"
                            type="number"
                            value={lifespan}
                            onChange={(e) => setLifespan(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-300 ${lifespanError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter asset lifespan in years (optional)"
                            step="any"
                        />
                        {lifespanError && <p className="text-red-500 text-xs mt-1">{lifespanError}</p>}
                    </div>

                    {/* Depreciation Rate */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="depreciationRate">
                            Depreciation Rate (% per annum) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="depreciationRate"
                            type="number"
                            value={depreciationRate}
                            onChange={(e) => setDepreciationRate(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-300 ${depreciationRateError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter annual depreciation rate (%)"
                            step="0.01"
                            min="0"
                        />
                        {depreciationRateError && <p className="text-red-500 text-xs mt-1">{depreciationRateError}</p>}
                        <p className="text-gray-500 text-xs mt-1">Example: 10 for 10% depreciation per year</p>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/superuser/view_category')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${updating ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {updating ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </span>
                            ) : (
                                'Update Category'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCategory; 