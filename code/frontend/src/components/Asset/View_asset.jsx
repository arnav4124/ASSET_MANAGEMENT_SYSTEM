import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ViewAsset = () => {
  const [assets, setAssets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/assets")
      .then((res) => res.json())
      .then((data) => setAssets(data))
      .catch((err) => console.error(err));
  }, []);

  const handleRowClick = (id) => {
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
            {assets.map((asset) => (
              <tr 
                key={asset._id} 
                className="border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(asset._id)}
              >
                <td className="px-4 py-2 text-sm text-gray-800">{asset.name}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{asset.Issued_by}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{asset.Issued_to}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{asset.asset_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAsset;
