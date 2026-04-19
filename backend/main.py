"""
E4C Readiness Review API
FastAPI backend for Track 2: Check My Tech
"""

import os
import tempfile
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from criteria import CRITERIA, get_total_fields
from assessment import evaluate_document, build_readiness_report

# Optional PDF parsing
try:
    import pdfplumber
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

app = FastAPI(
    title="E4C Readiness Review API",
    description="AI-assisted technology readiness assessment for E4C Solutions Library",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextSubmission(BaseModel):
    text: str
    technology_name: str = ""
    sector: str = ""


# ─── ROUTES ───────────────────────────────────────────────


@app.get("/")
async def root():
    return {
        "name": "E4C Readiness Review API",
        "version": "1.0.0",
        "track": "Track 2: Check My Tech",
        "status": "running",
    }


@app.get("/criteria")
async def get_criteria():
    """Return the full assessment criteria schema."""
    return {
        "total_fields": get_total_fields(),
        "sections": CRITERIA,
    }


@app.post("/assess/text")
async def assess_text(submission: TextSubmission):
    """Assess technology documentation from plain text."""
    if not submission.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if len(submission.text) < 50:
        raise HTTPException(
            status_code=400,
            detail="Text is too short. Please provide more detailed documentation."
        )

    assessment = await evaluate_document(submission.text)
    report = build_readiness_report(assessment)

    report["technology_name"] = submission.technology_name
    report["sector"] = submission.sector

    return report


@app.post("/assess/file")
async def assess_file(file: UploadFile = File(...)):
    """Assess technology documentation from an uploaded file (PDF or TXT)."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    filename = file.filename.lower()
    content = await file.read()

    if filename.endswith(".pdf"):
        if not HAS_PDF:
            raise HTTPException(
                status_code=400,
                detail="PDF parsing not available. Install pdfplumber: pip install pdfplumber"
            )
        text = extract_pdf_text(content)
    elif filename.endswith(".txt") or filename.endswith(".md"):
        text = content.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF or TXT file."
        )

    if len(text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract enough text from the file. Please try a different format."
        )

    assessment = await evaluate_document(text)
    report = build_readiness_report(assessment)

    report["technology_name"] = file.filename.rsplit(".", 1)[0]
    report["source_file"] = file.filename

    return report


def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp:
        tmp.write(pdf_bytes)
        tmp.flush()

        text_parts = []
        with pdfplumber.open(tmp.name) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

    return "\n\n".join(text_parts)


# ─── RUN ──────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
