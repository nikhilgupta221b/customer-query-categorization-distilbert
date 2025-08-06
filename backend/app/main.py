from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from dotenv import load_dotenv

from app.database.connection import engine
from app.models.database import Base
from app.routers import tickets, support
from app.services.model_service import model_service
from app.services.ticket_processor import ticket_processor

load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Ticket Classification System",
    description="A system for automatic ticket classification using BERT",
    version="1.0.0"
)

# Fixed CORS configuration - more permissive for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
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
    """Initialize the application"""
    print("Starting Ticket Classification System...")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created/verified")
    except Exception as e:
        print(f"Database error: {e}")
    
    # Load ML model (when you have it)
    model_path = os.getenv("MODEL_PATH", "./models/bert_model")
    model_service.load_model(model_path)
    
    # Start background ticket processor
    asyncio.create_task(ticket_processor.start_processing())
    print("Background ticket processor started")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("Shutting down...")
    ticket_processor.stop_processing()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Ticket Classification System API",
        "status": "running",
        "model_ready": model_service.is_model_ready()
    }

@app.get("/health")
async def health_check():
    """Health check for monitoring"""
    return {
        "status": "healthy",
        "model_loaded": model_service.is_model_ready(),
        "processor_running": ticket_processor.is_running
    }

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    reload = os.getenv("API_RELOAD", "true").lower() == "true"
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload
    )