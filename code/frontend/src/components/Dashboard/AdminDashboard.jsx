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
  RadialLinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Wrench, AlertTriangle, Shield, Calendar, ChevronRight, Loader2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [locationUserData, setLocationUserData] = useState([]);
  const [projectAssetData, setProjectAssetData] = useState([]);
  const [locationAssetData, setLocationAssetData] = useState([]);
  const [pendingMaintenance, setPendingMaintenance] = useState([]);
  const [approachingWarranty, setApproachingWarranty] = useState([]);
  const [approachingInsurance, setApproachingInsurance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tablesLoading, setTablesLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role !== "Admin") {
        navigate("/login");
      }
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { token };
        
        // Get current admin's location
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const adminLocation = currentUser.location;
        
        const [
          projRes,
          userRes,
          assetRes,
          locationUserRes,
          projectAssetRes,
          locationAssetRes
        ] = await Promise.all([
          axios.get("http://localhost:3487/api/projects", { headers }),
          axios.get(`http://localhost:3487/api/user?adminLocation=${encodeURIComponent(adminLocation)}`, { headers }),
          axios.get(`http://localhost:3487/api/assets?adminLocation=${encodeURIComponent(adminLocation)}`, { headers }),
          axios.get("http://localhost:3487/api/admin/graph/location-users", { headers }),
          axios.get("http://localhost:3487/api/admin/graph/project-assets", { headers }),
          axios.get("http://localhost:3487/api/admin/graph/location-assets", { headers })
        ]);

        setProjectCount(projRes.data.length);
        setUserCount(userRes.data.length);
        setAssetCount(assetRes.data.length);
        setLocationUserData(locationUserRes.data);
        setProjectAssetData(projectAssetRes.data);
        setLocationAssetData(locationAssetRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTableData = async () => {
      setTablesLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { token };

        const [
          maintenanceRes,
          warrantyRes,
          insuranceRes
        ] = await Promise.all([
          axios.get("http://localhost:3487/api/admin/assets/pending-maintenance", { headers }),
          axios.get("http://localhost:3487/api/admin/assets/approaching-warranty", { headers }),
          axios.get("http://localhost:3487/api/admin/assets/approaching-insurance", { headers })
        ]);

        setPendingMaintenance(maintenanceRes.data.data.slice(0, 10));
        setApproachingWarranty(warrantyRes.data.data.slice(0, 10));
        setApproachingInsurance(insuranceRes.data.data.slice(0, 10));
      } catch (error) {
        console.error("Error fetching table data:", error);
      } finally {
        setTablesLoading(false);
      }
    };

    fetchData();
    fetchTableData();
  }, [navigate]);

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
      backgroundColor: colors.map(c => `${c}99`), // Adding transparency
      borderColor: colors,
    };
  };

  // Chart configurations
  const locationUserColors = generateColors(locationUserData.length);
  const projectAssetColors = generateColors(projectAssetData.length);
  const locationAssetColors = generateColors(locationAssetData.length);

  const locationUserChartData = {
    labels: locationUserData.map(item => item.location),
    datasets: [
      {
        label: 'Users',
        data: locationUserData.map(item => item.count),
        backgroundColor: locationUserColors.backgroundColor,
        borderColor: locationUserColors.borderColor,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const projectAssetChartData = {
    labels: projectAssetData.map(item => item.project),
    datasets: [
      {
        label: 'Assets',
        data: projectAssetData.map(item => item.count),
        backgroundColor: projectAssetColors.backgroundColor,
        borderColor: projectAssetColors.borderColor,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const locationAssetChartData = {
    labels: locationAssetData.map(item => item.location),
    datasets: [
      {
        data: locationAssetData.map(item => item.count),
        backgroundColor: locationAssetColors.backgroundColor,
        borderColor: locationAssetColors.borderColor,
        borderWidth: 1,
        hoverOffset: 8,
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

  const doughnutChartOptions = {
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}


      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Projects"
            count={projectCount}
            color="blue"
            icon="📊"
            to="/admin/projects/view"
          />

          <StatCard
            title="Users"
            count={userCount}
            color="green"
            icon="👥"
            to="/admin/view_users"
          />

          <StatCard
            title="Assets"
            count={assetCount}
            color="red"
            icon="📦"
            to="/admin/asset/view"
          />
        </div>

        {/* Alert Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pending Maintenance Table */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <Wrench className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Pending Maintenance</h3>
              </div>
              {pendingMaintenance.length > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {pendingMaintenance.length} items
                </span>
              )}
            </div>

            {tablesLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading maintenance data...</span>
              </div>
            ) : pendingMaintenance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[45%]">Asset</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">Office</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Days</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingMaintenance.map((item) => (
                      <tr
                        key={item.maintenance_id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/admin/assets/edit-maintenance/${item.asset_id}`)}
                      >
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium text-gray-900 truncate">{item.asset_name}</div>
                          <div className="text-xs text-gray-500 truncate">{item.serial_number}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-500 truncate">{item.office}</div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="block px-2 py-1 text-xs leading-5 font-semibold rounded-full text-center bg-yellow-100 text-yellow-800">
                            {new Date(item.expected_return_date) < new Date()
                              ? "Due date passed"
                              : `${item.days_in_maintenance} days`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 text-right">
                  <Link
                    to="/admin/view-pending-maintenance"
                    className="inline-flex items-center text-sm font-medium text-yellow-600 hover:text-yellow-900"
                  >
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center h-48 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No assets currently under maintenance</p>
              </div>
            )}
          </div>

          {/* Approaching Warranty Expiry Table */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Warranty Expiring</h3>
              </div>
              {approachingWarranty.length > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {approachingWarranty.length} items
                </span>
              )}
            </div>

            {tablesLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading warranty data...</span>
              </div>
            ) : approachingWarranty.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[45%]">Asset</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">Office</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Expires In</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approachingWarranty.map((item) => (
                      <tr
                        key={item.asset_id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/admin/assets/edit/${item.asset_id}`)}
                      >
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium text-gray-900 truncate">{item.asset_name}</div>
                          <div className="text-xs text-gray-500 truncate">{item.serial_number}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-500 truncate">{item.office}</div>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`block px-2 py-1 text-xs leading-5 font-semibold rounded-full text-center ${new Date(item.warranty_date) < new Date()
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                            }`}>
                            {new Date(item.warranty_date) < new Date()
                              ? "Expired"
                              : `${item.days_remaining} days`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 text-right">
                  <Link
                    to="/admin/view-approaching-warranty"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-900"
                  >
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center h-48 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No assets with warranty expiring soon</p>
              </div>
            )}
          </div>

          {/* Approaching Insurance Expiry Table */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Insurance Expiring</h3>
              </div>
              {approachingInsurance.length > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {approachingInsurance.length} items
                </span>
              )}
            </div>

            {tablesLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-green-500 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading insurance data...</span>
              </div>
            ) : approachingInsurance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[45%]">Asset</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">Office</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Expires In</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approachingInsurance.map((item) => (
                      <tr
                        key={item.asset_id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/admin/assets/edit/${item.asset_id}`)}
                      >
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium text-gray-900 truncate">{item.asset_name}</div>
                          <div className="text-xs text-gray-500 truncate">{item.serial_number}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-500 truncate">{item.office}</div>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`block px-2 py-1 text-xs leading-5 font-semibold rounded-full text-center ${new Date(item.insurance_date) < new Date()
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                            }`}>
                            {new Date(item.insurance_date) < new Date()
                              ? "Expired"
                              : `${item.days_remaining} days`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 text-right">
                  <Link
                    to="/admin/view-approaching-insurance"
                    className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-900"
                  >
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center h-48 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No assets with insurance expiring soon</p>
              </div>
            )}
          </div>
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
                  <Bar data={locationUserChartData} options={barChartOptions} />
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Assets per Project</h3>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
              ) : (
                <div className="h-64">
                  <Bar data={projectAssetChartData} options={barChartOptions} />
                </div>
              )}
            </div>
          </div>

          {/* Second row with doughnut chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Assets Distribution by Location</h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="animate-pulse text-gray-400">Loading chart data...</div>
              </div>
            ) : (
              <div className="h-64">
                <Doughnut data={locationAssetChartData} options={doughnutChartOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/project/add" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200">
              <span className="text-blue-600 text-2xl mb-2">📝</span>
              <span className="font-medium text-gray-800">New Project</span>
            </Link>

            <Link to="/admin/add_user" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200">
              <span className="text-green-600 text-2xl mb-2">👤</span>
              <span className="font-medium text-gray-800">Add User</span>
            </Link>

            <Link to="/admin/asset/add" className="bg-red-50 hover:bg-red-100 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200">
              <span className="text-red-600 text-2xl mb-2">➕</span>
              <span className="font-medium text-gray-800">Create Asset</span>
            </Link>

            <Link to="/admin/report" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200">
              <span className="text-purple-600 text-2xl mb-2">📊</span>
              <span className="font-medium text-gray-800">Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;