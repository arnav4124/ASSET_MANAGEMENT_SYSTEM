import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:3487/api/projects/${id}`, {
          headers: { token }
        });
        const data = await response.json();
        setProject(data);
      } catch (err) {
        console.error(err);
        setError("Error fetching project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    project && (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">{project.Project_name}</h1>
          <p className="text-gray-700 mb-2">
            <strong>Programme:</strong> {project.programme_name}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Project Head:</strong> {project.project_head}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Locations:</strong> {(project.location || []).join(", ")}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Deadline:</strong>{" "}
            {project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Description:</strong> {project.description}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Back
          </button>
        </div>
      </div>
    )
  );
};

export default ProjectDetails;