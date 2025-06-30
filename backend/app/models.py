from sqlalchemy import Boolean, Column, Integer, String, JSON
from .database import Base

class Chain(Base):
    __tablename__ = "chains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    content = Column(JSON)
    is_favorite = Column(Boolean, default=False)
