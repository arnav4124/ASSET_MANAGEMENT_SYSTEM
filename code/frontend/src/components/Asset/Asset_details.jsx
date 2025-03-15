import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';


const AssetDetails = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const role = JSON.parse(localStorage.getItem("user")).role;
      console.log("Role:", role);
      if (role !== "Admin") {
        navigate("/login");
      }
    }

    axios.get(`http://localhost:3487/api/assets/${id}`, {
      withCredentials: true,
      headers: {
        token: localStorage.getItem("token")
      }
    }).then((res) => {
      setAsset(res.data);
      console.log(res.data);
    }).catch((err) => {
      console.error(err);
    });
  }, [id]);

  if (!asset) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <button
          className="text-blue-600 hover:underline mb-6"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <button
          className="btn btn-primary mb-6 ml-4"
          onClick={() => navigate(`/admin/assets/assign_asset/${id}`)}
        >
          Assign Asset
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Asset Details - {asset.name}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-600">Issued To:</span>
            <p className="text-gray-800">{asset.Issued_to}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Issued By:</span>
            <p className="text-gray-800">{asset.Issued_by}</p>
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
            <p className="text-gray-800">{asset.Invoice_id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;
