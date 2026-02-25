import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined") {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = (payload) => api.post("/api/auth/register", payload);
export const loginUser = (payload) => api.post("/api/auth/login", payload);
export const fetchMe = () => api.get("/api/auth/me");
export const verifyEmail = (payload) => api.post("/api/auth/verify-email", payload);
export const forgotPassword = (payload) => api.post("/api/auth/forgot-password", payload);
export const resetPassword = (payload) => api.post("/api/auth/reset-password", payload);

// Department APIs
export const getDepartments = () => api.get("/api/departments");
export const seedDepartments = () => api.post("/api/departments/seed");
export const getDailyAnalytics = () => api.get("/api/analytics/daily");

// Queue APIs - Patient
export const generateToken = (departmentId, doctorId) => api.post("/api/queue/token", { departmentId, doctorId });
export const getMyTokens = () => api.get("/api/queue/my-tokens");
export const getQueueStatus = (departmentId) => api.get(`/api/queue/status/${departmentId}`);

// Queue APIs - Admin/Staff
export const getDepartmentQueue = (departmentId) => api.get(`/api/queue/department/${departmentId}`);
export const callNextToken = (departmentId) => api.post(`/api/queue/department/${departmentId}/next`);
export const completeToken = (tokenId) => api.patch(`/api/queue/token/${tokenId}/complete`);
export const getQueueHistory = (departmentId, params) => api.get(`/api/queue/department/${departmentId}/history`, { params });
export const skipToken = (tokenId) => api.patch(`/api/queue/token/${tokenId}/skip`);
export const resetQueue = (departmentId) => api.post(`/api/queue/department/${departmentId}/reset`);

// Department Management
export const addDepartment = (payload) => api.post("/api/departments", payload);

// Staff Management
export const getStaff = () => api.get("/api/staff");
export const getDoctorsByDepartment = (deptId) => api.get(`/api/staff/department/${deptId}`);
export const createStaff = (payload) => api.post("/api/staff", payload);
export const updateStaffDept = (id, departmentId) => api.patch(`/api/staff/${id}/department`, { departmentId });
export const toggleAvailability = () => api.patch("/api/staff/toggle-availability");

// Feedback APIs
export const submitFeedback = (payload) => api.post("/api/feedback/submit", payload);
export const checkFeedback = (tokenId) => api.get(`/api/feedback/check/${tokenId}`);
export const getAllFeedback = (params) => api.get("/api/feedback/all", { params });
export const getDoctorFeedback = (doctorId) => api.get(`/api/feedback/doctor/${doctorId}`);

// System Configuration APIs
export const getSystemConfig = () => api.get("/api/config");
export const updateSystemConfig = (payload) => api.put("/api/config", payload);

// Contact APIs
export const submitContactMessage = (payload) => api.post("/api/contact", payload);
export const getContactMessages = (params) => api.get("/api/contact", { params });
export const updateContactStatus = (id, payload) => api.patch(`/api/contact/${id}`, payload);
export const deleteContactMessage = (id) => api.delete(`/api/contact/${id}`);

export default api;
