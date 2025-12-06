import { useEffect, useState } from "react";
import { getAllBookings, deleteBooking } from "../api/bookings";

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings", err);
      alert("⚠️ Could not load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setDeletingId(id);
    try {
      await deleteBooking(id);
      await load(); // refresh list
    } catch (err) {
      console.error("Delete failed", err);
      alert("❌ Failed to delete booking.");
    } finally {
      setDeletingId(null);
    }
  };

  // Format date for better readability
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>All Bookings</h2>
        {loading && <p style={styles.loading}>Loading...</p>}
      </div>

      {bookings.length === 0 && !loading ? (
        <p style={styles.emptyState}>No bookings found.</p>
      ) : (
        <div style={styles.list}>
          {bookings.map((b) => (
            <div key={b._id} style={styles.card}>
              <div>
                <p style={styles.field}>
                  <strong>Name:</strong> {b.customerName || "—"}
                </p>
                <p style={styles.field}>
                  <strong>Cuisine:</strong> {b.cuisinePreference || "—"}
                </p>
                <p style={styles.field}>
                  <strong>Date:</strong> {formatDate(b.bookingDate)}
                </p>
                {b.specialRequests && (
                  <p style={styles.field}>
                    <strong>Requests:</strong> {b.specialRequests}
                  </p>
                )}
                <p style={styles.field}>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color:
                        b.status === "confirmed"
                          ? "#10B981"
                          : b.status === "cancelled"
                          ? "#EF4444"
                          : "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    {b.status?.charAt(0).toUpperCase() + b.status?.slice(1) || "Pending"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleDelete(b._id)}
                disabled={deletingId === b._id}
                style={{
                  ...styles.deleteButton,
                  opacity: deletingId === b._id ? 0.7 : 1,
                  cursor: deletingId === b._id ? "not-allowed" : "pointer",
                }}
              >
                {deletingId === b._id ? "Deleting..." : "Cancel Booking"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Inline Styles ---
const styles = {
  container: {
    maxWidth: "700px",
    margin: "30px auto",
    padding: "0 16px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
  },
  loading: {
    color: "#6B7280",
    fontStyle: "italic",
  },
  emptyState: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: "16px",
    padding: "40px 0",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "18px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    transition: "box-shadow 0.2s",
  },
  field: {
    margin: "4px 0",
    fontSize: "15px",
    color: "#374151",
  },
  deleteButton: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};