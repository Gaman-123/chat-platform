from fastapi import APIRouter, status
from typing import List
import uuid
from datetime import datetime, timezone

from app.models.notification import NotificationCreate, NotificationResponse

router = APIRouter()

# Temporary in-memory storage until PostgreSQL is integrated
fake_db = {}

@router.post("/event", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification_event(notification: NotificationCreate):
    notification_id = str(uuid.uuid4())
    
    new_notification = NotificationResponse(
        id=notification_id,
        user_id=notification.user_id,
        type=notification.type,
        content=notification.content,
        is_read=False,
        created_at=datetime.now(timezone.utc)
    )
    
    fake_db[notification_id] = new_notification
    return new_notification

@router.get("/{user_id}", response_model=List[NotificationResponse])
async def get_user_notifications(user_id: str):
    return [notif for notif in fake_db.values() if notif.user_id == user_id]
