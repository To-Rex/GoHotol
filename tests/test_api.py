import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "XMS Hotel Management"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "nonexistent", "password": "wrong"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "logintest",
            "email": "login@example.com",
            "password": "password123",
            "full_name": "Login Test",
            "is_super_admin": True,
        },
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "logintest", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_protected_routes_without_auth(client: AsyncClient):
    response = await client.get("/api/v1/companies")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_company_as_super_admin(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "admin",
            "email": "admin@example.com",
            "password": "admin123",
            "full_name": "Super Admin",
            "is_super_admin": True,
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.post(
        "/api/v1/companies",
        json={"name": "Test Hotel Group", "slug": "test-hotel-group"},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Hotel Group"


@pytest.mark.asyncio
async def test_create_hotel(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "hoteladmin",
            "email": "hotel@example.com",
            "password": "admin123",
            "full_name": "Hotel Admin",
            "is_super_admin": True,
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "hoteladmin", "password": "admin123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    company_resp = await client.post(
        "/api/v1/companies",
        json={"name": "Hotel Group", "slug": "hotel-group"},
        headers=headers,
    )
    company_id = company_resp.json()["id"]

    response = await client.post(
        "/api/v1/hotels",
        json={
            "company_id": company_id,
            "name": "Grand Plaza Tashkent",
            "slug": "grand-plaza-tashkent",
        },
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Grand Plaza Tashkent"


@pytest.mark.asyncio
async def test_customer_crud(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "reception",
            "email": "reception@example.com",
            "password": "password123",
            "full_name": "Reception Manager",
            "is_super_admin": True,
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "reception", "password": "password123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    company_resp = await client.post(
        "/api/v1/companies",
        json={"name": "Plaza Group", "slug": "plaza-group"},
        headers=headers,
    )
    company_id = company_resp.json()["id"]

    response = await client.post(
        "/api/v1/customers",
        json={
            "company_id": company_id,
            "full_name": "John Doe",
            "first_name": "John",
            "last_name": "Doe",
            "nationality": "Uzbekistan",
            "phone": "+998901234567",
            "email": "john@example.com",
        },
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "John Doe"

    customer_id = response.json()["id"]
    get_resp = await client.get(f"/api/v1/customers/{customer_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["full_name"] == "John Doe"


@pytest.mark.asyncio
async def test_room_management(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "manager",
            "email": "manager@example.com",
            "password": "manager123",
            "full_name": "Hotel Manager",
            "is_super_admin": True,
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "manager", "password": "manager123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    company_resp = await client.post(
        "/api/v1/companies",
        json={"name": "Grand Group", "slug": "grand-group"},
        headers=headers,
    )
    company_id = company_resp.json()["id"]

    hotel_resp = await client.post(
        "/api/v1/hotels",
        json={"company_id": company_id, "name": "Grand Samarkand", "slug": "grand-samarkand"},
        headers=headers,
    )
    hotel_id = hotel_resp.json()["id"]

    room_resp = await client.post(
        "/api/v1/rooms",
        json={
            "hotel_id": hotel_id,
            "room_number": "101",
            "name": "Deluxe Room 101",
            "base_price": 150.00,
            "max_guests": 2,
            "bed_type": "King",
            "bed_count": 1,
        },
        headers=headers,
    )
    assert room_resp.status_code == 200
    assert room_resp.json()["room_number"] == "101"

    room_id = room_resp.json()["id"]
    update_resp = await client.put(
        f"/api/v1/rooms/{room_id}",
        json={"bed_type": "Queen", "base_price": 180.00},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["bed_type"] == "Queen"


@pytest.mark.asyncio
async def test_roles_and_permissions(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "sysadmin",
            "email": "sysadmin@example.com",
            "password": "admin123",
            "full_name": "System Admin",
            "is_super_admin": True,
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "sysadmin", "password": "admin123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    role_resp = await client.post(
        "/api/v1/roles",
        json={"name": "Reception Manager", "slug": "reception-manager"},
        headers=headers,
    )
    assert role_resp.status_code == 200
    assert role_resp.json()["name"] == "Reception Manager"

    perm_resp = await client.post(
        "/api/v1/permissions",
        json={
            "name": "Create Booking",
            "slug": "create_booking",
            "module": "bookings",
        },
        headers=headers,
    )
    assert perm_resp.status_code == 200
    assert perm_resp.json()["slug"] == "create_booking"

    role_id = role_resp.json()["id"]
    perm_id = perm_resp.json()["id"]

    assign_resp = await client.post(
        "/api/v1/roles/assign-permissions",
        json={"role_id": role_id, "permission_ids": [perm_id]},
        headers=headers,
    )
    assert assign_resp.status_code == 200


@pytest.mark.asyncio
async def test_dynamic_room_features(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "featman",
            "email": "featman@example.com",
            "password": "pass123",
            "full_name": "Feature Manager",
            "is_super_admin": True,
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "featman", "password": "pass123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    feat_resp = await client.post(
        "/api/v1/room-features",
        json={
            "name": "Air Conditioner",
            "slug": "air-conditioner",
            "icon": "snowflake",
        },
        headers=headers,
    )
    assert feat_resp.status_code == 200
    assert feat_resp.json()["name"] == "Air Conditioner"

    amenity_resp = await client.post(
        "/api/v1/room-amenities",
        json={"name": "WiFi", "slug": "wifi"},
        headers=headers,
    )
    assert amenity_resp.status_code == 200
    assert amenity_resp.json()["name"] == "WiFi"


@pytest.mark.asyncio
async def test_booking_flow(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "booker",
            "email": "booker@example.com",
            "password": "book123",
            "full_name": "Booker",
            "is_super_admin": True,
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "booker", "password": "book123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    company_resp = await client.post(
        "/api/v1/companies",
        json={"name": "Booking Group", "slug": "booking-group"},
        headers=headers,
    )
    company_id = company_resp.json()["id"]

    hotel_resp = await client.post(
        "/api/v1/hotels",
        json={"company_id": company_id, "name": "Booking Hotel", "slug": "booking-hotel"},
        headers=headers,
    )
    hotel_id = hotel_resp.json()["id"]

    customer_resp = await client.post(
        "/api/v1/customers",
        json={"company_id": company_id, "full_name": "Alice Smith"},
        headers=headers,
    )
    customer_id = customer_resp.json()["id"]

    room_resp = await client.post(
        "/api/v1/rooms",
        json={"hotel_id": hotel_id, "room_number": "201", "base_price": 100.00},
        headers=headers,
    )
    room_id = room_resp.json()["id"]

    booking_resp = await client.post(
        "/api/v1/bookings",
        json={
            "company_id": company_id,
            "hotel_id": hotel_id,
            "customer_id": customer_id,
            "check_in_date": "2026-06-15",
            "check_out_date": "2026-06-18",
            "guest_count": 2,
            "room_ids": [room_id],
        },
        headers=headers,
    )
    assert booking_resp.status_code == 200
    assert booking_resp.json()["booking_type"] == "reservation"
    assert booking_resp.json()["guest_count"] == 2
