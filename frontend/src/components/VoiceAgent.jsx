import { useState, useRef, useEffect } from "react";

// Booking Form Component
function BookingForm({ onBack }) {
  const [formData, setFormData] = useState({
    guests: "",
    date: "",
    time: "",
    cuisine: "",
    special: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    if (!formData.guests || !formData.date || !formData.time || !formData.cuisine) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Manual Booking User",
          numberOfGuests: parseInt(formData.guests),
          bookingDate: formData.date,
          bookingTime: formData.time,
          cuisinePreference: formData.cuisine,
          specialRequests: formData.special || "None",
          location: "Default Location"
        }),
      });
      
      if (!response.ok) throw new Error("Failed to save");
      setSaved(true);
    } catch (e) {
      console.error("Save error:", e);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (saved) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Booking Confirmed!</h2>
            <p style={styles.successText}>Your reservation has been saved.</p>
            <button onClick={onBack} style={styles.button}>
              Make Another Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>📝 Manual Booking Form</h2>
          <p style={styles.subtitle}>Fill in your reservation details</p>
        </div>

        <div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Number of Guests *</label>
            <input
              type="number"
              name="guests"
              min="1"
              max="20"
              value={formData.guests}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., 4"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Time *</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Cuisine Preference *</label>
            <select
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select cuisine</option>
              <option value="Italian">Italian</option>
              <option value="Chinese">Chinese</option>
              <option value="Indian">Indian</option>
              <option value="Japanese">Japanese</option>
              <option value="Mexican">Mexican</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="American">American</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Special Requests</label>
            <textarea
              name="special"
              value={formData.special}
              onChange={handleChange}
              style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
              placeholder="Birthday celebration, dietary restrictions, etc."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              ...styles.button,
              backgroundColor: saving ? "#9ca3af" : "#667eea",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Confirm Booking"}
          </button>

          <button
            onClick={onBack}
            style={styles.secondaryButton}
          >
            ← Back to Voice Booking
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Voice Agent Component
export default function VoiceAgent() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [agentResponse, setAgentResponse] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [step, setStep] = useState("idle");
  const [booking, setBooking] = useState({
    guests: null,
    date: "",
    time: "",
    cuisine: "",
    special: "",
  });

  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, []);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (utteranceRef.current) {
      utteranceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.log("Recognition already stopped");
      }
      recognitionRef.current = null;
    }
    isProcessingRef.current = false;
  };

  const speak = (text) => {
    return new Promise((resolve) => {
      setAgentResponse(text);
      
      if (!window.speechSynthesis) {
        console.warn("Speech synthesis not supported");
        resolve();
        return;
      }
      
      stopSpeaking();
      
      setTimeout(() => {
        setIsSpeaking(true);
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-US";
        utter.rate = 0.95;
        utter.pitch = 1.0;
        utter.volume = 1.0;
        
        utter.onend = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
          resolve();
        };
        
        utter.onerror = (e) => {
          console.error("Speech error:", e);
          setIsSpeaking(false);
          utteranceRef.current = null;
          resolve();
        };
        
        utteranceRef.current = utter;
        window.speechSynthesis.speak(utter);
      }, 200);
    });
  };

  const startListening = () => {
    if (isListening || isProcessingRef.current || isSpeaking) {
      console.log("Cannot start listening - already active or speaking");
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setError("Voice input only works on HTTPS or localhost.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition not supported. Please use Chrome, Edge, or Safari.");
      return;
    }

    setError(null);
    setTranscript("");
    isProcessingRef.current = true;

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";
    recog.maxAlternatives = 1;

    recog.onstart = () => {
      setIsListening(true);
      console.log("Started listening");
    };

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript.trim();
      console.log("Heard:", text);
      setTranscript(text);
      setIsListening(false);
      
      // Process the response
      processUserInput(text.toLowerCase());
    };

