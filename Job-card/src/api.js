const HOST = import.meta.env.VITE_API_HOST || "localhost:5000";
const API = import.meta.env.VITE_API_URL || `https://${HOST}/api`;
export default API;
