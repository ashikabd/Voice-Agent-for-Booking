import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import VoiceAgent from "./components/VoiceAgent";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VoiceAgent />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}