import { useState } from "react";

export default function BookingForm({ onBack }) {
  const [form, setForm] = useState({
    customerName: "",
    numberOfGuests: "",
    bookingDate: "",
    bookingTime: "",
    cuisinePreference: "",
    specialRequests: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error on new input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate (just in case)
    if (!form.customerName || !form.numberOfGuests || !form.bookingDate || !form.bookingTime) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    // ✅ Prepare payload matching your backend schema
    const payload = {
      customerName: form.customerName,
      numberOfGuests: parseInt(form.numberOfGuests, 10),
      bookingDate: form.bookingDate, // format: "YYYY-MM-DD"
      bookingTime: form.bookingTime, // format: "HH:mm"
      cuisinePreference: form.cuisinePreference || "",
      specialRequests: form.specialRequests || "",
      location: "Chennai", // 🔸 Required by your backend (for weather)
    };

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save booking");
      }

      alert("✅ Booking confirmed!");
      setForm({
        customerName: "",
        numberOfGuests: "",
        bookingDate: "",
        bookingTime: "",
        cuisinePreference: "",
        specialRequests: "",
      });
      onBack();
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Failed to create booking. Please try again.");
      alert("❌ " + (err.message || "Failed to create booking."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={formStyles.overlay}>
      <div style={formStyles.modal}>
        <button onClick={onBack} style={formStyles.backButton}>
          ← Back to Voice Agent
        </button>
        <div style={formStyles.card}>
          <div style={formStyles.header}>
            <h2 style={formStyles.title}>🍽️ Book a Table</h2>
            <p style={formStyles.subtitle}>Reserve your perfect dining experience</p>
          </div>
          <div style={formStyles.form}>
            {error && (
              <div style={formStyles.errorBox}>
                <p style={formStyles.errorText}>❌ {error}</p>
              </div>
            )}
            <div style={formStyles.row}>
              <div style={{ ...formStyles.inputGroup, flex: 1 }}>
                <label style={formStyles.label}>Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  required
                  style={formStyles.input}
                  placeholder="Ashik Rahman"
                />
              </div>
              <div style={{ ...formStyles.inputGroup, flex: 1 }}>
                <label style={formStyles.label}>Number of Guests *</label>
                <input
                  type="number"
                  name="numberOfGuests"
                  min="1"
                  max="20"
                  value={form.numberOfGuests}
                  onChange={handleChange}
                  required
                  style={formStyles.input}
                  placeholder="2"
                />
              </div>
            </div>

            <div style={formStyles.row}>
              <div style={{ ...formStyles.inputGroup, flex: 1 }}>
                <label style={formStyles.label}>📅 Date *</label>
                <input
                  type="date"
                  name="bookingDate"
                  value={form.bookingDate}
                  onChange={handleChange}
                  required
                  style={formStyles.input}
                />
              </div>
              <div style={{ ...formStyles.inputGroup, flex: 1 }}>
                <label style={formStyles.label}>🕐 Time *</label>
                <input
                  type="time"
                  name="bookingTime"
                  value={form.bookingTime}
                  onChange={handleChange}
                  required
                  style={formStyles.input}
                />
              </div>
            </div>

            <div style={formStyles.inputGroup}>
              <label style={formStyles.label}>🌍 Cuisine Preference</label>
              <select
                name="cuisinePreference"
                value={form.cuisinePreference}
                onChange={handleChange}
                style={formStyles.select}
              >
                <option value="">— Select —</option>
                <option value="Italian">🇮🇹 Italian</option>
                <option value="Chinese">🇨🇳 Chinese</option>
                <option value="Indian">🇮🇳 Indian</option>
                <option value="Mexican">🇲🇽 Mexican</option>
                <option value="Japanese">🇯🇵 Japanese</option>
                <option value="Mediterranean">🫒 Mediterranean</option>
              </select>
            </div>

            <div style={formStyles.inputGroup}>
              <label style={formStyles.label}>💬 Special Requests</label>
              <textarea
                name="specialRequests"
                value={form.specialRequests}
                onChange={handleChange}
                rows="3"
                style={{ ...formStyles.input, minHeight: "80px", resize: "vertical" }}
                placeholder="e.g., Birthday celebration, vegan options, quiet corner..."
              />
            </div>

            <button onClick={handleSubmit} style={formStyles.button} disabled={isLoading}>
              {isLoading ? "⏳ Processing..." : "✓ Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles for BookingForm only
const formStyles = {
  overlay: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: "9999",
  },
  modal: {
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    padding: "40px",
    boxSizing: "border-box",
  },
  backButton: {
    marginBottom: "15px",
    padding: "10px 16px",
    backgroundColor: "rgba(255,255,255,0.9)",
    color: "#667eea",
    border: "2px solid #667eea",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  header: {
    marginBottom: "30px",
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  row: {
    display: "flex",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    backgroundColor: "#fff",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  select: {
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "16px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "15px",
    padding: "14px 20px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  // ✅ New error styles (matching VoiceAgent)
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "2px solid #fecaca",
    padding: "12px 16px",
    borderRadius: "12px",
  },
  errorText: {
    fontSize: "14px",
    color: "#991b1b",
    margin: "0",
    fontWeight: "600",
  },
};