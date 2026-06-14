from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_super_admin
from app.domain.models.user import Permission

router = APIRouter(prefix="/seed", tags=["Seed"])

PERMISSIONS = {
    "bookings": ["create_booking", "edit_booking", "delete_booking", "view_bookings", "check_in", "check_out"],
    "rooms": ["create_room", "edit_room", "delete_room", "view_rooms", "manage_room_features", "manage_room_amenities", "manage_room_statuses"],
    "customers": ["create_customer", "edit_customer", "delete_customer", "view_customers"],
    "users": ["create_user", "edit_user", "delete_user", "view_users"],
    "roles": ["create_role", "edit_role", "delete_role", "view_roles", "assign_permissions"],
    "services": ["create_service", "edit_service", "delete_service", "view_services"],
    "payments": ["create_payment", "view_payments", "manage_payment_methods"],
    "invoices": ["create_invoice", "view_invoices"],
    "cleaning": ["view_cleaning_tasks", "accept_cleaning_task", "complete_cleaning_task"],
    "reports": ["view_reports", "export_reports"],
    "employees": ["create_employee", "edit_employee", "delete_employee", "view_employees"],
    "settings": ["manage_settings"],
    "hotels": ["create_hotel", "edit_hotel", "delete_hotel", "view_hotels"],
    "branches": ["create_branch", "edit_branch", "delete_branch", "view_branches"],
    "companies": ["create_company", "edit_company", "delete_company", "view_companies"],
}

PERMISSION_NAMES = {
    "create_booking": "Create Booking", "edit_booking": "Edit Booking", "delete_booking": "Delete Booking",
    "view_bookings": "View Bookings", "check_in": "Check-In", "check_out": "Check-Out",
    "create_room": "Create Room", "edit_room": "Edit Room", "delete_room": "Delete Room",
    "view_rooms": "View Rooms", "manage_room_features": "Manage Room Features",
    "manage_room_amenities": "Manage Room Amenities", "manage_room_statuses": "Manage Room Statuses",
    "create_customer": "Create Customer", "edit_customer": "Edit Customer",
    "delete_customer": "Delete Customer", "view_customers": "View Customers",
    "create_user": "Create User", "edit_user": "Edit User", "delete_user": "Delete User", "view_users": "View Users",
    "create_role": "Create Role", "edit_role": "Edit Role", "delete_role": "Delete Role",
    "view_roles": "View Roles", "assign_permissions": "Assign Permissions",
    "create_service": "Create Service", "edit_service": "Edit Service",
    "delete_service": "Delete Service", "view_services": "View Services",
    "create_payment": "Create Payment", "view_payments": "View Payments",
    "manage_payment_methods": "Manage Payment Methods",
    "create_invoice": "Create Invoice", "view_invoices": "View Invoices",
    "view_cleaning_tasks": "View Cleaning Tasks", "accept_cleaning_task": "Accept Cleaning Task",
    "complete_cleaning_task": "Complete Cleaning Task",
    "view_reports": "View Reports", "export_reports": "Export Reports",
    "create_employee": "Create Employee", "edit_employee": "Edit Employee",
    "delete_employee": "Delete Employee", "view_employees": "View Employees",
    "manage_settings": "Manage Settings",
    "create_hotel": "Create Hotel", "edit_hotel": "Edit Hotel",
    "delete_hotel": "Delete Hotel", "view_hotels": "View Hotels",
    "create_branch": "Create Branch", "edit_branch": "Edit Branch",
    "delete_branch": "Delete Branch", "view_branches": "View Branches",
    "create_company": "Create Company", "edit_company": "Edit Company",
    "delete_company": "Delete Company", "view_companies": "View Companies",
}


@router.post("/permissions")
async def seed_permissions(
    db: AsyncSession = Depends(get_db),
    super_admin=Depends(get_super_admin),
):
    existing = await db.execute(select(Permission.slug))
    existing_slugs = set(r[0] for r in existing.all())

    created = 0
    for module, slugs in PERMISSIONS.items():
        for slug in slugs:
            if slug not in existing_slugs:
                perm = Permission(
                    name=PERMISSION_NAMES.get(slug, slug),
                    slug=slug,
                    module=module,
                )
                db.add(perm)
                created += 1

    await db.flush()
    return {"message": f"Seeded {created} new permissions", "total": sum(len(v) for v in PERMISSIONS.values())}
