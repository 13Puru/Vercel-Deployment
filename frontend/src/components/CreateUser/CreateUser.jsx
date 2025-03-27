import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Key, Briefcase, Shield, AlertTriangle, Eye, EyeOff } from "lucide-react";
import Card from "../Card/Card";
import axios from "axios"; // Import axios for API calls


const CreateUser = ({setActiveView}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "", // Changed from name to username to match backend
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: ""
  });
  

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [roleOfUser, setUserRole] = useState(localStorage.getItem("userRole"))
  const API_CREATE_USER = import.meta.env.VITE_CREATE_USER;

  const departments = [
    "IT",
    "HR",
    "Finance",
    "Marketing",
    "Sales",
    "Support",
    "Operations",
    "Customer Service",
    "Research & Development",
    "Legal"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.username.trim()) {
      tempErrors.username = "Username is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Department is not required in your backend but we'll keep this validation
    

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Get auth token from localStorage (assuming you store it there)
        const token = localStorage.getItem("userToken");
        
        if (!token) {
          throw new Error("Authentication token not found");
        }
        
        // Prepare data for API - only include fields the backend expects
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          role: formData.role
        };
        
        // Make API call
        const response = await axios.post(
          API_CREATE_USER, 
          userData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // Handle success
        if (response.data.success) {
          alert("User created successfully! Login credentials sent via email.");
          setActiveView("ViewUsers"); 
        } else {
          throw new Error(response.data.message || "Failed to create user");
        }
        
      } catch (error) {
        console.error("Error creating user:", error);
        
        // Handle specific error messages from the API
        if (error.response && error.response.data) {
          setErrors({
            submit: error.response.data.message || "Failed to create user. Please try again."
          });
        } else {
          setErrors({
            submit: "Failed to create user. Please try again."
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getUserInfo = () => {
    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const username = localStorage.getItem("username") || "";
      const role = localStorage.getItem("userRole") || "";
      return { email: userEmail, username, role };
    } catch (error) {
      console.error("Error retrieving user info:", error);
      return { email: "", username: "" , role: ""};
    }
  };

  const { email, username, role } = getUserInfo();

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setActiveView("dashboard")}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create New User</h1>
      </div>
      <div className="mb-4 ml-6"> <b>{username}</b> with email: <b>{email}</b> is creating a new user for the system </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-50 p-4 rounded-md flex items-start">
              <AlertTriangle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username Field - changed from name to username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="johndoe"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="john.doe@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Department Field */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase size={16} className="text-gray-400" />
                </div>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.department ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-gray-400" />
                </div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? 
                    <EyeOff size={16} className="text-gray-400" /> : 
                    <Eye size={16} className="text-gray-400" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-gray-400" />
                </div>
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                >
                  {confirmPasswordVisible ? 
                    <EyeOff size={16} className="text-gray-400" /> : 
                    <Eye size={16} className="text-gray-400" />
                  }
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Role
            </label>
            <div className="flex flex-wrap gap-4">
              {roleOfUser === "admin" && (
                <>
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                formData.role === 'admin' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <Shield size={20} className="text-indigo-600 mr-2" />
                <div>
                  <span className="block font-medium text-gray-900">Administrator</span>
                  <span className="block text-xs text-gray-500">Full system access</span>
                </div>
              </label>
              
              
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                formData.role === 'agent' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="agent"
                  checked={formData.role === 'agent'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <User size={20} className="text-blue-600 mr-2" />
                <div>
                  <span className="block font-medium text-gray-900">Support Agent</span>
                  <span className="block text-xs text-gray-500">Can manage tickets</span>
                </div>
              </label>
              </>
              )}
              
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                formData.role === 'user' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <User size={20} className="text-gray-600 mr-2" />
                <div>
                  <span className="block font-medium text-gray-900">Standard User</span>
                  <span className="block text-xs text-gray-500">Can create and view tickets</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-700 rounded-md text-sm font-medium text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateUser;