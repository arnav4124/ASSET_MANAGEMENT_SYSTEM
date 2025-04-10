import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';

const AssetReport = () => {
    const [filters, setFilters] = useState({ status: '', issued: '', office: '' });
    const [assets, setAssets] = useState([]);
    const [offices, setOffices] = useState([]);
    const [categories, setCategories] = useState([]);

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
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleGenerate = async () => {
        const res = await axios.post('http://localhost:3487/api/assets/filter', filters, {
            headers: { token: localStorage.getItem('token') },
            withCredentials: true
        });
        setAssets(res.data.data);
    };

    const csvHeaders = [
        { label: "Asset Name", key: "name" },
        { label: "Serial No", key: "Serial_number" },
        { label: "Status", key: "status" },
        { label: "Assigned", key: "assignment_status" },
        { label: "Location", key: "Office" },
        { label: "Category", key: "category.name" },
        { label: "Vendor", key: "vendor_name" },
        { label: "Description", key: "description" },
        { label: "Date of Purchase", key: "date_of_purchase" },
        { label: "Issued By", key: "Issued_by.first_name" },
        { label: "Issued To", key: "Issued_to.first_name" }
      ];

      const csvData = assets.map(asset => ({
        name: asset.name,
        Serial_number: asset.Serial_number,
        status: asset.status,
        assignment_status: asset.assignment_status ? "Issued" : "Not Issued",
        Office: asset.Office,
        category: { name: asset.category?.name || "" },
        vendor_name: asset.vendor_name || "",
        description: asset.description,
        createdAt: new Date(asset.date_of_purchase).toLocaleDateString(),
        Issued_by: { first_name: asset.Issued_by?.first_name || "" },
        Issued_to: { first_name: asset.Issued_to?.first_name || "" }
      }));

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Asset Report Generator</h2>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select name="status" onChange={handleChange} value={filters.status} className="p-2 border rounded">
                    <option value="">-- Select Status --</option>
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Disposed">Disposed</option>
                </select>

                <select name="issued" onChange={handleChange} value={filters.issued} className="p-2 border rounded">
                    <option value="">-- Issued Status --</option>
                    <option value="true">Issued</option>
                    <option value="false">Not Issued</option>
                </select>

                <select name="office" onChange={handleChange} value={filters.office} className="p-2 border rounded">
                    <option value="">-- Select Location --</option>
                    {offices.map((office) => (
                        <option key={office._id} value={office.location_name}>
                            {office.location_name}
                        </option>
                    ))}
                </select>

                <select name="category" onChange={handleChange} value={filters.category} className="p-2 border rounded">
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Generate Button */}
            <div className="mb-6">
                <button
                    onClick={handleGenerate}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Generate Report
                </button>
                {assets.length > 0 && (
                    <CSVLink
                        headers={csvHeaders}
                        data={csvData}
                        filename={"asset_report.csv"}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Export CSV
                    </CSVLink>
                )}
            </div>

            {/* Table */}
            {assets.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="p-2 border">Asset Name</th>
                                <th className="p-2 border">Description</th>
                                <th className="p-2 border">Date of Purchase</th>
                                <th className="p-2 border">Serial No</th>
                                <th className="p-2 border">Status</th>
                                <th className="p-2 border">Assigned</th>
                                <th className="p-2 border">Location</th>
                                <th className="p-2 border">Cateogry</th>
                                <th className="p-2 border">Vendor name</th>
                                <th className="p-2 border">Issued By</th>
                                <th className="p-2 border">Issued To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map((asset) => (
                                <tr key={asset._id}>
                                    <td className="p-2 border">{asset.name}</td>
                                    <td className="p-2 border">{asset.description}</td>
                                    <td className="p-2 border">{new Date(asset.date_of_purchase).toLocaleDateString()}</td>
                                    <td className="p-2 border">{asset.Serial_number}</td>
                                    <td className="p-2 border">{asset.status}</td>
                                    <td className="p-2 border">{asset.assignment_status ? "Issued" : "Not Issued"}</td>
                                    <td className="p-2 border">{asset.Office}</td>
                                    <td className="p-2 border">{asset.vendor_name}</td>
                                    <td className="p-2 border">{asset.Issued_by?.first_name || "-"}</td>
                                    <td className="p-2 border">{asset.Issued_to?.first_name || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">No data found. Apply filters and generate the report.</p>
            )}
        </div>
    );
};

export default AssetReport;
