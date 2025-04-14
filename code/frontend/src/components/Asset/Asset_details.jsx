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
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={asset.name}
              className="w-full h-72 object-cover"
            />
          ) : (
            <div className="w-full h-72 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-700 text-lg">No image available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <div className="absolute bottom-4 left-6">
            <h1 className="text-3xl font-bold text-white">{asset.name}</h1>
          </div>
          <div className="absolute top-4 right-6 flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
            >
              &larr; Back
            </button>
            {asset.Issued_to && (asset.Issued_to.first_name || asset.Issued_to.Project_name) ? (
              <button
                onClick={handleUnassign}
                className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition duration-200"
              >
                Unassign Asset
              </button>
            ) : (
              <button
                onClick={() => navigate(`/admin/assets/assign_asset/${id}`)}
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition duration-200"
              >
                Assign Asset
              </button>
            )}
          </div>
          {/* inside the header section (where the Back, Unassign/Assign buttons are) */}
          <div className="absolute top-4 left-6 flex gap-2">
            <button
              onClick={() => navigate(`/admin/assets/edit/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
            >
              Edit Asset
            </button>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to inactivate this asset?")) {
                  try {
                    const token = localStorage.getItem("token");
                    // Update the asset status instead of deleting it.
                    const response = await axios.put(
                      `http://localhost:3487/api/assets/${id}/inactivate`,
                      { status: "Inactive" },
                      { withCredentials: true, headers: { token } }
                    );
                    // Update local state with modified asset
                    setAsset(response.data);
                  } catch (err) {
                    console.error(err);
                    alert("Error inactivating asset");
                  }
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition duration-200"
            >
              Inactivate Asset
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem label="Issued To" value={issuedTo} />
            <DetailItem label="Issued By" value={issuedBy} />
            <DetailItem label="Asset Type" value={asset.asset_type} />
            <DetailItem label="Status" value={asset.status} />
            <DetailItem label="Office" value={asset.Office} />
            <DetailItem label="Serial Number" value={asset.Serial_number} />
            <DetailItem label="Sticker Sequence" value={asset.Sticker_seq} colSpan="md:col-span-2" />
            <DetailItem label="Description" value={asset.description} colSpan="md:col-span-2" />
            <DetailItem label="Invoice ID" value={asset.Invoice_id ? asset.Invoice_id : "N/A"} colSpan="md:col-span-2" />
            <DetailItem label="Voucher Number" value={asset.voucher_number} colSpan="md:col-span-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, colSpan }) => (
  <div className={`${colSpan ? colSpan : "md:col-span-1"}`}>
    <p className="text-sm font-medium text-gray-500">{label}:</p>
    <p className="mt-1 text-lg text-gray-800">{value}</p>
  </div>
);

export default AssetDetails;