import axios from "axios";

const API_URL = "http://localhost:5000/api/bookings";

export const createBooking = async (data) => {
  console.log("📤 Frontend sending booking:", data);

  const res = await axios.post(API_URL, data);
  console.log("📥 Backend POST response:", res.data);

  return res.data;
};

export const getAllBookings = async () => {
  console.log("📤 Fetching all bookings…");

  const res = await axios.get(API_URL);
  console.log("📥 Backend GET response:", res.data);

  return res.data;
};

export const getBookingById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const deleteBooking = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
