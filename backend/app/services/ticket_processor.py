import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models import database
from app.schemas.ticket import ProcessingStatusEnum, TicketQueueEnum as TicketQueue
from app.services.model_service import model_service

PROCESS_INTERVAL_SECONDS = 10

class TicketProcessor:
    def __init__(self):
        self.running = False
        self.task = None

    async def start_processing(self):
        self.running = True
        while self.running:
            await self.process_pending_tickets()
            await asyncio.sleep(PROCESS_INTERVAL_SECONDS)

    def stop_processing(self):
        self.running = False
        if self.task:
            self.task.cancel()

    async def process_pending_tickets(self):
        db: Session = next(get_db())
        try:
            # Get pending tickets (with lock)
            tickets = (
                db.query(database.Ticket)
                .filter(database.Ticket.processing_status == ProcessingStatusEnum.PENDING)
                .limit(10)
                .with_for_update()
                .all()
            )

            for ticket in tickets:
                print(f"Processing ticket {ticket.id}")
                ticket.processing_status = ProcessingStatusEnum.PROCESSING
                ticket.updated_at = datetime.utcnow()
                db.commit()

                try:
                    prediction = model_service.predict(ticket.subject, ticket.body)
                    raw_label = prediction["queue"]
                    normalized_label = raw_label.strip().lower().replace(" ", "_")

                    # Explicit mapping from model output → Enum
                    QUEUE_MAPPING = {
                        "technical_support": TicketQueue.TECHNICAL_SUPPORT,
                        "product_support": TicketQueue.PRODUCT_SUPPORT,
                        "customer_service": TicketQueue.CUSTOMER_SERVICE,
                        "billing_support": TicketQueue.BILLING_SUPPORT,
                        "sales_and_hr": TicketQueue.SALES_AND_HR,
                        "sales_&_hr": TicketQueue.SALES_AND_HR,  # alias
                        "saleshr": TicketQueue.SALES_AND_HR,     # optional alias
                    }

                    if normalized_label not in QUEUE_MAPPING:
                        raise ValueError(f"'{normalized_label}' is not a valid TicketQueue")

                    mapped_queue = QUEUE_MAPPING[normalized_label]

                    processed = database.ProcessedTicket(
                        original_ticket_id=ticket.id,
                        subject=ticket.subject,
                        body=ticket.body,
                        queue=mapped_queue,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    ticket.processing_status = ProcessingStatusEnum.COMPLETED
                    ticket.updated_at = datetime.utcnow()
                    db.add(processed)
                    db.commit()

                except Exception as e:
                    print(f"Error processing ticket {ticket.id}: {e}")
                    ticket.processing_status = ProcessingStatusEnum.FAILED
                    ticket.updated_at = datetime.utcnow()
                    db.commit()
        except Exception as e:
            print(f"Failed to fetch/process tickets: {e}")
            db.rollback()
        finally:
            db.close()

    @property
    def is_running(self):
        return self.running


ticket_processor = TicketProcessor()
