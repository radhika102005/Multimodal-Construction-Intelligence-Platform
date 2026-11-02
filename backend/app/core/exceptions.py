"""
Custom exceptions and error classes for the platform.
"""
from fastapi import HTTPException, status


class ConstructionPlatformException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str = "ERROR"):
        super().__init__(status_code=status_code, detail={"message": detail, "code": error_code})


class InvalidImageException(ConstructionPlatformException):
    def __init__(self, detail: str = "Invalid image file provided."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code="INVALID_IMAGE"
        )


class FileSizeExceededException(ConstructionPlatformException):
    def __init__(self, max_mb: int):
        super().__init__(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image file exceeds maximum allowable size of {max_mb} MB.",
            error_code="FILE_TOO_LARGE"
        )


class AIProviderException(ConstructionPlatformException):
    def __init__(self, detail: str = "AI service temporarily unavailable."):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=detail,
            error_code="AI_PROVIDER_ERROR"
        )


class WeatherAPIException(ConstructionPlatformException):
    def __init__(self, detail: str = "Unable to fetch meteorological observations."):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail,
            error_code="WEATHER_API_UNAVAILABLE"
        )
