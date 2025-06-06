import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { FileDown, Filter, RefreshCcw } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const AssetReport = () => {
    const [filters, setFilters] = useState({ status: '', issued: '', office: '', category: '' });
    const [assets, setAssets] = useState([]);
    const [offices, setOffices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rawAssets, setRawAssets] = useState([]);
    const [displayAssets, setDisplayAssets] = useState([]);
    const [categoryMap, setCategoryMap] = useState({});
    const navigate = useNavigate();
    const calculateDepreciation = (purchaseDate, totalPrice, depreciationRate) => {
        if (!purchaseDate || !totalPrice || depreciationRate === undefined || depreciationRate === null) {
          return 0;
        }
        
        const purchase = new Date(purchaseDate);
        const current = new Date();
        
        // Find first fiscal year end after purchase
        let fiscalYearEnd = new Date(purchase.getFullYear(), 2, 31); // 31-Mar
        if (purchase > fiscalYearEnd) {
          fiscalYearEnd = new Date(purchase.getFullYear() + 1, 2, 31);
        }
        
        // Count complete fiscal years from first fiscal year end to current date
        const currentFiscalYearEnd = new Date(current.getFullYear(), 2, 31);
        let completeYears = currentFiscalYearEnd.getFullYear() - fiscalYearEnd.getFullYear();
        
        // Adjust if current date is before fiscal year end of current year
        if (current < currentFiscalYearEnd) {
          completeYears--;
        }
        
        // Ensure completeYears is not negative
        completeYears = Math.max(0, completeYears);
        
        // Calculate depreciation for complete years only
        let remainingValue = totalPrice;
        let totalDepreciation = 0;
        
        for (let i = 0; i < completeYears; i++) {
          const yearDep = remainingValue * (depreciationRate / 100);
          totalDepreciation += yearDep;
          remainingValue -= yearDep;
        }
        
        return Math.min(Number(totalDepreciation.toFixed(2)), totalPrice);
      };
    
    // Calculate current value (total price - depreciation)
    const calculateCurrentValue = (totalPrice, depreciation) => {
        return Math.max(0, totalPrice - depreciation);
    };

    const getCategoryDepreciationRate = (categoryId) => {
        if (!categoryId) return 0;
        
        // Handle if categoryId is an object with _id property
        const id = typeof categoryId === 'object' ? categoryId._id : categoryId;
        
        if (!categoryMap[id]) {
            console.log('Category not found in map:', id);
            return 0;
        }
        
        return categoryMap[id].depreciation_rate || 0;
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return "-";
        
        // Handle if categoryId is an object with _id property
        const id = typeof categoryId === 'object' ? categoryId._id : categoryId;
        
        if (!categoryMap[id]) return "-";
        return categoryMap[id].name || "-";
    };

    const groupAssets = (assets) => {
        const groupedMap = new Map();
        const result = [];

        for (const item of assets){
            // Make sure we're getting the correct category ID
            const categoryId = item.category?._id || item.category;
            
            // Get depreciation rate from our category map
            const depreciationRate = getCategoryDepreciationRate(categoryId);
            
            if (item.grouping == "Grouped"){
                const key = item.name;
                if(!groupedMap.has(key)){
                    const total_price = item.price * (item.qty || 1);
                    const depreciation = calculateDepreciation(
                        item.date_of_purchase, 
                        total_price, 
                        depreciationRate
                    );
                    const current_value = calculateCurrentValue(total_price, depreciation);

                    groupedMap.set(key, { 
                        ...item, 
                        _groupedSerials: [item.Serial_number], 
                        quantity: item.qty || 1, 
                        total_price: total_price,
                        depreciation_rate: depreciationRate,
                        depreciation: depreciation,
                        current_value: current_value,
                        category_name: getCategoryName(categoryId)
                    });
                }else{
                    const existingItem = groupedMap.get(key);
                    existingItem._groupedSerials.push(item.Serial_number);
                    existingItem.quantity += item.qty || 1;
                    
                    const additionalPrice = item.price * (item.qty || 1);
                    existingItem.total_price += additionalPrice;
                    
                    const additionalDepreciation = calculateDepreciation(
                        item.date_of_purchase, 
                        additionalPrice, 
                        depreciationRate
                    );
                    existingItem.depreciation += additionalDepreciation;
                    existingItem.current_value += calculateCurrentValue(additionalPrice, additionalDepreciation);
                }
            }else{
                // If the asset is not grouped, we can add it directly to the result
                const total_price = item.price || 0;
                const depreciation = calculateDepreciation(
                    item.date_of_purchase, 
                    total_price, 
                    depreciationRate
                );
                const current_value = calculateCurrentValue(total_price, depreciation);
                
                result.push({
                    ...item,
                    quantity: 1,
                    total_price: total_price,
                    depreciation_rate: depreciationRate,
                    depreciation: depreciation,
                    current_value: current_value,
                    category_name: getCategoryName(categoryId)
                });
            }
        }

        const groupedAssets = Array.from(groupedMap.values());
        return [...result, ...groupedAssets];
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const role = JSON.parse(localStorage.getItem("user")).role;
        if (role !== "Admin") {
            navigate("/login");
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            try {
                const [officeRes, categoryRes] = await Promise.all([
                    axios.get("http://localhost:3487/api/locations?type=office", {
                        headers: { token: localStorage.getItem('token') },
                        withCredentials: true
                    }),
                    axios.get("http://localhost:3487/api/categories", {
                        headers: { token: localStorage.getItem('token') },
                        withCredentials: true
                    })
                ]);

                setOffices(officeRes.data);
                setCategories(categoryRes.data);
                
                // Create a map of categories by ID for easy lookup
                const catMap = {};
                categoryRes.data.forEach(category => {
                    catMap[category._id] = category;
                });
                setCategoryMap(catMap);
                
                console.log("Categories loaded:", categoryRes.data);
                console.log("Category map created:", catMap);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log('Raw assets:', rawAssets);
        console.log('Category map:', categoryMap);
        
        const newDisplayAssets = groupAssets(rawAssets);
        console.log('Display assets after grouping:', newDisplayAssets);
        
        setDisplayAssets(newDisplayAssets);
        setAssets(newDisplayAssets);
    }, [rawAssets, categoryMap]);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3487/api/assets/filter', filters, {
                headers: { token: localStorage.getItem('token') },
                withCredentials: true
            });
            console.log("API response data:", res.data);
            setRawAssets(res.data.data || []);
        } catch (error) {
            console.error("Error generating report:", error);
            setRawAssets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilters({ status: '', issued: '', office: '', category: '' });
        setRawAssets([]);
        setDisplayAssets([]);
        setAssets([]);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(value);
    };

    const csvHeaders = [
        { label: "Asset Name", key: "name" },
        { label: "Serial No", key: "Serial_number" },
        { label: "Description", key: "Description" },
        { label: "Status", key: "status" },
        { label: "Assigned", key: "assignment_status" },
        { label: "Location", key: "Office" },
        { label: "Category", key: "category_name" },
        { label: "Vendor", key: "vendor_name" },
        { label: "Voucher Number", key: "voucher_number" },
        { label: "Invoice ID", key: "Invoice_id" },
        { label: "Quantity", key: "quantity" },
        { label: "Price", key: "price" },
        { label: "Total Price", key: "total_price" },
        { label: "Depreciation Rate (%)", key: "depreciation_rate" },
        { label: "Total Depreciation", key: "depreciation" },
        { label: "Current Value", key: "current_value" },
        { label: "Date of Purchase", key: "date_of_purchase" },
        { label: "Issued By", key: "Issued_by.first_name" },
        { label: "Issued To", key: "Issued_to.first_name" }
    ];

    const csvData = displayAssets.map(asset => ({
        name: asset.name,
        Serial_number: asset.Serial_number,
        Description: asset.Description || "",
        status: asset.status,
        assignment_status: asset.assignment_status ? "Issued" : "Not Issued",
        Office: asset.Office,
        category_name: asset.category_name || "",
        vendor_name: asset.vendor_name || "",
        voucher_number: asset.voucher_number || "",
        Invoice_id: asset.Invoice_id || "",
        quantity: asset.quantity || 1,
        price: asset.price || 0,
        total_price: asset.total_price || 0,
        depreciation_rate: asset.depreciation_rate || 0,
        depreciation: asset.depreciation || 0,
        current_value: asset.current_value || 0,
        date_of_purchase: new Date(asset.date_of_purchase).toLocaleDateString(),
        "Issued_by.first_name": asset.Issued_by?.first_name || "",
        "Issued_to.first_name": asset.Issued_to?.first_name || ""
    }));

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-800';
            case 'Unavailable': return 'bg-red-100 text-red-800';
            case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'Disposed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getAssignmentStatusColor = (assigned) => {
        return assigned ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-full mx-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Asset Report Generator</h2>
                <div className="flex space-x-2">
                    {displayAssets.length > 0 && (
                        <CSVLink
                            headers={csvHeaders}
                            data={csvData}
                            filename={"asset_report.csv"}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            <FileDown size={18} />
                            Export CSV
                        </CSVLink>
                    )}
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        <RefreshCcw size={18} />
                        Reset
                    </button>
                </div>
            </div>

            {/* Filters Card */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <Filter size={20} />
                    <h3 className="font-semibold">Filter Assets</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                            name="status" 
                            onChange={handleChange} 
                            value={filters.status} 
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Select Status --</option>
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Disposed">Disposed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Status</label>
                        <select 
                            name="issued" 
                            onChange={handleChange} 
                            value={filters.issued} 
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Issued Status --</option>
                            <option value="true">Issued</option>
                            <option value="false">Not Issued</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <select 
                            name="office" 
                            onChange={handleChange} 
                            value={filters.office} 
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Select Location --</option>
                            {offices.map((office) => (
                                <option key={office._id} value={office.location_name}>
                                    {office.location_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                            name="category" 
                            onChange={handleChange} 
                            value={filters.category} 
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Select Category --</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name} ({cat.depreciation_rate}% dep)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        {loading ? "Loading..." : "Generate Report"}
                    </button>
                </div>
            </div>

            {/* Results Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : displayAssets.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dep. Rate</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Depreciation</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued By</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued To</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayAssets.map((asset, index) => (
                                <tr key={asset._id || index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{asset.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.Serial_number}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.Description || "-"}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAssignmentStatusColor(asset.assignment_status)}`}>
                                            {asset.assignment_status ? "Issued" : "Not Issued"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.Office}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.category_name || "-"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.vendor_name || "-"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.voucher_number || "-"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.Invoice_id || "-"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(asset.price || 0)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.quantity || "1"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(asset.total_price || 0)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.depreciation_rate || 0}%</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(asset.depreciation || 0)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(asset.current_value || 0)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(asset.date_of_purchase).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.Issued_by?.first_name || "-"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{asset.Issued_to?.first_name || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <p className="text-gray-600 mb-2">No data found.</p>
                    <p className="text-gray-500 text-sm">Apply filters and generate the report to view assets.</p>
                </div>
            )}
            
            {assets.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 text-right">
                    Showing {assets.length} result{assets.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default AssetReport;