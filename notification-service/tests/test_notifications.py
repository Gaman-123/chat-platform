import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    """Test that health endpoint returns 200 and correct body."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "notification-service"}


@pytest.mark.asyncio
async def test_create_notification():
    """Test that a notification event can be created successfully."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "user_id": "user-001",
            "type": "NEW_MESSAGE",
            "content": "You have a new message from Alice"
        }
        response = await ac.post("/api/notifications/event", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == "user-001"
    assert data["type"] == "NEW_MESSAGE"
    assert data["is_read"] is False
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_get_user_notifications():
    """Test that notifications for a user can be retrieved."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create a notification first
        payload = {
            "user_id": "user-002",
            "type": "SYSTEM_ALERT",
            "content": "Your profile has been updated"
        }
        await ac.post("/api/notifications/event", json=payload)

        # Now retrieve it
        response = await ac.get("/api/notifications/user-002")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(n["user_id"] == "user-002" for n in data)
