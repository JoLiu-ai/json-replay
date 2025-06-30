from fastapi import Depends, FastAPI, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import json
import os
from typing import List, Optional

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS Middleware
origins = [
    "http://localhost",
    "http://localhost:5173",  # Default Vite dev server port
    "http://127.0.0.1:5173",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Chat Visualizer API Endpoints
@app.post("/api/conversations/upload")
async def upload_conversation(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a conversation JSON file"""
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are allowed")
    
    try:
        content = await file.read()
        conversation_data = json.loads(content.decode('utf-8'))
        
        # Validate conversation structure
        if 'mapping' not in conversation_data:
            raise HTTPException(status_code=400, detail="Invalid conversation format: missing 'mapping' field")
        
        # Create chain record
        chain_data = schemas.ChainCreate(
            name=file.filename.replace('.json', ''),
            content=conversation_data,
            is_favorite=False
        )
        
        db_chain = crud.create_chain(db=db, chain=chain_data)
        return {"message": "Conversation uploaded successfully", "chain_id": db_chain.id}
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/conversations/{conversation_id}")
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Get conversation data by ID"""
    db_chain = crud.get_chain(db, chain_id=conversation_id)
    if db_chain is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return db_chain

@app.get("/api/conversations/")
def list_conversations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all conversations with pagination"""
    chains = crud.get_chains(db, skip=skip, limit=limit)
    return chains

@app.post("/api/conversations/{conversation_id}/bookmark")
def bookmark_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Toggle bookmark status for a conversation"""
    db_chain = crud.get_chain(db, chain_id=conversation_id)
    if db_chain is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    updated_chain = crud.update_chain_favorite(db, chain_id=conversation_id, is_favorite=not db_chain.is_favorite)
    return updated_chain

@app.delete("/api/conversations/{conversation_id}")
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Delete a conversation"""
    db_chain = crud.delete_chain(db, chain_id=conversation_id)
    if db_chain is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted successfully"}

@app.get("/api/conversations/{conversation_id}/export")
def export_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Export conversation data"""
    db_chain = crud.get_chain(db, chain_id=conversation_id)
    if db_chain is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    export_data = {
        "title": db_chain.name,
        "exportDate": db_chain.created_at.isoformat() if hasattr(db_chain, 'created_at') else None,
        "conversation": db_chain.content
    }
    
    return export_data

# Serve the chat visualizer page
@app.get("/visualizer/{conversation_id}", response_class=HTMLResponse)
def serve_visualizer(conversation_id: int, db: Session = Depends(get_db)):
    """Serve the chat visualizer page for a specific conversation"""
    # Read the chat-visualizer.html template
    visualizer_path = os.path.join(os.path.dirname(__file__), "..", "..", "reference-ui", "chat-visualizer.html")
    
    if not os.path.exists(visualizer_path):
        raise HTTPException(status_code=404, detail="Visualizer template not found")
    
    with open(visualizer_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # 获取数据库中的 conversation 内容
    db_chain = crud.get_chain(db, chain_id=conversation_id)
    if db_chain is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # 注入 JSON 数据到 window.CONVERSATION_DATA
    injected = f'<script>window.CONVERSATION_DATA = {json.dumps(db_chain.content, ensure_ascii=False)};</script>'
    html_content = html_content.replace('</head>', injected + '\n</head>')

    return HTMLResponse(content=html_content)

# Original chain endpoints
@app.post("/chains/", response_model=schemas.Chain)
def create_chain(chain: schemas.ChainCreate, db: Session = Depends(get_db)):
    return crud.create_chain(db=db, chain=chain)

@app.get("/chains/", response_model=list[schemas.Chain])
def read_chains(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    chains = crud.get_chains(db, skip=skip, limit=limit)
    return chains

@app.get("/chains/{chain_id}", response_model=schemas.Chain)
def read_chain(chain_id: int, db: Session = Depends(get_db)):
    db_chain = crud.get_chain(db, chain_id=chain_id)
    if db_chain is None:
        raise HTTPException(status_code=404, detail="Chain not found")
    return db_chain

@app.put("/chains/{chain_id}/favorite", response_model=schemas.Chain)
def update_favorite_status(chain_id: int, is_favorite: bool, db: Session = Depends(get_db)):
    db_chain = crud.update_chain_favorite(db, chain_id=chain_id, is_favorite=is_favorite)
    if db_chain is None:
        raise HTTPException(status_code=404, detail="Chain not found")
    return db_chain

@app.delete("/chains/{chain_id}", response_model=schemas.Chain)
def delete_chain(chain_id: int, db: Session = Depends(get_db)):
    db_chain = crud.delete_chain(db, chain_id=chain_id)
    if db_chain is None:
        raise HTTPException(status_code=404, detail="Chain not found")
    return db_chain
