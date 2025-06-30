from pydantic import BaseModel
from typing import Any

class ChainBase(BaseModel):
    name: str
    content: Any
    is_favorite: bool = False

class ChainCreate(ChainBase):
    pass

class Chain(ChainBase):
    id: int

    class Config:
        orm_mode = True
