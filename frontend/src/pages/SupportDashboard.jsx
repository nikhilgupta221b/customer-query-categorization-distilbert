import { useEffect, useState } from "react";
import TicketList from "../components/TicketList";
import api from "../api/api";

export default function SupportDashboard() {
  const [queue, setQueue] = useState("");
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setQueue(availableQueues[0]); // Set the first queue as the default selection
          setError("");
        }
      } catch (err) {
        console.error("Error fetching dropdown options:", err);
        setError("Failed to load queues.");
        setQueues([]);
        setQueue("");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdowns();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="page">
      <h1>Support Dashboard</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>Select Queue:</label>
        {queues.length > 0 ? (
          <select
            value={queue}
            onChange={(e) => setQueue(e.target.value)}
            style={{ marginLeft: "0.5rem", padding: "6px" }}
          >
            {queues.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        ) : (
          <p>No queues to display.</p>
        )}
      </div>

      {queue && <TicketList queue={queue} />}
    </div>
  );
}