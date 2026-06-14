from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.models.cleaning import CleaningTask
from app.domain.models.misc import Employee, SystemSetting
from app.domain.models.audit import AuditLog
from app.domain.models.notification import Notification, NotificationTemplate
from app.domain.repositories.base import BaseRepository


class CleaningTaskRepository(BaseRepository[CleaningTask]):
    model = CleaningTask


class EmployeeRepository(BaseRepository[Employee]):
    model = Employee


class SystemSettingRepository(BaseRepository[SystemSetting]):
    model = SystemSetting


class AuditLogRepository(BaseRepository[AuditLog]):
    model = AuditLog


class NotificationRepository(BaseRepository[Notification]):
    model = Notification


class NotificationTemplateRepository(BaseRepository[NotificationTemplate]):
    model = NotificationTemplate
