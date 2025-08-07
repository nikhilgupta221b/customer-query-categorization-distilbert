import { useState } from "react";
import api from "../api/api";
import { useAlert } from "./AlertComponent";

export default function TicketForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/tickets/", { subject, body });
      showAlert("Ticket submitted successfully!", "success");
      setSubject("");
      setBody("");
    } catch (err) {
      console.error("Error submitting ticket:", err);
      showAlert("Error submitting ticket. Please try again.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card shadow">
      <div className="card-body">
        <h3 className="card-title text-primary mb-4">Submit a Ticket</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="subject" className="form-label">Subject</label>
            <input
              type="text"
              className="form-control"
              id="subject"
              placeholder="Enter ticket subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="body" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="body"
              rows="5"
              placeholder="Describe your issue in detail"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn ${isLoading ? 'btn-secondary' : 'btn-primary'} btn-lg w-100`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              "Submit Ticket"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}