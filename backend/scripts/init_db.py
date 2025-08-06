import sys
import os
# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.connection import engine
from app.models.database import Base
from app.models.database import Ticket, ProcessedTicket
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """
    Initializes the database by creating all tables defined in Base.
    """
    logger.info("Creating all database tables...")
    try:
        # This will create the tables in the database
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"An error occurred while creating database tables: {e}")
        raise

if __name__ == "__main__":
    init_db()