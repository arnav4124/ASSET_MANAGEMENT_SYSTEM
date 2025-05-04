import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Database, X, Download, HardDrive, FileJson, FileText } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SuperUserDashboard = () => {
  const [locationCount, setLocationCount] = useState(0);
  const [programCount, setProgramCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [locationUsersData, setLocationUsersData] = useState(null);
  const [categoryAssetsData, setCategoryAssetsData] = useState(null);
  const [programmeProjectsData, setProgrammeProjectsData] = useState(null);
  const [locationAssetsData, setLocationAssetsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Backup related states
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupFormat, setBackupFormat] = useState('json');
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupError, setBackupError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const role = JSON.parse(localStorage.getItem("user")).role;
      if (role !== "Superuser") {
        navigate("/login");
      }
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          locRes,
          progRes,
          catRes,
          adminRes,
          locationUsersRes,
          categoryAssetsRes,
          programmeProjectsRes,
          locationAssetsRes
        ] = await Promise.all([
          axios.get("http://localhost:3487/api/locations", {
            headers: { token: localStorage.getItem("token") }
          }),
          axios.get("http://localhost:3487/api/programmes", {
            headers: { token: localStorage.getItem("token") }
          }),
          axios.get("http://localhost:3487/api/categories", {
            headers: { token: localStorage.getItem("token") }
          }),
          axios.get("http://localhost:3487/api/admin/get_admins", {
            headers: { token: localStorage.getItem("token") }
          }),
          axios.get("http://localhost:3487/api/superuser/location_users_graph", {
            headers: { token: localStorage.getItem("token") }
          }),
          axios.get("http://localhost:3487/api/superuser/category_assets_graph", {
            headers: { token: localStorage.getItem("token") }
          }),
          axios.get("http://localhost:3487/api/superuser/programme_projects_graph", {
            headers: { token: localStorage.getItem("token") }
          }),
          axios.get("http://localhost:3487/api/superuser/location_assets_graph", {
            headers: { token: localStorage.getItem("token") }
          })
        ]);

        setLocationCount(locRes.data.length);
        setProgramCount(progRes.data.length);
        setCategoryCount(catRes.data.length);
        setAdminCount(adminRes.data.length);
        setLocationUsersData(locationUsersRes.data.data);
        setCategoryAssetsData(categoryAssetsRes.data.data);
        setProgrammeProjectsData(programmeProjectsRes.data.data);
        setLocationAssetsData(locationAssetsRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle backup creation and download
  const handleBackup = async () => {
    setBackupInProgress(true);
    setBackupError(null);

    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:3487/api/superuser/database-backup',
        data: { format: backupFormat },
        headers: {
          token: localStorage.getItem("token"),
          'Content-Type': 'application/json'
        },
        responseType: 'blob', // Important for handling file download
      });

      // Create a blob link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Set filename based on format
      const timestamp = new Date().toISOString().split('T')[0];
      let extension;

      if (backupFormat === 'json') {
        extension = 'json';
      } else {
        // Both CSV and BSON formats are delivered as ZIP files
        extension = 'zip';
      }

      link.setAttribute('download', `database-backup-${timestamp}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Close modal after successful download
      setShowBackupModal(false);
    } catch (error) {
      console.error('Error creating backup:', error);
      setBackupError('Failed to create backup. Please try again.');
    } finally {
      setBackupInProgress(false);
    }
  };

  // Generate vibrant colors for charts
  const generateColors = (count) => {
    const colorPalettes = [
      ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],  // Blue
      ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],  // Green
      ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],  // Yellow
      ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],  // Red
      ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],  // Purple
    ];

    const colors = [];
    for (let i = 0; i < count; i++) {
      const paletteIndex = i % colorPalettes.length;
      const colorIndex = Math.floor(i / colorPalettes.length) % colorPalettes[paletteIndex].length;
      colors.push(colorPalettes[paletteIndex][colorIndex]);
    }

    return {
      backgroundColor: colors.map(c => `${c}99`),
      borderColor: colors,
    };
  };

  // Chart configurations
  const locationUserColors = generateColors(locationUsersData?.length || 0);
  const categoryAssetColors = generateColors(categoryAssetsData?.length || 0);
  const programmeProjectColors = generateColors(programmeProjectsData?.length || 0);
  const locationAssetColors = generateColors(locationAssetsData?.length || 0);

  const locationUsersChartData = {
    labels: locationUsersData?.map(item => item.location_name) || [],
    datasets: [
      {
        label: 'Users',
        data: locationUsersData?.map(item => item.user_count) || [],
        backgroundColor: locationUserColors.backgroundColor,
        borderColor: locationUserColors.borderColor,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const categoryAssetsChartData = {
    labels: categoryAssetsData?.map(item => item.category_name) || [],
    datasets: [
      {
        data: categoryAssetsData?.map(item => item.asset_count) || [],
        backgroundColor: categoryAssetColors.backgroundColor,
        borderColor: categoryAssetColors.borderColor,
        borderWidth: 1,
        hoverOffset: 8,
      },
    ],
  };

  const programmeProjectsChartData = {
    labels: programmeProjectsData?.map(item => item.programme_name) || [],
    datasets: [
      {
        label: 'Projects',
        data: programmeProjectsData?.map(item => item.project_count) || [],
        backgroundColor: programmeProjectColors.backgroundColor,
        borderColor: programmeProjectColors.borderColor,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const locationAssetsChartData = {
    labels: locationAssetsData?.map(item => item.location_name) || [],
    datasets: [
      {
        label: 'Assets',
        data: locationAssetsData?.map(item => item.asset_count) || [],
        backgroundColor: locationAssetColors.backgroundColor,
        borderColor: locationAssetColors.borderColor,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 13
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif'
          },
          precision: 0
        },
        beginAtZero: true
      }
    },
    animation: {
      duration: 2000
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 13
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    },
    cutout: '65%',
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  const StatCard = ({ title, count, color, icon, to }) => (
    <Link to={to} className="block">
      <div className={`bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all border-l-4 border-${color}-500 transform hover:-translate-y-1 duration-300 flex items-center`}>
        <div className={`bg-${color}-100 p-4 rounded-lg mr-4`}>
          <span className={`text-${color}-500 text-xl`}>{icon}</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          <p className={`text-4xl font-bold text-${color}-600`}>
            {isLoading ? (
              <span className="inline-block w-16 h-10 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              count
            )}
          </p>
        </div>
      </div>
    </Link>
  );

  // Backup Modal Component
  const BackupModal = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-0 overflow-hidden transition-all transform">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Database className="text-white" size={20} />
            <h2 className="text-xl font-bold text-white">Database Backup</h2>
          </div>
          <button
            className="text-white hover:text-gray-200 focus:outline-none"
            onClick={() => setShowBackupModal(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Create a backup of the entire database. Choose your preferred format below:
          </p>

          {/* Format selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* JSON Option */}
            <div
              onClick={() => setBackupFormat('json')}
              className={`border p-4 rounded-lg text-center cursor-pointer hover:bg-blue-50 transition-all ${backupFormat === 'json' ? 'bg-blue-100 border-blue-500 shadow-md' : 'border-gray-200'
                }`}
            >
              <div className="flex justify-center mb-2">
                <FileJson size={32} className={backupFormat === 'json' ? 'text-blue-600' : 'text-gray-500'} />
              </div>
              <p className={`font-medium ${backupFormat === 'json' ? 'text-blue-700' : 'text-gray-700'}`}>
                JSON
              </p>
              <p className="text-xs text-gray-500 mt-1">Standard data format</p>
            </div>

            {/* CSV Option */}
            <div
              onClick={() => setBackupFormat('csv')}
              className={`border p-4 rounded-lg text-center cursor-pointer hover:bg-blue-50 transition-all ${backupFormat === 'csv' ? 'bg-blue-100 border-blue-500 shadow-md' : 'border-gray-200'
                }`}
            >
              <div className="flex justify-center mb-2">
                <FileText size={32} className={backupFormat === 'csv' ? 'text-blue-600' : 'text-gray-500'} />
              </div>
              <p className={`font-medium ${backupFormat === 'csv' ? 'text-blue-700' : 'text-gray-700'}`}>
                CSV
              </p>
              <p className="text-xs text-gray-500 mt-1">For spreadsheet apps</p>
            </div>
          </div>

          {/* Error message if any */}
          {backupError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 text-sm">{backupError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={() => setShowBackupModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={backupInProgress}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBackup}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              disabled={backupInProgress}
            >
              {backupInProgress ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating backup...
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  Download Backup
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Locations"
            count={locationCount}
            color="blue"
            icon="📍"
            to="/superuser/view_location"
          />

          <StatCard
            title="Programs"
            count={programCount}
            color="green"
            icon="📊"
            to="/superuser/view_programme"
          />

          <StatCard
            title="Categories"
            count={categoryCount}
            color="red"
            icon="📁"
            to="/superuser/view_category"
          />

          <StatCard
            title="Admins"
            count={adminCount}
            color="purple"
            icon="👥"
            to="/superuser/view_admin"
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Overview</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* First row charts */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Users per Location</h3>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
              ) : (
                <div className="h-64">
                  <Bar data={locationUsersChartData} options={barChartOptions} />
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Assets by Category</h3>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
              ) : (
                <div className="h-64">
                  <Pie data={categoryAssetsChartData} options={pieChartOptions} />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Second row charts */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Projects per Programme</h3>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
              ) : (
                <div className="h-64">
                  <Bar data={programmeProjectsChartData} options={barChartOptions} />
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Assets per Location</h3>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
              ) : (
                <div className="h-64">
                  <Bar data={locationAssetsChartData} options={barChartOptions} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <Link to="/superuser/assign_admin" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200">
              <span className="text-blue-600 text-2xl mb-2">👤</span>
              <span className="font-medium text-gray-800">Add Admin</span>
            </Link>

            <Link to="/superuser/add_category" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200">
              <span className="text-green-600 text-2xl mb-2">📁</span>
              <span className="font-medium text-gray-800">Add Category</span>
            </Link>

            <Link to="/superuser/add_location" className="bg-red-50 hover:bg-red-100 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200">
              <span className="text-red-600 text-2xl mb-2">📍</span>
              <span className="font-medium text-gray-800">Add Location</span>
            </Link>

            <Link to="/superuser/add_programme" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200">
              <span className="text-purple-600 text-2xl mb-2">📊</span>
              <span className="font-medium text-gray-800">Add Programme</span>
            </Link>

            <button
              onClick={() => setShowBackupModal(true)}
              className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200"
            >
              <span className="text-indigo-600 text-2xl mb-2">
                <Database size={24} />
              </span>
              <span className="font-medium text-gray-800">Backup Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup Modal */}
      {showBackupModal && <BackupModal />}
    </div>
  );
};

export default SuperUserDashboard;