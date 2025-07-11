import React, { useState, useEffect } from "react";
import { Layers, Eye, EyeOff, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBaseUrl } from "../../../Utils/baseApi";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const navigate = useNavigate();

  // Fetch available roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        console.log("Fetching roles from:", `${getBaseUrl()}/api/roles/register`);
        
        // Use the public registration roles endpoint
        const res = await fetch(`${getBaseUrl()}/api/roles/register`, {
          headers: { "Content-Type": "application/json" },
        });
        
        // console.log("Roles response status:", res.status);
        
        if (res.ok) {
          const rolesData = await res.json();
          // console.log("Roles data received:", rolesData);
          
          const availableRoles = Array.isArray(rolesData) ? rolesData : [];
          // console.log("Available roles:", availableRoles);
          
          setRoles(availableRoles);
          
          // Set default role if available
          if (availableRoles.length > 0) {
            const defaultRole = availableRoles.find(role => role.roleType === "user") || availableRoles[0];
            setSelectedRole(defaultRole.roleId);
            // console.log("Selected default role:", defaultRole);
          }
        } else {
          // console.error("Failed to fetch registration roles:", res.status);
          // const errorText = await res.text();
          // console.error("Error response:", errorText);
          
          // Fallback to default roles based on your backend data
          // const defaultRoles = [
          //   { roleId: "rol_4ae09784-bfbe-4d9c-807f-0d2dd8c90833", roleType: "SalesRep", isAdmin: false },
          //   { roleId: "rol_3496e503-8341-4c27-a71a-8ed14946930c", roleType: "InventoryManager", isAdmin: false }
          // ];
          setRoles(defaultRoles);
          setSelectedRole(defaultRoles[0].roleId);
          console.log("Using fallback roles:", defaultRoles);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        // Fallback to default roles on error based on your backend data
        const defaultRoles = [
          { roleId: "rol_4ae09784-bfbe-4d9c-807f-0d2dd8c90833", roleType: "SalesRep", isAdmin: false },
          { roleId: "rol_3496e503-8341-4c27-a71a-8ed14946930c", roleType: "InventoryManager", isAdmin: false }
        ];
        setRoles(defaultRoles);
        setSelectedRole(defaultRoles[0].roleId);
        console.log("Using fallback roles due to error:", defaultRoles);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation checks
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    
    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    
    try {
      const requestData = { 
        firstName: firstName.trim(), 
        lastName: lastName.trim(), 
        email: email.trim().toLowerCase(), 
        password,
        roleId: selectedRole,
      };
      
      console.log("Sending registration data:", requestData);
      
      const res = await fetch(`${getBaseUrl()}/api/users/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      
      console.log("Response status:", res.status);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));
      
      let data;
      const responseText = await res.text();
      console.log("Raw response:", responseText);
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }
      
      console.log("Parsed response data:", data);
      
      if (!res.ok) {
        // Handle validation errors from backend
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg || err.message).join(", ");
          throw new Error(errorMessages);
        }
        
        // Handle different error response formats
        const errorMessage = data.message || data.error || data.msg || data.detail || "Registration failed.";
        throw new Error(errorMessage);
      }
      
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create an Account</h2>
          <p className="mt-2 text-sm text-gray-600">Sign up to manage your inventory</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="First name"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Role</span>
                </div>
              </label>
              <select
                id="role"
                name="role"
                required
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={loadingRoles}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50"
              >
                <option value="">
                  {loadingRoles ? "Loading roles..." : "Select a role"}
                </option>
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleType.charAt(0).toUpperCase() + role.roleType.slice(1)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Choose your role in the system
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pr-12 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || loadingRoles}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : "Register"}
            </button>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <a href="/login" className="text-blue-600 hover:underline text-sm">
                Login
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;