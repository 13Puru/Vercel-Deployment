import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  UserPlus,
  Mail,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  UserCog,
  CheckCircle,
  XCircle
} from "lucide-react";
import Card from "../Card/Card";

const ViewUsers = ({setActiveView}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  //API ENDPOINTS
  const API_GET_USER = import.meta.env.VITE_GET_USER;
  const API_RESTRICT = import.meta.env.VITE_RESTRICT;
  const API_UNRESTRICT = import.meta.env.UNRESTRICT;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(API_GET_USER, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Transform each user, ensuring status is properly handled
        const transformedUsers = response.data.users.map(user => {
          // Default to "unknown" if status is missing
          const status = user.status || "unknown";
          
          // Log the raw isverified value from DB to help debug
          console.log(`User ${user.username} isverified value:`, user.isverified);
          
          return {
            id: user.user_id,
            name: user.username || "Unknown",
            email: user.email,
            role: user.role || "user",
            created_at: user.created_at,
            status: status, // Keep the original status value
            // Safely capitalize the first letter
            displayStatus: status.charAt(0).toUpperCase() + status.slice(1),
            // More robust verification check - default to false if undefined
            isVerified: user.isverified === 'true' || user.isverified === true || false
          };
        });
        
        setUsers(transformedUsers);
        setError(null);
      } else {
        setError("Failed to fetch users: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Role badge colors
  const roleBadgeColors = {
    admin: "bg-purple-100 text-purple-800",
    agent: "bg-blue-100 text-blue-800",
    user: "bg-gray-100 text-gray-800"
  };

  // Status badge colors - using lowercase keys to match database values
  const statusBadgeColors = {
    active: "bg-green-100 text-green-800",
    restricted: "bg-red-100 text-red-800",
    unknown: "bg-gray-100 text-gray-800"
  };

  // Filter users based on search term, role filter and status filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    // Match status filter against lowercase status from database
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "Active" && user.status === "active") || 
                         (filterStatus === "Restricted" && user.status === "restricted");
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "email") {
      comparison = a.email.localeCompare(b.email);
    } else if (sortBy === "department") {
      comparison = (a.department || "").localeCompare(b.department || "");
    } else if (sortBy === "created_at") {
      comparison = new Date(a.created_at) - new Date(b.created_at);
    } else if (sortBy === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortBy === "isVerified") {
      // Sort by boolean values directly
      return sortOrder === "asc" 
        ? (a.isVerified === b.isVerified ? 0 : a.isVerified ? -1 : 1)
        : (a.isVerified === b.isVerified ? 0 : a.isVerified ? 1 : -1);
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleRestrictUser = async (userId) => {
    if (window.confirm("Are you sure you want to restrict this user?")) {
      try {
        setActionInProgress(true);
        const token = localStorage.getItem("userToken");
        
        if (!token) {
          alert("Authentication token is missing. Please log in again.");
          setActionInProgress(false);
          return;
        }

        const response = await axios.post(
          `${API_RESTRICT}/${userId}`, 
          {},  // Empty body
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          // Refresh the user list from the database to ensure we have the latest data
          await fetchUsers();
          // Success notification
          alert("User has been restricted successfully.");
        } else {
          alert("Failed to restrict user: " + (response.data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Error restricting user:", err);
        alert(err.response?.data?.message || "Failed to restrict user");
      } finally {
        setActionInProgress(false);
      }
    }
  };

  const handleUnrestrictUser = async (userId) => {
    if (window.confirm("Are you sure you want to unrestrict this user?")) {
      try {
        setActionInProgress(true);
        const token = localStorage.getItem("userToken");
        
        if (!token) {
          alert("Authentication token is missing. Please log in again.");
          setActionInProgress(false);
          return;
        }

        const response = await axios.post(
          `${API_UNRESTRICT}/${userId}`, 
          {},  // Empty body
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          // Refresh the user list from the database to ensure we have the latest data
          await fetchUsers();
          // Success notification
          alert("User has been unrestricted successfully.");
        } else {
          alert("Failed to unrestrict user: " + (response.data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Error unrestricting user:", err);
        alert(err.response?.data?.message || "Failed to unrestrict user");
      } finally {
        setActionInProgress(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => setActiveView("dashboard")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchUsers}
            disabled={loading || actionInProgress}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium flex items-center disabled:opacity-50"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setActiveView("CreateUser")}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <UserPlus size={16} className="mr-2" />
            Add New User
          </button>
        </div>
      </div>

      <Card>
        {error && (
          <div className="bg-red-50 text-red-800 p-4 mb-4 rounded-md">
            {error}
            <button 
              onClick={fetchUsers} 
              className="ml-3 underline"
              disabled={loading}
            >
              Try again
            </button>
          </div>
        )}
        
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="appearance-none w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
                <option value="user">User</option>
              </select>
              <Filter size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Restricted">Restricted</option>
              </select>
              <Filter size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div>
            </div>
          ) : (
            <table className="min-w-full bg-white rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortBy === "name" && (
                        <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {sortBy === "email" && (
                        <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === "status" && (
                        <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("isVerified")}
                  >
                    <div className="flex items-center">
                      Verified
                      {sortBy === "isVerified" && (
                        <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Created
                      {sortBy === "created_at" && (
                        <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 flex-shrink-0 mr-3 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-800 font-medium text-sm">
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail size={14} className="mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeColors[user.role] || "bg-gray-100 text-gray-800"}`}>
                        {user.role === "admin" && <Shield size={12} className="mr-1" />}
                        {user.role === "agent" && <UserCog size={12} className="mr-1" />}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColors[user.status] || "bg-gray-100 text-gray-800"}`}>
                        {user.status === "active" ? (
                          <Unlock size={12} className="mr-1" />
                        ) : (
                          <Lock size={12} className="mr-1" />
                        )}
                        {user.displayStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Display verification status dynamically based on isVerified flag */}
                      {user.isVerified ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          <CheckCircle size={12} className="mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-gray-800">
                          <XCircle size={12} className="mr-1" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <div className="flex justify-center space-x-2">
                        {/* Show Restrict button if status is "active" */}
                        {user.status === "active" && (
                          <button
                            onClick={() => handleRestrictUser(user.id)}
                            className="text-red-600 hover:text-red-900 focus:outline-none disabled:opacity-50 flex items-center"
                            title="Restrict User"
                            disabled={actionInProgress}
                          >
                            <Lock size={16} className="mr-1" />
                            <span>Restrict</span>
                          </button>
                        )}
                        
                        {/* Show Unrestrict button if status is "restricted" */}
                        {user.status === "restricted" && (
                          <button
                            onClick={() => handleUnrestrictUser(user.id)}
                            className="text-green-600 hover:text-green-900 focus:outline-none disabled:opacity-50 flex items-center"
                            title="Unrestrict User"
                            disabled={actionInProgress}
                          >
                            <Unlock size={16} className="mr-1" />
                            <span>Unrestrict</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedUsers.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ViewUsers;