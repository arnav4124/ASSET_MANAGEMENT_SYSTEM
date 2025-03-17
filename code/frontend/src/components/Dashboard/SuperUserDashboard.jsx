import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const SuperUserDashboard = () => {
  const [locationCount, setLocationCount] = useState(0);
  const [programCount, setProgramCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const locRes = await axios.get("http://localhost:3487/api/locations",{
          headers:{
            token:localStorage.getItem("token")
          }
        });
        setLocationCount(locRes.data.length);

        const progRes = await axios.get("http://localhost:3487/api/programmes",{
          headers:{
            token:localStorage.getItem("token")
          }
        });
        setProgramCount(progRes.data.length);

        const catRes = await axios.get("http://localhost:3487/api/categories",{
          headers:{
            token:localStorage.getItem("token")
          }
        });
        setCategoryCount(catRes.data.length);

        const adminRes = await axios.get("http://localhost:3487/api/admin/get_admins",{
          headers:{
            token:localStorage.getItem("token")
          }
        });
        setAdminCount(adminRes.data.length);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-6 p-8">
      {/* Locations Card */}
      <Link to="/admin/locations">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-700">Locations</h2>
          <p className="text-4xl font-bold text-blue-600">{locationCount}</p>
        </div>
      </Link>

      {/* Programs Card */}
      <Link to="/admin/programs">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-700">Programs</h2>
          <p className="text-4xl font-bold text-green-600">{programCount}</p>
        </div>
      </Link>

      {/* Categories Card */}
      <Link to="/admin/categories">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-700">Categories</h2>
          <p className="text-4xl font-bold text-red-600">{categoryCount}</p>
        </div>
      </Link>

      {/* Admins Card */}
      <Link to="/admin/admins">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-purple-500">
          <h2 className="text-lg font-semibold text-gray-700">Admins</h2>
          <p className="text-4xl font-bold text-purple-600">{adminCount}</p>
        </div>
      </Link>
    </div>
  );
};

export default SuperUserDashboard;
