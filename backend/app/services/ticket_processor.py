import asyncio
import logging
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.connection import SessionLocal
from app.models.database import Ticket, ProcessedTicket, ProcessingStatus, TicketQueue
from app.services.model_service import model_service

logger = logging.getLogger(__name__)

class TicketProcessor:
    def __init__(self):
        self.is_running = False
        self.processing_interval = 10

    async def start_processing(self):
        self.is_running = True
        logger.info("Starting ticket processor...")

        while self.is_running:
            try:
                await self.process_pending_tickets()
                await asyncio.sleep(self.processing_interval)
            except Exception as e:
                logger.error(f"Error in ticket processor loop: {e}")
                await asyncio.sleep(self.processing_interval)

    def stop_processing(self):
        self.is_running = False
        logger.info("Stopping ticket processor...")

    async def process_pending_tickets(self):
        db = SessionLocal()
        try:
            pending_tickets = db.query(Ticket).filter(
                Ticket.processing_status == ProcessingStatus.PENDING
            ).with_for_update().limit(10).all()

            for ticket in pending_tickets:
                ticket.processing_status = ProcessingStatus.PROCESSING
                ticket.updated_at = datetime.utcnow()
                db.commit()
                await self.process_single_ticket(ticket, db)
        except Exception as e:
            logger.error(f"Error in process_pending_tickets: {e}")
        finally:
            db.close()

    async def process_single_ticket(self, ticket: Ticket, db: Session):
        try:
            if not model_service.is_model_ready():
                logger.warning("Model not ready. Skipping processing.")
                return

            prediction = model_service.predict(ticket.subject, ticket.body)
            queue = TicketQueue(prediction["queue"])

            processed = ProcessedTicket(
                original_ticket_id=ticket.id,
                subject=ticket.subject,
                body=ticket.body,
                queue=queue,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(processed)

            ticket.processing_status = ProcessingStatus.COMPLETED
            ticket.updated_at = datetime.utcnow()
            db.commit()
        except Exception as e:
            logger.error(f"Error processing ticket {ticket.id}: {e}")
            ticket.processing_status = ProcessingStatus.FAILED
            db.commit()
ticket_processor = TicketProcessor()
