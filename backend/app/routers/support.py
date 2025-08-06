from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from app.schemas.ticket import QueueUpdateRequest
from app.database.connection import get_db
from app.models.database import ProcessedTicket, TicketQueue
from app.schemas.ticket import (
    ProcessedTicketResponse,
    DropdownOptions,
    TicketQueueEnum
)
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/support", tags=["support"])

@router.get("/tickets", response_model=List[ProcessedTicketResponse])
async def get_processed_tickets(
    queue: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(ProcessedTicket)

        if queue:
            valid_queues = [e.value for e in TicketQueue]
            if queue not in valid_queues:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid queue: {queue}. Valid queues: {valid_queues}"
                )
            query = query.filter(ProcessedTicket.queue == TicketQueue(queue))

        tickets = query.offset(skip).limit(limit).all()
        return tickets

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tickets/{ticket_id}", response_model=ProcessedTicketResponse)
async def get_processed_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(ProcessedTicket).filter(ProcessedTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Processed ticket not found")
    return ticket

@router.get("/dropdown-options", response_model=DropdownOptions)
async def get_dropdown_options():
    queues = [e.value for e in TicketQueueEnum]
    return DropdownOptions(queues=queues)

@router.put("/tickets/{ticket_id}/queue", response_model=ProcessedTicketResponse)
async def update_ticket_queue(
    ticket_id: int,
    queue_update: QueueUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update the queue of a processed ticket"""
    ticket = db.query(ProcessedTicket).filter(ProcessedTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Processed ticket not found")

    try:
        ticket.queue = TicketQueue(queue_update.queue)
        ticket.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(ticket)

        return ticket
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid queue value: {queue_update.queue}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating queue: {str(e)}")