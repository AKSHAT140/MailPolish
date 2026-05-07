from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from services.ai_service import generate_professional_text

load_dotenv()

app = FastAPI(title="ToneFix API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RefineRequest(BaseModel):
    input_text: str
    recipient: str = "Colleague"
    output_format: str = "Rewrite"
    tone_modifier: str | None = None # e.g., "Make more polite", "Make more assertive"

class RefineResponse(BaseModel):
    original_text: str
    refined_text: str

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/api/refine", response_model=RefineResponse)
async def refine_text(request: RefineRequest):
    refined = generate_professional_text(
        text=request.input_text,
        recipient=request.recipient,
        output_format=request.output_format,
        tone_modifier=request.tone_modifier
    )
    return RefineResponse(
        original_text=request.input_text,
        refined_text=refined
    )
