import { useState, useEffect } from "react";
import api from "../api/api";

export default function TicketCard({ ticket, onUpdate }) {
  const [queue, setQueue] = useState(ticket.queue);
  const [saving, setSaving] = useState(false);
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const res = await api.get("/support/dropdown-options");
        setQueues(res.data.queues || []);
      } catch (err) {
        console.error("Error fetching queue options:", err);
      }
    };
    fetchQueues();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/support/tickets/${ticket.id}/queue`, {
        queue: queue,
      });
      alert("Queue updated successfully");
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error updating queue:", err);
      alert("Error updating queue");
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
    <div className="ticket-card" style={{ 
      border: '1px solid #ccc', 
      padding: '1rem', 
      margin: '1rem 0', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ marginTop: 0 }}>{ticket.subject}</h3>
      <p style={{ marginBottom: '1rem' }}>{ticket.body}</p>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          <strong>Queue:</strong>
        </label>
        <select 
          value={queue} 
          onChange={(e) => setQueue(e.target.value)}
          style={{ padding: '6px', marginRight: '1rem', width: '200px' }}
        >
          {queues.map((opt) => (
            <option key={opt} value={opt}>
              {formatQueueName(opt)}
            </option>
          ))}
        </select>
      </div>

      <button 
        onClick={handleSave} 
        disabled={saving}
        style={{
          padding: '8px 16px',
          backgroundColor: saving ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: saving ? 'not-allowed' : 'pointer'
        }}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
