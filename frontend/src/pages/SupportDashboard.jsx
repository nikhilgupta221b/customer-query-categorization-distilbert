// src/pages/SupportDashboard.jsx
import { useEffect, useState, useRef } from "react";
import TicketList from "../components/TicketList";
import api from "../api/api";
import { useAlert } from "../components/AlertComponent";

export default function SupportDashboard() {
  const [queue, setQueue] = useState("");
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { showAlert } = useAlert();
  const hasShownError = useRef(false);    // ✅ Prevent multiple alerts

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoading(true);
      try {
        const res = await api.get("/support/dropdown-options");
        const availableQueues = res.data.queues || [];

        if (availableQueues.length === 0) {
          setError("No queues available.");
          setQueues([]);
          setQueue("");
        } else {
          setQueues(availableQueues);
          setQueue(availableQueues[0]);
          setError("");
        }
      } catch (err) {
        console.error("Error fetching dropdown options:", err);
        setError("Failed to load queues.");
        if (!hasShownError.current) {
          showAlert("Failed to load queues", "danger");
          hasShownError.current = true;
        }
        setQueues([]);
        setQueue("");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdowns();
  }, []);   // ✅ DO NOT include showAlert here

  const formatQueueName = (queueValue) => {
    return queueValue
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleRefresh = () => {
    hasShownError.current = false;    // ✅ Reset error alert guard
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
        <p className="mt-2 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error && queues.length === 0) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-6 text-primary">Support Dashboard</h1>
        <button 
          className="btn btn-outline-primary"
          onClick={handleRefresh}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh All
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-3">
              <label className="form-label fw-bold">Select Queue:</label>
            </div>
            <div className="col-md-9">
              {queues.length > 0 ? (
                <select
                  className="form-select form-select-lg"
                  value={queue}
                  onChange={(e) => setQueue(e.target.value)}
                >
                  {queues.map((q) => (
                    <option key={q} value={q}>
                      {formatQueueName(q)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="alert alert-warning mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  No queues to display.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {queue && (
        <TicketList 
          queue={queue} 
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
}
