import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dummy asset details for now
  const asset = {
    id,
    name: `Asset ${id}`,
    issuedTo: "User Alpha",
    issuedToType: "Individual", // Binary: Individual / Project
    issuedBy: "Warehouse A",
    status: "Issued", // Could be "Issued", "In Maintenance", "Unassigned"
    office: "Main Office",
    price: "$1000",
    category: "Electronics",
    warranty: "2 years",
    feedback: "No issues reported",
    img: "Image blob placeholder",
    report: "Report reference placeholder",
    invoice: "Invoice reference placeholder",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <button
          className="text-blue-600 hover:underline mb-6"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Asset Details - {asset.name}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-600">Issued To:</span>
            <p className="text-gray-800">{asset.issuedTo}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Issued To Type:</span>
            <p className="text-gray-800">{asset.issuedToType}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Issued By:</span>
            <p className="text-gray-800">{asset.issuedBy}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Status:</span>
            <p className="text-gray-800">{asset.status}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Office:</span>
            <p className="text-gray-800">{asset.office}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Price:</span>
            <p className="text-gray-800">{asset.price}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Category:</span>
            <p className="text-gray-800">{asset.category}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Warranty:</span>
            <p className="text-gray-800">{asset.warranty}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-gray-600">Feedback:</span>
            <p className="text-gray-800">{asset.feedback}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-gray-600">Image:</span>
            <p className="text-gray-800">{asset.img}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Report:</span>
            <p className="text-gray-800">{asset.report}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Invoice:</span>
            <p className="text-gray-800">{asset.invoice}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;