recog.onerror = (event) => {
  console.error("Recognition error:", event.error);
  setIsListening(false);
  isProcessingRef.current = false;
  
  let errorMessage = "Voice input failed. Please try again.";
  
  switch (event.error) {
    case "no-speech":
      errorMessage = "I didn't hear anything. Please speak clearly into your microphone.";
      break;
    case "not-allowed":
      errorMessage = "Microphone access was denied. Please allow mic access in your browser settings.";
      break;
    case "network":
      errorMessage = "Microphone or audio error. Check that your mic is connected, not muted, and not in use by another app.";
      break;
    case "audio-capture":
      errorMessage = "Can't access microphone. Ensure no other app (Zoom, Teams) is using it.";
      break;
    case "service-not-allowed":
      errorMessage = "Voice recognition requires a secure connection. Please use this on localhost or HTTPS.";
      break;
    case "aborted":
      // Silent — normal behavior
      return;
    default:
      errorMessage = `Voice error: ${event.error}. Please try again.`;
  }
  
  setError(errorMessage);
};

    recog.onend = () => {
      setIsListening(false);
      isProcessingRef.current = false;
      console.log("Stopped listening");
    };

    try {
      recog.start();
      recognitionRef.current = recog;
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setError("Failed to start voice input. Please try again.");
      isProcessingRef.current = false;
    }
  };

  const parseDate = (text) => {
    const today = new Date();
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("today")) {
      return today.toISOString().split('T')[0];
    }
    if (lowerText.includes("tomorrow")) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    
    const months = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
    };
    
    for (const [monthName, monthIndex] of Object.entries(months)) {
      if (lowerText.includes(monthName)) {
        const dayMatch = text.match(/\d+/);
        if (dayMatch) {
          const day = parseInt(dayMatch[0]);
          const date = new Date(today.getFullYear(), monthIndex, day);
          if (date < today) {
            date.setFullYear(date.getFullYear() + 1);
          }
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    return text;
  };

  const parseTime = (text) => {
    const lowerText = text.toLowerCase();
    const timeMatch = lowerText.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] || "00";
      const meridiem = timeMatch[3];
      
      if (meridiem === "pm" && hours < 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;
      if (!meridiem && hours >= 1 && hours <= 11) hours += 12; // Assume PM for dinner times
      
      if (hours > 23) hours = 23;
      if (hours < 0) hours = 0;
      
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
    
    return text;
  };

// Helper: Check if string is YYYY-MM-DD
const isValidISODate = (str) => /^\d{4}-\d{2}-\d{2}$/.test(str);
// Helper: Check if string is HH:MM (24-hour)
const isValidTime = (str) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(str);

  const processUserInput = async (text) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setTranscript("");

    try {
      switch (step) {
        case "idle":
          await speak("Hello! I'm your voice booking agent. How many guests will be joining you today?");
          setStep("guests");
          break;

        case "guests":
          const guestMatch = text.match(/\d+/);
          const guests = guestMatch ? parseInt(guestMatch[0], 10) : NaN;
          if (isNaN(guests) || guests < 1 || guests > 20) {
            await speak("Sorry, I need a number between 1 and 20. How many guests?");
          } else {
            setBooking((b) => ({ ...b, guests }));
            await speak(`Perfect! ${guests} ${guests === 1 ? 'guest' : 'guests'}. What date would you like? You can say today, tomorrow, or a specific date.`);
            setStep("date");
          }
          break;

        case "date":
          const parsedDate = parseDate(text);
          if (!isValidISODate(parsedDate)) {
            await speak("I didn’t understand the date. Please say today, tomorrow, or a month and day like 'June 5'.");
            // Stay on same step — don't advance
          } else {
            setBooking((b) => ({ ...b, date: parsedDate }));
            await speak("Great! What time would you prefer? For example, 7 PM.");
            setStep("time");
          }
          break;

        case "time":
          const parsedTime = parseTime(text);
          if (!isValidTime(parsedTime)) {
            await speak("I didn’t understand the time. Please say something like '7 PM' or '19:00'.");
            // Stay on same step
          } else {
            setBooking((b) => ({ ...b, time: parsedTime }));
            await speak("Excellent. What type of cuisine? We have Italian, Chinese, Indian, Japanese, Mexican, and more.");
            setStep("cuisine");
          }
          break;

        case "cuisine":
          setBooking((b) => ({ ...b, cuisine: text }));
          await speak("Great choice! Any special requests like birthday celebration or dietary needs? Say none if not.");
          setStep("special");
          break;

        case "special":
          const specialRequest = /none|no|not/i.test(text) ? "None" : text;
          setBooking((b) => ({ ...b, special: specialRequest }));
          await speak("Perfect! Say yes to confirm your booking, or no to cancel.");
          setStep("confirm");
          break;

        case "confirm":
          if (text.includes("yes") || text.includes("confirm")) {
            const savedSuccessfully = await saveBookingToDB();
            if (savedSuccessfully) {
              await speak("Wonderful! Your booking is confirmed. Thank you!");
              setStep("done");
            } else {
              await speak("Sorry, I couldn't save your reservation. Please try the manual booking form.");
              setStep("idle");
            }
          } else {
            await speak("No problem. Booking cancelled. Say start over to make a new booking.");
            setStep("cancelled");
          }
          break;

        case "cancelled":
          if (text.includes("start") || text.includes("again") || text.includes("over") || text.includes("new")) {
            resetBooking();
            await speak("Let's start fresh! How many guests?");
            setStep("guests");
          } else {
            await speak("Just say start over when you're ready to book.");
          }
          break;

        case "done":
          if (text.includes("start") || text.includes("new") || text.includes("another")) {
            resetBooking();
            await speak("Great! Let's make a new booking. How many guests?");
            setStep("guests");
          } else {
            await speak("Your booking is complete. Say new booking to make another reservation.");
          }
          break;

        default:
          await speak("Let's start over. How many guests will be joining?");
          setStep("guests");
          break;
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  const saveBookingToDB = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Voice Booking User",
          numberOfGuests: booking.guests,
          bookingDate: booking.date,
          bookingTime: booking.time,
          cuisinePreference: booking.cuisine,
          specialRequests: booking.special || "None",
          location: "Default Location"
        }),
      });
      return response.ok; // ✅ returns true/false
    } catch (e) {
      console.warn("Could not save to backend:", e.message);
      return false;
    }
  };

  const resetBooking = () => {
    setBooking({
      guests: null,
      date: "",
      time: "",
      cuisine: "",
      special: "",
    });
    setTranscript("");
    setError(null);
  };

  const handleStartConversation = async () => {
    if (step === "idle") {
      await speak("Hello! I'm your voice booking agent. How many guests will be joining you today?");
      setStep("guests");
    }
  };

  if (showBookingForm) {
    return <BookingForm onBack={() => setShowBookingForm(false)} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>🎤 Voice Booking Agent</h2>
          <p style={styles.subtitle}>
            {step === "idle" ? "Click Start to begin your reservation" : "Click the microphone to speak"}
          </p>
        </div>

        {agentResponse && (
          <div style={styles.responseBox}>
            <div style={styles.responseHeader}>
              <span style={styles.agentLabel}>🤖 Agent</span>
              {isSpeaking && <span style={styles.speakingIndicator}>Speaking...</span>}
            </div>
            <p style={styles.responseText}>{agentResponse}</p>
          </div>
        )}

        {step === "idle" ? (
          <button
            onClick={handleStartConversation}
            style={styles.button}
            disabled={isSpeaking}
          >
            🎙️ Start Voice Booking
          </button>
        ) : (
          <button
            onClick={startListening}
            disabled={isListening || isSpeaking}
            style={{
              ...styles.button,
              backgroundColor: isListening ? "#f59e0b" : isSpeaking ? "#9ca3af" : "#667eea",
              cursor: (isListening || isSpeaking) ? "not-allowed" : "pointer",
            }}
          >
            {isListening ? "🎙️ Listening..." : isSpeaking ? "🔊 Agent Speaking..." : "🎤 Tap to Speak"}
          </button>
        )}

        <button
          onClick={() => setShowBookingForm(true)}
          style={styles.secondaryButton}
        >
          📝 Use Manual Form Instead
        </button>

        {step === "done" && (
          <button
            onClick={async () => {
              resetBooking();
              await speak("Let's make a new booking! How many guests?");
              setStep("guests");
            }}
            style={{ ...styles.secondaryButton, marginTop: "12px", backgroundColor: "#10b981" }}
          >
            🔄 New Booking
          </button>
        )}

        {transcript && (
          <div style={styles.transcriptBox}>
            <p style={styles.transcriptLabel}>You said:</p>
            <p style={styles.transcriptText}>"{transcript}"</p>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>❌ {error}</p>
          </div>
        )}

        {booking.guests && (
          <div style={styles.bookingSummary}>
            <h3 style={styles.summaryTitle}>
              📋 {step === "done" ? "Confirmed Booking" : "Booking in Progress"}
            </h3>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>👥 Guests:</span>
                <span style={styles.summaryValue}>{booking.guests}</span>
              </div>
              {booking.date && (
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>📅 Date:</span>
                  <span style={styles.summaryValue}>{booking.date}</span>
                </div>
              )}
              {booking.time && (
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>🕐 Time:</span>
                  <span style={styles.summaryValue}>{booking.time}</span>
                </div>
              )}
              {booking.cuisine && (
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>🍽️ Cuisine:</span>
                  <span style={styles.summaryValue}>{booking.cuisine}</span>
                </div>
              )}
              {booking.special && booking.special !== "None" && (
                <div style={{ ...styles.summaryItem, gridColumn: "1 / -1" }}>
                  <span style={styles.summaryLabel}>📝 Special:</span>
                  <span style={styles.summaryValue}>{booking.special}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={styles.helpText}>
          <p style={styles.helpTitle}>💡 How it works:</p>
          <ul style={styles.helpList}>
            <li>Wait for the agent to finish speaking before you respond</li>
            <li>Click the microphone button and speak your answer</li>
            <li>The agent will automatically respond after hearing you</li>
            <li>Be in a quiet environment for best results</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    padding: "40px",
    boxSizing: "border-box",
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
  responseBox: {
    backgroundColor: "#f3f4f6",
    borderLeft: "4px solid #667eea",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  responseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  agentLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#667eea",
    textTransform: "uppercase",
  },
  speakingIndicator: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#10b981",
    animation: "pulse 1.5s infinite",
  },
  responseText: {
    fontSize: "16px",
    color: "#1f2937",
    margin: "0",
    fontWeight: "500",
    lineHeight: "1.5",
  },
  button: {
    width: "100%",
    padding: "16px 20px",
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
  secondaryButton: {
    width: "100%",
    padding: "14px 20px",
    marginTop: "12px",
    backgroundColor: "#764ba2",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  transcriptBox: {
    backgroundColor: "#eff6ff",
    border: "2px solid #bfdbfe",
    padding: "16px",
    borderRadius: "12px",
    marginTop: "20px",
  },
  transcriptLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#1e40af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 8px 0",
  },
  transcriptText: {
    fontSize: "16px",
    color: "#1f2937",
    margin: "0",
    fontStyle: "italic",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "2px solid #fecaca",
    padding: "16px",
    borderRadius: "12px",
    marginTop: "20px",
  },
  errorText: {
    fontSize: "14px",
    color: "#991b1b",
    margin: "0",
    fontWeight: "600",
  },
  bookingSummary: {
    backgroundColor: "#f0fdf4",
    border: "2px solid #bbf7d0",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
  },
  summaryTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#15803d",
    marginTop: "0",
    marginBottom: "16px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  summaryLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#15803d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  summaryValue: {
    fontSize: "14px",
    color: "#1f2937",
    fontWeight: "600",
  },
  helpText: {
    marginTop: "24px",
    padding: "16px",
    backgroundColor: "#fef3c7",
    borderRadius: "8px",
    border: "2px solid #fcd34d",
  },
  helpTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#78350f",
    margin: "0 0 8px 0",
  },
  helpList: {
    margin: "0",
    paddingLeft: "20px",
    fontSize: "13px",
    color: "#78350f",
    lineHeight: "1.6",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    outline: "none",
    fontFamily: "inherit",
  },
  successBox: {
    textAlign: "center",
    padding: "40px 20px",
  },
  successIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    color: "white",
    fontSize: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "12px",
  },
  successText: {
    fontSize: "16px",
    color: "#6b7280",
    marginBottom: "32px",
  },
};