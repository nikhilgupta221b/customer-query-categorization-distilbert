import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SubmitTicket from "./pages/SubmitTicket";
import SupportDashboard from "./pages/SupportDashboard";
import "./styles/app.css";

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Submit Ticket</Link> |{" "}
        <Link to="/dashboard">Support Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<SubmitTicket />} />
        <Route path="/dashboard" element={<SupportDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
