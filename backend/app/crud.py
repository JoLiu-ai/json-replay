from sqlalchemy.orm import Session
from . import models, schemas

def get_chain(db: Session, chain_id: int):
    return db.query(models.Chain).filter(models.Chain.id == chain_id).first()

def get_chains(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Chain).offset(skip).limit(limit).all()

def create_chain(db: Session, chain: schemas.ChainCreate):
    db_chain = models.Chain(
        name=chain.name,
        content=chain.content,
        is_favorite=chain.is_favorite
    )
    db.add(db_chain)
    db.commit()
    db.refresh(db_chain)
    return db_chain

def update_chain_favorite(db: Session, chain_id: int, is_favorite: bool):
    db_chain = get_chain(db, chain_id)
    if db_chain:
        db_chain.is_favorite = is_favorite
        db.commit()
        db.refresh(db_chain)
    return db_chain

def delete_chain(db: Session, chain_id: int):
    db_chain = get_chain(db, chain_id)
    if db_chain:
        db.delete(db_chain)
        db.commit()
    return db_chain
