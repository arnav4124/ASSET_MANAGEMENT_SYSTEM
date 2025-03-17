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

// Register ChartJS components
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
      try {
        const locRes = await axios.get("http://localhost:3487/api/locations", {
          headers: {
            token: localStorage.getItem("token")
          }
        });
        setLocationCount(locRes.data.length);

        const progRes = await axios.get("http://localhost:3487/api/programmes", {
          headers: {
            token: localStorage.getItem("token")
          }
        });
        setProgramCount(progRes.data.length);

        const catRes = await axios.get("http://localhost:3487/api/categories", {
          headers: {
            token: localStorage.getItem("token")
          }
        });
        setCategoryCount(catRes.data.length);

        const adminRes = await axios.get("http://localhost:3487/api/admin/get_admins", {
          headers: {
            token: localStorage.getItem("token")
          }
        });
        setAdminCount(adminRes.data.length);

        // Fetch graph data
        const locationUsersRes = await axios.get("http://localhost:3487/api/superuser/location_users_graph", {
          headers: {
            token: localStorage.getItem("token")
          }
        });
        setLocationUsersData(locationUsersRes.data.data);

        const categoryAssetsRes = await axios.get("http://localhost:3487/api/superuser/category_assets_graph", {
          headers: {
            token: localStorage.getItem("token")
          }
        });
        setCategoryAssetsData(categoryAssetsRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Enhanced color palette for better visual appeal
  const colorPalette = [
    'rgba(66, 133, 244, 0.7)',  // Google Blue
    'rgba(219, 68, 55, 0.7)',   // Google Red
    'rgba(244, 180, 0, 0.7)',   // Google Yellow
    'rgba(15, 157, 88, 0.7)',   // Google Green
    'rgba(171, 71, 188, 0.7)',  // Purple
    'rgba(255, 112, 67, 0.7)',  // Deep Orange
    'rgba(0, 188, 212, 0.7)',   // Cyan
    'rgba(255, 64, 129, 0.7)',  // Pink
  ];

  const borderColors = colorPalette.map(color => color.replace('0.7', '1'));

  const locationUsersChartData = {
    labels: locationUsersData?.map(item => item.location_name) || [],
    datasets: [
      {
        label: 'Number of Users',
        data: locationUsersData?.map(item => item.user_count) || [],
        backgroundColor: colorPalette[0],
        borderColor: borderColors[0],
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 30,
        maxBarThickness: 35,
      },
    ],
  };

  const categoryAssetsChartData = {
    labels: categoryAssetsData?.map(item => item.category_name) || [],
    datasets: [
      {
        data: categoryAssetsData?.map(item => item.asset_count) || [],
        backgroundColor: colorPalette,
        borderColor: borderColors,
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', 'Helvetica', 'Arial', sans-serif",
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Location vs Number of Users',
        font: {
          size: 18,
          weight: 'bold',
          family: "'Inter', 'Helvetica', 'Arial', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 30
        },
        color: '#334155'
      },
      tooltip: {
        backgroundColor: 'rgba(26, 32, 44, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: true,
        caretSize: 6,
        cornerRadius: 6
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            family: "'Inter', 'Helvetica', 'Arial', sans-serif",
            size: 12
          },
          color: '#64748b'
        },
        grid: {
          display: true,
          color: 'rgba(226, 232, 240, 0.8)'
        }
      },
      x: {
        ticks: {
          font: {
            family: "'Inter', 'Helvetica', 'Arial', sans-serif",
            size: 12
          },
          color: '#64748b'
        },
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
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
            family: "'Inter', 'Helvetica', 'Arial', sans-serif",
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Category vs Number of Assets',
        font: {
          size: 18,
          weight: 'bold',
          family: "'Inter', 'Helvetica', 'Arial', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 30
        },
        color: '#334155'
      },
      tooltip: {
        backgroundColor: 'rgba(26, 32, 44, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: true,
        caretSize: 6,
        cornerRadius: 6
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 0,
        bottom: 10
      }
    },
    cutout: '50%'
  };

  return (
    <div className="p-8 bg-gray-50">
      <div className="grid grid-cols-2 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Locations Card */}
        <Link to="/superuser/view_location">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-700">Locations</h2>
            <p className="text-4xl font-bold text-blue-600">{locationCount}</p>
          </div>
        </Link>

        {/* Programs Card */}
        <Link to="/superuser/view_programme">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-green-500">
            <h2 className="text-lg font-semibold text-gray-700">Programs</h2>
            <p className="text-4xl font-bold text-green-600">{programCount}</p>
          </div>
        </Link>

        {/* Categories Card */}
        <Link to="/superuser/view_category">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-red-500">
            <h2 className="text-lg font-semibold text-gray-700">Categories</h2>
            <p className="text-4xl font-bold text-red-600">{categoryCount}</p>
          </div>
        </Link>

        {/* Admins Card */}
        <Link to="/superuser/view_admin">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-all text-center border-t-4 border-purple-500">
            <h2 className="text-lg font-semibold text-gray-700">Admins</h2>
            <p className="text-4xl font-bold text-purple-600">{adminCount}</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Location vs Users Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
          <div className="h-80">
            <Bar options={chartOptions} data={locationUsersChartData} />
          </div>
        </div>

        {/* Category vs Assets Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
          <div className="h-80">
            <Pie options={pieChartOptions} data={categoryAssetsChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperUserDashboard;