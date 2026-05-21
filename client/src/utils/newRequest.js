import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const newRequest = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

// Auto-handle stale sessions: if token is invalid/expired, clear local state and redirect to login
newRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const msg = error.response?.data;
      // Only auto-logout on token errors, not permission errors
      if (
        typeof msg === 'string' &&
        (msg.includes('not authenticated') || msg.includes('Token is not valid'))
      ) {
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default newRequest;