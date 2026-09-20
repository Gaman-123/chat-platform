from fastapi import APIRouter, Depends, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.notification import NotificationCreate, NotificationResponse
from app.models.db_notification import NotificationDB
from app.core.database import get_db
from app.core.exceptions import NotificationNotFoundError

router = APIRouter()

@router.post("/event", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification_event(
    notification: NotificationCreate, 
    db: AsyncSession = Depends(get_db)
):
    db_notif = NotificationDB(
        user_id=notification.user_id,
        type=notification.type,
        content=notification.content,
    )
    db.add(db_notif)
    await db.commit()
    await db.refresh(db_notif)
    return db_notif

@router.get("/{user_id}", response_model=List[NotificationResponse])
async def get_user_notifications(
    user_id: str, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(NotificationDB).where(NotificationDB.user_id == user_id))
    return result.scalars().all()

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: str, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(NotificationDB).where(NotificationDB.id == notification_id))
    notif = result.scalars().first()
    
    if not notif:
        raise NotificationNotFoundError(notification_id=notification_id)
        
    notif.is_read = True
    await db.commit()
    await db.refresh(notif)
    return notif
