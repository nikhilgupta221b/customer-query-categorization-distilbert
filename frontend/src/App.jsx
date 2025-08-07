import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SubmitTicket from "./pages/SubmitTicket";
import SupportDashboard from "./pages/SupportDashboard";
import { AlertProvider } from "./components/AlertComponent";

function App() {
  return (
    <AlertProvider>
      <Router>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">
              <i className="bi bi-headset me-2"></i>
              Support System
            </Link>
            <div className="navbar-nav ms-auto">
              <Link className="nav-link" to="/">
                <i className="bi bi-plus-circle me-1"></i>
                Submit Ticket
              </Link>
              <Link className="nav-link" to="/dashboard">
                <i className="bi bi-kanban me-1"></i>
                Support Dashboard
              </Link>
            </div>
          </div>
        </nav>
        
        <div className="container">
          <Routes>
            <Route path="/" element={<SubmitTicket />} />
            <Route path="/dashboard" element={<SupportDashboard />} />
          </Routes>
        </div>
      </Router>
    </AlertProvider>
  );
}

export default App;