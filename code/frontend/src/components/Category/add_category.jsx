import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FolderPlus, ChevronLeft, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const AddCategory = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

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
    })
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            name: "",
            description: ""
        }
    });

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setError(null);
            setShowSuccess(false);
            setLoading(true);

            const response = await axios.post(
                'http://localhost:3487/api/superuser/add_category',
                data,
                {
                    headers: {
                        
                        token: localStorage.getItem('token')
                    }
                }
            );

            if (response.data.success) {
                setShowSuccess(true);
                reset();
                // Hide success message after 5 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                }, 5000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while adding the category');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="text-white text-xl text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl font-semibold">Adding Category...</p>
                    <p className="text-sm text-gray-300 mt-2">Please wait while we process your request</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header with shadow and subtle gradient */}
                <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Add Category</h1>
                            <p className="text-gray-500 mt-1">Create a new category for asset management</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <FolderPlus size={24} className="text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Success message with animation */}
                {showSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-md animate-fadeIn">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-full mr-3">
                                <Check size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">Category added successfully!</p>
                                <p className="text-green-600 text-sm">The new category has been created.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-md">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Form Card */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Category Information</h2>

                        {/* Category Name */}
                        <div className="mb-6">
                            <label className="block font-medium text-sm mb-1 text-gray-700">Category Name</label>
                            <input
                                {...register("name", {
                                    required: "Category name is required",
                                    minLength: { value: 2, message: "Category name must be at least 2 characters" }
                                })}
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                                placeholder="Enter category name"
                                disabled={loading}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Category Description */}
                        <div className="mb-6">
                            <label className="block font-medium text-sm mb-1 text-gray-700">Description</label>
                            <textarea
                                {...register("description", {
                                    required: "Description is required",
                                    minLength: { value: 10, message: "Description must be at least 10 characters" }
                                })}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none h-32 resize-none"
                                placeholder="Enter category description"
                                disabled={loading}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.description.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="bg-gray-50 p-6 flex justify-end border-t">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="px-4 py-2 mr-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-all duration-200"
                            disabled={loading}
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 transition-all duration-200 ${(isSubmitting || loading) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FolderPlus size={18} />
                                    Add Category
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Navigation Link */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mx-auto transition-all duration-200"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        <ChevronLeft size={16} />
                        <span className="text-sm">Back to Categories</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCategory; 