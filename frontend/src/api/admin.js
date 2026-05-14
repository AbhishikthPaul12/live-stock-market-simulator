import axios from "./axios";

/**
 * AI Notifications / Announcements API
 * Currently mocks data if no backend endpoint exists.
 */
export const getAnnouncements = async () => {
  try {
    // Attempt to fetch from backend (optional future-proofing)
    // const res = await axios.get("/announcements");
    // return res.data;
    
    // For now, return empty array to trigger mock logic in AINotifications.jsx
    return [];
  } catch (error) {
    console.warn("Announcements API failed, using fallback.");
    return [];
  }
};
