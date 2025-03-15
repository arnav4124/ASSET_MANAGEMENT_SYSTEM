import React, { useState,useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, ChevronLeft, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const AddEmployee = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [managers,setManagers]= useState([]);
  const [locations,setLocations]= useState([]);
  useEffect(()=>{
    const token_st = localStorage.getItem("token")
    const token=localStorage.getItem('token')
         if(!token){
             navigate('/login')
         }
         else{
             const role =JSON.parse(localStorage.getItem('user')).role
             console.log(role)
 
             if(role!=='Admin'){
                 navigate('/login')
             }
         }
    if(!token_st){
      alert("unauthorized_access")
      navigate("/login")
    }
    const fetchManagers = async ()=>{

      console.log(token_st)
      if(!token){
        alert("unauthorized_access")
        navigate("/login")
        return;
      }
      setLoading(true)
      try{
        console.log("SENDING REQ FOR MANAGERS")
        const response = await axios.get("http://localhost:3487/api/admin/get_manager",{
          headers:{
            token:token_st
          }
        })

        if(response?.data?.success === false){
          alert("unauthorized_access")
          navigate("/login")
        }
        console.log(response)
        setManagers(response.data)
      }
      catch(err){
        console.log("Error fetching managers:",err)
        setError("Error fetching managers")
      }
      finally{
        setLoading(false)
      }
    } 
    const fetchLocations = async ()=>{  
      setLoading(true)
      try{
        console.log("SENDING REQ FOR LOCATIONS")
        const response = await axios.get("http://localhost:3487/api/locations/get_all_cities",{
          headers:{
            token:token_st
          }
        })
        if(response?.data?.success === false){
          alert("unauthorized_access")
          navigate("/login")
        }
        console.log(response)
        setLocations(response.data)
      }
      catch(err){
        console.log("Error fetching locations:",err)
        setError("Error fetching locations")
      }
      finally{
        setLoading(false)
      }
    }

    fetchManagers()
    fetchLocations()
   },[navigate])

  useEffect(() => {
    console.log("Managers:", managers);
  }, [managers]);
  useEffect(()=>{
    console.log("Locations:",locations)
  },[locations])
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phoneNumber: "",
      manager: "",
      location: ""
    }
  });

  const onSubmit = async(data) =>{
    try{
      setLoading(true)
      setError(null)
      setShowSuccess(false)
      setIsSubmitting(true)
      console.log("Submitting data:")
      console.log(data)
      const response = await axios.post("http://localhost:3487/api/admin/add_user",{
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        manager: data.manager,
        location : data.location
      },{
      headers:{
        token:localStorage.getItem("token")
      }})
      console.log(response)
      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        reset();
        alert("user added successfully!");
        navigate("/superuser/add_location");
      }
    }
    catch(err){
      console.error("Error adding employee:", err);
      setError("Error adding employee")
    }
    finally{
      setLoading(false)
      setIsSubmitting(false)
    }
  }
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);
    setShowSuggestions(true);
  
    if (query.trim() === "") {
      setFilteredManagers([]);
      return;
    }
  
    // Filter the managers based on the search term
    const filtered = managers.filter((manager) => {
      // Create a full name from first_name and last_name
      const fullName = `${manager.first_name} ${manager.last_name}`.toLowerCase();
      const email = manager.email.toLowerCase();
      
      // Check if the search term is in the full name or email
      return fullName.includes(query) || email.includes(query);
    });
  
    setFilteredManagers(filtered);
  };

  const selectManager = (manager) => {
    setSelectedManager(`${manager.first_name} ${manager.last_name}`);
    setSearchTerm(`${manager.first_name} ${manager.last_name} (${manager.email})`);
    setValue("manager", manager._id.toString());
    setShowSuggestions(false);
  };
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-white text-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          Loading...
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with shadow and subtle gradient */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Add Employee</h1>
              <p className="text-gray-500 mt-1">Enter employee details to add them to the system</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <UserPlus size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Success message with animation */}
        {showSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-md animate-fadeIn">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Check size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Employee added successfully!</p>
                <p className="text-green-600 text-sm">The employee has been added to the system.</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          {/* Form Sections */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Personal Information</h2>
            
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* First Name */}
              <div className="transition-all duration-200">
                <label className="block font-medium text-sm mb-1 text-gray-700">First Name</label>
                <input
                  {...register("first_name", { 
                    required: "First name is required",
                    minLength: { value: 2, message: "First name must be at least 2 characters" }
                  })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.first_name.message}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div className="transition-all duration-200">
                <label className="block font-medium text-sm mb-1 text-gray-700">Last Name</label>
                <input
                  {...register("last_name", { 
                    required: "Last name is required",
                    minLength: { value: 2, message: "Last name must be at least 2 characters" }
                  })}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-2">Contact Information</h2>
            
            {/* Email & Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Email */}
              <div className="transition-all duration-200">
                <label className="block font-medium text-sm mb-1 text-gray-700">Email Address</label>
                <input
                  {...register("email", { 
                    required: "Email is required",
                    pattern: { 
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                      message: "Invalid email address" 
                    }
                  })}
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="example@company.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.email.message}</p>
                )}
              </div>
              
              {/* Phone Number */}
              <div className="transition-all duration-200">
                <label className="block font-medium text-sm mb-1 text-gray-700">Phone Number</label>
                <input
                  {...register("phoneNumber", { 
                    required: "Phone number is required",
                    pattern: { 
                      value: /^[0-9+\-\s()]{7,15}$/, 
                      message: "Invalid phone number" 
                    }
                  })}
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            <h2 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2 pt-2">Management</h2>
            
            {/* Manager - Autocomplete */}
            <div className="mb-6 relative">
              <label className="block font-medium text-sm mb-1 text-gray-700">
                Manager (Search by name or email)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Start typing to search for a manager"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 outline-none"
              />
              <input
                type="hidden"
                {...register("manager", { required: "Please select a manager" })}
              />
              
              {/* Suggestions list */}
              {showSuggestions && filteredManagers.length > 0 && (
                <div className="absolute z-10 bg-white mt-1 w-full border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredManagers.map((manager) => (
                    <div 
                      key={manager.id}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors duration-150"
                      onClick={() => selectManager(manager)}
                    >
                      <div className="font-medium">{manager.name}</div>
                      <div className="text-sm text-gray-500">{manager.email}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No results message */}
              {showSuggestions && searchTerm && filteredManagers.length === 0 && (
                <div className="absolute z-10 bg-white mt-1 w-full border border-gray-300 rounded-md shadow-lg p-3">
                  <p className="text-gray-500">No managers found. Try a different search term.</p>
                </div>
              )}
              
              {errors.manager && <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.manager.message}</p>}
              
              {/* Selected manager display */}
              {selectedManager && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">Selected: </span>
                    <span className="text-blue-700">{selectedManager}</span>
                  </div>
                  <button 
                    type="button"
                    className="text-sm text-gray-500 hover:text-red-500"
                    onClick={() => {
                      setSelectedManager(null);
                      setSearchTerm("");
                      setValue("manager", "");
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">Select Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc, index) => (
  <label key={index} className="flex items-center space-x-2">
    <input
      type="radio"
      value={loc} // Use the location string directly
      {...register("location", { required: "Please select a location" })}
      className="form-radio"
    />
    <span>{loc}</span> {/* Display the location string */}
  </label>
))}
          </div>
            {/* Additional Notes (Optional) */}
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 p-6 flex justify-end border-t">
            <button
              type="button"
              onClick={() => {
                reset();
                setSelectedManager(null);
                setSearchTerm("");
              }}
              className="px-4 py-2 mr-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-all duration-200"
            >
              Reset
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>

        {/* Navigation Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mx-auto transition-all duration-200"
            onClick={() => window.history.back()}
          >
            <ChevronLeft size={16} />
            <span className="text-sm">Back to Employee List</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;