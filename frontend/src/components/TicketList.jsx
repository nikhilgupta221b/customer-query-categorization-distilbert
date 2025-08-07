// src/components/TicketList.jsx
import React, { useEffect, useState } from "react";
import TicketCard from "./TicketCard";
import api from "../api/api";

export default function TicketList({ queue, refreshTrigger }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    if (!queue) {
      setTickets([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/support/tickets?queue=${queue}`);
      const data = Array.isArray(res.data) ? res.data : [];

      // ✅ Remove duplicates by ticket.id
      const uniqueTickets = Array.from(
        new Map(data.map(ticket => [ticket.id, ticket])).values()
      );

      setTickets(uniqueTickets);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [queue, refreshTrigger]);

  const handleTicketUpdate = () => {
    fetchTickets();   // Refresh when a ticket is updated
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading tickets...</span>
        </div>
        <p className="mt-2 text-muted">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <i className="bi bi-inbox" style={{ fontSize: "3rem" }}></i>
          <h4 className="mt-3">No tickets found</h4>
          <p>No tickets found for this queue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-list">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-muted">
          Found {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
        </h5>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={fetchTickets}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {tickets.map((ticket) => (
        <TicketCard 
          key={ticket.id} 
          ticket={ticket} 
          onUpdate={handleTicketUpdate}
        />
      ))}
    </div>
  );
}
