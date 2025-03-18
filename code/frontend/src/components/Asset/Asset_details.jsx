import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AssetDetails = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const navigate = useNavigate();

  // Helper to convert image data to base64 URL
  const getImageUrl = (imgData) => {
    if (!imgData) return null;
    // if already a string, assume it's base64 encoded without data prefix
    if (typeof imgData === "string") {
      return `data:image/jpeg;base64,${imgData}`;
    }
    // if imgData is an object with a "data" property then convert
    if (imgData.data) {
      let binary = "";
      imgData.data.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      const base64 = window.btoa(binary);
      return `data:image/jpeg;base64,${base64}`;
    }
    return null;
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

    axios
      .get(`http://localhost:3487/api/assets/${id}`, {
        withCredentials: true,
        headers: { token: localStorage.getItem("token") },
      })
      .then((res) => {
        setAsset(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id, navigate]);

  if (!asset) return <div>Loading...</div>;

  // Compute the image URL (if available) from the asset.Img field
  const imageUrl = asset.Img ? getImageUrl(asset.Img) : null;

  // If populated, asset.Issued_by and asset.Issued_to will have first_name and last_name
  const issuedBy =
    asset.Issued_by && asset.Issued_by.first_name
      ? `${asset.Issued_by.first_name} ${asset.Issued_by.last_name}`
      : "Unassigned";

  const issuedTo =
    asset.Issued_to && asset.Issued_to.first_name
      ? `${asset.Issued_to.first_name} ${asset.Issued_to.last_name}`
      : asset.Issued_to && asset.Issued_to.Project_name
      ? `${asset.Issued_to.Project_name}`
      : "Unassigned";

  // Handler to unassign the asset
  const handleUnassign = () => {
    axios
      .put(
        `http://localhost:3487/api/assets/${id}/unassign`,
        {},
        {
          withCredentials: true,
          headers: { token: localStorage.getItem("token") },
        }
      )
      .then((response) => {
        // After unassigning, refresh or update the local state
        console.log(response.data);
        setAsset(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              onClick={() => navigate(-1)}
            >
              &larr; Back
            </button>
            {asset.Issued_to && (asset.Issued_to.first_name || asset.Issued_to.Project_name) ? (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                onClick={handleUnassign}
              >
                Unassign Asset
              </button>
            ) : (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                onClick={() => navigate(`/admin/assets/assign_asset/${id}`)}
              >
                Assign Asset
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Asset Details - {asset.name}
          </h1>
          
          {/* Asset Image Section */}
          {imageUrl ? (
            <div className="mb-6">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img
                  src={imageUrl}
                  alt={asset.name}
                  className="w-full h-64 object-cover transition-transform duration-300 transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-black opacity-25"></div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              <p>No image available</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-gray-600">Issued To:</span>
              <p className="text-gray-800">{issuedTo}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Issued By:</span>
              <p className="text-gray-800">{issuedBy}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Asset Type:</span>
              <p className="text-gray-800">{asset.asset_type}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Status:</span>
              <p className="text-gray-800">{asset.status}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Office:</span>
              <p className="text-gray-800">{asset.Office}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Serial Number:</span>
              <p className="text-gray-800">{asset.Serial_number}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-gray-600">Sticker Sequence:</span>
              <p className="text-gray-800">{asset.Sticker_seq}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-gray-600">Description:</span>
              <p className="text-gray-800">{asset.description}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-gray-600">Invoice ID:</span>
              <p className="text-gray-800">
                {asset.Invoice_id ? asset.Invoice_id : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;