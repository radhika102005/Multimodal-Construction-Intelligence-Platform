"""
Comprehensive automated tests for Multimodal Construction Intelligence Backend.
Tests endpoints, schemas, services, and image validation.
"""
import io
import pytest
from fastapi.testclient import TestClient

import sys
import os

# Add backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "ai_provider" in data
    assert "render_free_tier_optimized" in data


def test_root_welcome(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert len(data["modules"]) == 8


def test_dashboard_summary(client):
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_projects"] >= 1
    assert data["active_projects"] >= 1
    assert len(data["metrics"]) > 0
    assert "project_status_overview" in data
    assert "safety_summary" in data
    assert len(data["recent_activities"]) > 0


def test_real_estate_valuation(client):
    payload = {
        "property_name": "Test Penthouse Suite",
        "location": "Downtown Metro District",
        "property_type": "Residential Apartment",
        "built_up_area_sqft": 1500,
        "bedrooms": 3,
        "bathrooms": 2,
        "property_age_years": 4,
        "construction_quality": "Premium",
        "furnishing_status": "Fully Furnished",
        "parking_spaces": 2,
        "nearby_amenities": ["Metro Station", "Shopping Mall", "International School"]
    }
    response = client.post("/api/v1/valuation/estimate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_property_value"] > 0
    assert data["estimated_price_per_sqft"] > 0
    assert data["valuation_range"]["min_value"] < data["valuation_range"]["max_value"]
    assert len(data["positive_valuation_factors"]) > 0
    assert "methodology_disclaimer" in data


def test_project_planning(client):
    payload = {
        "project_name": "Skyview Commercial Tower",
        "project_type": "Commercial Complex",
        "location": "North Corridor",
        "built_up_area_sqft": 45000,
        "number_of_floors": 12,
        "expected_start_date": "2026-06-01",
        "estimated_budget": 5000000,
        "currency": "USD"
    }
    response = client.post("/api/v1/planning/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["project_name"] == "Skyview Commercial Tower"
    assert data["total_duration_days"] > 60
    assert len(data["phases"]) >= 4
    assert len(data["budget_allocation"]) >= 4
    assert "critical_path_notes" in data


def test_daily_assistant_chat(client):
    payload = {
        "message": "What is the recommended concrete curing time for Portland cement?",
        "conversation_history": []
    }
    response = client.post("/api/v1/assistant/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["reply"]) > 20
    assert "curing" in data["reply"].lower() or "concrete" in data["reply"].lower()
    assert len(data["suggested_followups"]) > 0


def test_knowledge_assistant(client):
    payload = {
        "question": "What is clear concrete cover and why is it necessary?",
        "category": "Structural Design"
    }
    response = client.post("/api/v1/knowledge/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["answer"]) > 20
    assert len(data["standards_and_citations"]) > 0
    assert len(data["qa_inspection_checklist"]) > 0


def test_safety_audit_with_image(client):
    # Create small valid dummy JPEG bytes (FF D8 FF E0 + padding + FF D9)
    jpeg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00" + (b"\x00" * 100) + b"\xff\xd9"
    files = {"file": ("test_site.jpg", io.BytesIO(jpeg_bytes), "image/jpeg")}
    data = {"site_name": "Test Site Beta", "inspection_type": "Perimeter Safety"}

    response = client.post("/api/v1/safety/analyze", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert "overall_safety_score" in res
    assert res["risk_level"] in ["Low", "Medium", "High", "Critical"]
    assert len(res["detected_hazards"]) > 0
    assert "inspection_disclaimer" in res


def test_crack_analysis_with_image(client):
    jpeg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00" + (b"\x00" * 100) + b"\xff\xd9"
    files = {"file": ("crack_test.jpg", io.BytesIO(jpeg_bytes), "image/jpeg")}
    data = {"element_type": "Column", "age_years": "5", "notes": "Diagonal fissure"}

    response = client.post("/api/v1/cracks/analyze", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert "structural_integrity_risk" in res
    assert len(res["detected_defects"]) > 0
    assert "engineering_disclaimer" in res


def test_invalid_image_upload_rejected(client):
    # Corrupt/invalid text file passed as image
    files = {"file": ("virus.exe", io.BytesIO(b"MZ1234567890NOTANIMAGE"), "application/octet-stream")}
    response = client.post("/api/v1/safety/analyze", files=files)
    assert response.status_code == 400
