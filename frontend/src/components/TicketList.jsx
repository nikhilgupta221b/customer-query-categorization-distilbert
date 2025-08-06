import React, { useEffect, useState } from "react";
import TicketCard from "./TicketCard";
import api from "../api/api";

export default function TicketList({ queue }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only fetch tickets if a queue is provided and is not an empty string.
    if (!queue) {
      setTickets([]);
      setLoading(false);
      setError("");
      return; // Exit the effect early
    }

    const fetchTickets = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/support/tickets?queue=${queue}`);
        // Fix: API returns array directly, not wrapped in tickets property
        setTickets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load tickets.");
        setTickets([]); // Set tickets to an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [queue]); // The effect re-runs whenever the 'queue' prop changes

  if (loading) {
    return <p>Loading tickets...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Check if tickets is an empty array before mapping
  if (tickets.length === 0) {
    return <p>No tickets found for this queue.</p>;
  }

  return (
    <div className="ticket-list">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}