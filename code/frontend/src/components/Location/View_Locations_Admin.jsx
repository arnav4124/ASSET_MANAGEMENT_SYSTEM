import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewLocationsAdmin = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city_admin, setCityAdmin] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setCityAdmin(storedUser.location);
    if (!storedUser || storedUser.role !== "Admin") {
      navigate("/login");
      return;
    }

    // Call our new admin-locations route
    axios
      .get("http://localhost:3487/api/locations/admin-locations", {
        withCredentials: true,
        headers: {
          token: localStorage.getItem("token"), 
        },
      })
      .then((response) => {
        setLocations(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin locations:", err);
      });
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

const storedUser = JSON.parse(localStorage.getItem("user"));
console.log(storedUser);

return (
    <div className="min-h-screen bg-white p-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Locations Under Your Administration: {storedUser.location}
        </h1>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50"> 
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Location Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Parent Location</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Location Type</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Address</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">PinCode</th>
                    </tr>
                </thead>
                <tbody>
                    {locations.map((loc) => (
                        <tr
                            key={loc._id}
                            className="border-b hover:bg-gray-100 cursor-pointer"
                        >
                            <td className="px-4 py-2 text-sm text-gray-800">{loc.location_name}</td>
                            {/* <td className="px-4 py-2 text-sm text-gray-800">{loc.parent_location}</td> */}
                            <td className="px-4 py-2 text-sm text-gray-800">{city_admin}</td>
                            <td className="px-4 py-2 text-sm text-gray-800">{loc.location_type}</td>
                            <td className="px-4 py-2 text-sm text-gray-800">{loc.address}</td>
                            <td className="px-4 py-2 text-sm text-gray-800">{loc.pincode}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
};

export default ViewLocationsAdmin;