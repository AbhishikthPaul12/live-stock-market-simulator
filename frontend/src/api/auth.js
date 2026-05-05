import axios from "./axios.js";

export const loginUser = async (data) => {
  const res = await axios.post("/auth/login", data);

  // STORE USER
  localStorage.setItem("user", JSON.stringify(res.data));

  return res.data;
};

export const registerUser = async (data) => {
  const res = await axios.post("/auth/register", data);
  return res.data;
};