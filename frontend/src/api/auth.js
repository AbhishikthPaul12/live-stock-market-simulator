import axios from "./axios.js";

export const loginUser = async (data) => {
  const res = await axios.post("/auth/login", data);

  // STORE USER
  localStorage.setItem("user", JSON.stringify(res.data));

  return res.data;
};

export const getProfile = async () => {
  const res = await axios.get("/auth/profile");
  return res.data;
};

export const registerUser = async (data) => {
  const res = await axios.post("/auth/register", data);
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axios.put("/user/profile", data);
  // Update local storage too if it was successful
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const updatedUser = { ...storedUser, ...res.data };
  localStorage.setItem("user", JSON.stringify(updatedUser));
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await axios.post("/auth/forgot-password", { email });
  return res.data;
};

export const verifyResetToken = async (token) => {
  const res = await axios.post("/auth/verify-token", { token });
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await axios.post("/auth/reset-password", data);
  return res.data;
};