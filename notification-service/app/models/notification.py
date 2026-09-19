from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    user_id: str = Field(..., description="The ID of the user receiving the notification")
    type: str = Field(..., description="Type of notification (e.g., NEW_MESSAGE, SYSTEM_ALERT)")
    content: str = Field(..., description="The actual notification content")

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: str
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
