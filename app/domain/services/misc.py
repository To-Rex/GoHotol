from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.domain.models.audit import AuditLog


class AuditService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def log(
        self,
        action: str,
        user_id: int | None = None,
        company_id: int | None = None,
        entity_type: str | None = None,
        entity_id: int | None = None,
        old_values: dict | None = None,
        new_values: dict | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        details: str | None = None,
    ) -> AuditLog:
        log_entry = AuditLog(
            action=action,
            user_id=user_id,
            company_id=company_id,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
        )
        self.session.add(log_entry)
        await self.session.flush()
        return log_entry


class NotificationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def send(
        self,
        user_id: int,
        title: str,
        message: str,
        notification_type: str,
        company_id: int | None = None,
        reference_type: str | None = None,
        reference_id: int | None = None,
        extra_data: dict | None = None,
    ) -> None:
        from app.domain.models.notification import Notification

        notification = Notification(
            company_id=company_id,
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            reference_type=reference_type,
            reference_id=reference_id,
            extra_data=extra_data,
            sent_via=["in_app"],
        )
        self.session.add(notification)
        await self.session.flush()
