import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaBuilding, FaSpinner } from "react-icons/fa";

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <FaSpinner className="animate-spin text-blue-600 text-4xl" />
          <p className="text-gray-600 text-lg">Loading locations...</p>
        </div>
      </div>
    );
  }

  const storedUser = JSON.parse(localStorage.getItem("user"));
  console.log(storedUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-lg shadow-lg">
            <FaBuilding className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Locations Under Your Administration
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Managing locations in {storedUser.location}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl shadow-lg border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Location Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Parent Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Location Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    PinCode
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.map((loc) => (
                  <tr
                    key={loc._id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {loc.location_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {city_admin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
                        {loc.location_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {loc.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {loc.pincode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLocationsAdmin;