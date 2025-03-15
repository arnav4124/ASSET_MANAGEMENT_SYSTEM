import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AssignAsset = () => {
    const { id } = useParams();
    const [assignType, setAssignType] = useState("user"); // "user" or "project"
    const [assignList, setAssignList] = useState([]);
    const [selectedValue, setSelectedValue] = useState("");
    const [assetId, setAssetId] = useState("");

    // Fetch data based on selection: user list or project list
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (assignType === "user") {
                    // Fetch users
                    const res = await axios.get("http://localhost:3487/api/users", {
                        withCredentials: true,
                        headers: {
                            token: localStorage.getItem("token"),
                        },
                    });
                    setAssignList(res.data);
                } else {
                    // Fetch projects
                    const res = await axios.get("http://localhost:3487/api/projects", {
                        withCredentials: true,
                        headers: {
                            token: localStorage.getItem("token"),
                        },
                    });
                    setAssignList(res.data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };
        fetchData();
    }, [assignType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          // POST to the backend route that expects an assetId param
          await axios.post(`http://localhost:3487/api/assets/assign_asset/${id}`, {
            assignType,
            assignId: selectedValue
          });
          alert("Asset assigned successfully");
        } catch (error) {
          console.error("Assign error:", error);
        }
      };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Assign Asset</h1>
            <form onSubmit={handleSubmit} className="space-y-4 w-80">
                {/* Asset ID
                <div>
                    <label className="font-semibold block">Asset ID</label>
                    <input
                        type="text"
                        value={assetId}
                        onChange={(e) => setAssetId(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div> */}

                {/* Assign Type */}
                <div>
                    <label className="font-semibold block mb-1">Assign to:</label>
                    <select
                        value={assignType}
                        onChange={(e) => setAssignType(e.target.value)}
                        className="select select-bordered w-full"
                    >
                        <option value="user">User</option>
                        <option value="project">Project</option>
                    </select>
                </div>

                {/* Assigned To Dropdown */}
                <div>
                    <label className="font-semibold block mb-1">
                        {assignType === "user" ? "Select User" : "Select Project"}
                    </label>
                    <select
                        value={selectedValue}
                        onChange={(e) => setSelectedValue(e.target.value)}
                        className="select select-bordered w-full"
                        required
                    >
                        <option value="">--Choose--</option>
                        {assignList.map((item) => (
                            <option key={item._id} value={item._id}>
                                {assignType === "user"
                                    ? `${item.first_name} ${item.last_name}`
                                    : item.project_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit */}
                <button type="submit" className="btn btn-primary w-full">
                    Assign Asset
                </button>
            </form>
        </div>
    );
};

export default AssignAsset;