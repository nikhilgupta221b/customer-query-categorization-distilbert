from pydantic import BaseModel
from datetime import datetime
from typing import List
from enum import Enum

# Enums
class ProcessingStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class TicketQueueEnum(str, Enum):
    TECHNICAL_SUPPORT = "technical_support"
    PRODUCT_SUPPORT = "product_support"
    CUSTOMER_SERVICE = "customer_service"
    BILLING_SUPPORT = "billing_support"
    SALES_AND_HR = "sales_and_hr"

# Request
class TicketCreate(BaseModel):
    subject: str
    body: str

# Response
class TicketResponse(BaseModel):
    id: int
    subject: str
    body: str
    created_at: datetime
    processing_status: ProcessingStatusEnum
    updated_at: datetime

    class Config:
        from_attributes = True

class ProcessedTicketResponse(BaseModel):
    id: int
    original_ticket_id: int
    subject: str
    body: str
    queue: TicketQueueEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Dropdown
class DropdownOptions(BaseModel):
    queues: List[str]
    
class QueueUpdateRequest(BaseModel):
    queue: TicketQueueEnum