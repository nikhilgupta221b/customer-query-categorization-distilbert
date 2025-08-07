import TicketForm from "../components/TicketForm";

export default function SubmitTicket() {
  return (
    <div className="row justify-content-center">
      <div className="col-lg-8 col-xl-6">
        <div className="text-center mb-4">
          <h1 className="display-6 text-primary">Submit a Support Ticket</h1>
          <p className="lead text-muted">
            Please describe your issue and submit it. Our team will route it to the appropriate queue.
          </p>
        </div>
        <TicketForm />
      </div>
    </div>
  );
}