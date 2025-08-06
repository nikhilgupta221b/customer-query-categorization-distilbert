from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class ProcessingStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class TicketQueue(enum.Enum):
    TECHNICAL_SUPPORT = "technical_support"
    PRODUCT_SUPPORT = "product_support"
    CUSTOMER_SERVICE = "customer_service"
    BILLING_SUPPORT = "billing_support"
    SALES_AND_HR = "sales_and_hr"

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processing_status = Column(Enum(ProcessingStatus), default=ProcessingStatus.PENDING)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ProcessedTicket(Base):
    __tablename__ = "processed_tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    original_ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    queue = Column(Enum(TicketQueue), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
