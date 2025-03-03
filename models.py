from sqlalchemy import Column, Integer, String
from database import Base

class ResourceUsage(Base):
    __tablename__ = "resource_usage"

    id = Column(Integer, primary_key=True, index=True)
    resource_name = Column(String, nullable=False)
    cost = Column(Integer, nullable=False)
