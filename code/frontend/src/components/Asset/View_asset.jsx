import React from "react";
import { useNavigate } from "react-router-dom";

const ViewAsset = () => {
  const navigate = useNavigate();

  const dummyAssets = [
    { id: 1, name: "Asset One", issuedFrom: "Warehouse A", issuedTo: "User Alpha", category: "Electronics" },
    { id: 2, name: "Asset Two", issuedFrom: "Warehouse B", issuedTo: "User Beta", category: "Furniture" },
    { id: 3, name: "Asset Three", issuedFrom: "Warehouse C", issuedTo: "User Gamma", category: "Stationary" },
    { id: 4, name: "Asset Four", issuedFrom: "Warehouse A", issuedTo: "User Delta", category: "Tools" },
    { id: 5, name: "Asset Five", issuedFrom: "Warehouse B", issuedTo: "User Epsilon", category: "Electronics" },
  ];

  const handleRowClick = (id) => {
    // Navigate to the asset details page using the asset ID
    navigate(`/assets/view/${id}`);
  };

  return (
    <div className="min-h-screen bg-white p-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Assets List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Asset Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Issued From</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Issued To</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
            </tr>
          </thead>
          <tbody>
            {dummyAssets.map((asset) => (
              <tr 
                key={asset.id} 
                className="border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(asset.id)}
              >
                <td className="px-4 py-2 text-sm text-gray-800">{asset.name}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{asset.issuedFrom}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{asset.issuedTo}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{asset.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAsset;