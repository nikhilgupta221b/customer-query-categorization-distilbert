import { useState, useEffect } from "react";
import api from "../api/api";
import { useAlert } from "./AlertComponent";

export default function TicketCard({ ticket, onUpdate }) {
  const [queue, setQueue] = useState(ticket.queue);
  const [saving, setSaving] = useState(false);
  const [queues, setQueues] = useState([]);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const res = await api.get("/support/dropdown-options");
        setQueues(res.data.queues || []);
      } catch (err) {
        console.error("Error fetching queue options:", err);
        showAlert("Error fetching queue options", "danger");
      }
    };
    fetchQueues();
  }, [showAlert]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/support/tickets/${ticket.id}/queue`, {
        queue: queue,
      });
      showAlert("Queue updated successfully!", "success");
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error updating queue:", err);
      showAlert("Error updating queue", "danger");
    } finally {
      setSaving(false);
    }
  };

  const formatQueueName = (queueValue) => {
    return queueValue
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-primary">{ticket.subject}</h5>
        <p className="card-text text-muted">{ticket.body}</p>
        
        <div className="row align-items-end">
          <div className="col-md-8">
            <label className="form-label fw-bold">Queue:</label>
            <select 
              className="form-select"
              value={queue} 
              onChange={(e) => setQueue(e.target.value)}
              disabled={saving}
            >
              {queues.map((opt) => (
                <option key={opt} value={opt}>
                  {formatQueueName(opt)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <button 
              className={`btn ${saving ? 'btn-secondary' : 'btn-primary'} w-100`}
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}