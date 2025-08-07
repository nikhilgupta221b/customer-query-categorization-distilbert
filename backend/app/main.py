from dotenv import load_dotenv
import os
from pathlib import Path

# Load the .env file from 2 levels up (project root)
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

# Optional debug
print("✅ DATABASE_URL loaded:", os.environ.get("DATABASE_URL"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.database.connection import engine
from app.models.database import Base
from app.routers import tickets, support
from app.services.model_service import model_service
from app.services.ticket_processor import ticket_processor

# Create FastAPI app
app = FastAPI(
    title="Ticket Classification System",
    description="A system for automatic ticket classification using fine-tuned DistilBERT",
    version="1.0.0"
)

# CORS middleware (open for dev; restrict in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(tickets.router)
app.include_router(support.router)

@app.on_event("startup")
async def startup_event():
    """Initialize application"""
    print("🚀 Starting Ticket Classification System...")

    # Create DB tables if they don't exist
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables ready")
    except Exception as e:
        print(f"❌ Database error: {e}")

    # Load model (no need for path argument; internal MODEL_DIR is used)
    model_service.load_model()

    # Start ticket processor as background task
    asyncio.create_task(ticket_processor.start_processing())
    print("✅ Background ticket processor started")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup"""
    print("🛑 Shutting down...")
    ticket_processor.stop_processing()

@app.get("/")
async def root():
    """Root health check"""
    return {
        "message": "Ticket Classification System API",
        "status": "running",
        "model_ready": model_service.is_model_ready()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": model_service.is_model_ready(),
        "processor_running": ticket_processor.is_running
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
