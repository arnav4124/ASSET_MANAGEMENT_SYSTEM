import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const role = JSON.parse(localStorage.getItem("user")).role;
      if (role !== "Admin") {
        navigate("/login");
      }
    }
    const fetchCounts = async () => {
      try {
        const projRes = await axios.get("http://localhost:3487/api/projects",{
          headers:{
            token:localStorage.getItem("token")
          }
        });
        setProjectCount(projRes.data.length);

        const userRes = await axios.get("http://localhost:3487/api/user",{
          headers:{
            token:localStorage.getItem("token")
          }
        });
        setUserCount(userRes.data.length);

          const assetRes = await axios.get("http://localhost:3487/api/assets",{
          headers:{
            token:localStorage.getItem("token")
          }
        });
        setAssetCount(assetRes.data.length);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-6 p-8">
      {/* Projects Card */}
      <Link to="/admin/projects">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-700">Projects</h2>
          <p className="text-4xl font-bold text-blue-600">{projectCount}</p>
        </div>
      </Link>

      {/* Users Card */}
      <Link to="/admin/users">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-700">Users</h2>
          <p className="text-4xl font-bold text-green-600">{userCount}</p>
        </div>
      </Link>

      {/* Assets Card */}
      <Link to="/admin/assets">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-700">Assets</h2>
          <p className="text-4xl font-bold text-red-600">{assetCount}</p>
        </div>
      </Link>

      {/* Placeholder for 4th card */}
      {/* <div className="bg-gray-100 rounded-xl shadow-md p-6 text-center border-t-4 border-purple-500">
        <h2 className="text-lg font-semibold text-gray-700">Coming Soon</h2>
        <p className="text-4xl font-bold text-purple-600">🚀</p>
      </div> */}
    </div>
  );
};

export default AdminDashboard;
