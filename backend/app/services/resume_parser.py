"""
Resume parser — extracts text from PDF/DOCX files.
"""
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF file using pdfplumber."""
    try:
        import pdfplumber
        with pdfplumber.open(file_path) as pdf:
            text_parts = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
        return "\n".join(text_parts)
    except ImportError:
        logger.warning("pdfplumber not installed, using fallback")
        return _extract_text_fallback(file_path)
    except Exception as e:
        logger.error("PDF extraction error: %s", repr(e))
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a Word document."""
    try:
        from docx import Document
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    except ImportError:
        logger.warning("python-docx not installed")
        return ""
    except Exception as e:
        logger.error("DOCX extraction error: %s", repr(e))
        return ""


def extract_text(file_path: str) -> str:
    """Auto-detect file type and extract text."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return extract_text_from_docx(file_path)
    else:
        # Try to read as plain text
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception:
            return ""


def _extract_text_fallback(file_path: str) -> str:
    """Fallback text extraction using basic binary read."""
    try:
        with open(file_path, "rb") as f:
            content = f.read()
        # Very basic PDF text extraction — strip binary and get readable strings
        text = content.decode("latin-1", errors="ignore")
        # Filter for printable ASCII lines
        lines = [line for line in text.split("\n") if len(line.strip()) > 3 and line.strip().isascii()]
        return "\n".join(lines[:200])  # Limit to 200 lines
    except Exception as e:
        logger.error("Fallback text extraction failed: %s", repr(e))
        return ""
