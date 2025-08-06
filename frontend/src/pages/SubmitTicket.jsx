import TicketForm from "../components/TicketForm";

export default function SubmitTicket() {
  return (
    <div className="page">
      <h1>Submit a Support Ticket</h1>
      <p>Please describe your issue and submit it. Our team will route it to the appropriate queue.</p>
      <TicketForm />
    </div>
  );
}
