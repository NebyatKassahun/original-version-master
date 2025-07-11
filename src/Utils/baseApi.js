export const getBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:3000";

export const normalizeImageUrl = (url) => {
  if (!url) return '';
  return url.replace(/([^:]\/)\/+/, '$1/');
};
