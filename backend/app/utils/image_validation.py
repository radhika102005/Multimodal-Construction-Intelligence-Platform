"""
Image validation and memory-safe processing utilities.
Optimized for Render 512MB RAM free instances by enforcing strict payload size limits
and performing stream validation without caching on disk.
"""
import base64
from typing import Tuple
from fastapi import UploadFile
from app.config import settings
from app.core.exceptions import InvalidImageException, FileSizeExceededException

# Recognized magic bytes for secure MIME validation
IMAGE_SIGNATURES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"RIFF": "image/webp",  # WebP begins with 'RIFF....WEBP'
}

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]


async def validate_and_read_image(file: UploadFile) -> Tuple[bytes, str, str]:
    """
    Validates uploaded image file size and MIME type.
    Returns: (raw_bytes, base64_str, detected_mime_type)
    """
    if not file or not file.filename:
        raise InvalidImageException("No image file was uploaded.")

    # Read content with a hard limit to prevent memory exhaustion
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    content = await file.read(max_bytes + 1024)

    if len(content) > max_bytes:
        raise FileSizeExceededException(settings.MAX_UPLOAD_MB)

    if len(content) < 32:
        raise InvalidImageException("Uploaded file is corrupted or too small to be a valid image.")

    # Verify magic bytes
    detected_mime = None
    if content.startswith(b"\xff\xd8\xff"):
        detected_mime = "image/jpeg"
    elif content.startswith(b"\x89PNG\r\n\x1a\n"):
        detected_mime = "image/png"
    elif content[:4] == b"RIFF" and len(content) > 12 and content[8:12] == b"WEBP":
        detected_mime = "image/webp"

    # Fallback to reported content-type if header is valid
    if not detected_mime:
        reported_type = (file.content_type or "").lower()
        if reported_type in ALLOWED_MIME_TYPES:
            detected_mime = reported_type
        else:
            raise InvalidImageException(
                f"Unsupported image format. Allowed formats: JPEG, PNG, WEBP. Received: {file.content_type}"
            )

    # Encode to base64 for LLM API ingestion
    b64_string = base64.b64encode(content).decode("utf-8")
    return content, b64_string, detected_mime
