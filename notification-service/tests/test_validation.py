import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_create_notification_missing_field():
    """Test that creating a notification with missing fields returns 422."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Missing 'content' field
        payload = {
            "user_id": "user-003",
            "type": "NEW_MESSAGE"
        }
        response = await ac.post("/api/notifications/event", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_notification_empty_body():
    """Test that creating a notification with empty body returns 422."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/notifications/event", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_mark_notification_as_read_not_found():
    """Test that marking a non-existent notification as read returns 404."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.patch("/api/notifications/non-existent-id/read")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_empty_notifications_for_unknown_user():
    """Test that an unknown user gets an empty list of notifications."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/notifications/unknown-user-xyz")
    assert response.status_code == 200
    assert response.json() == []
