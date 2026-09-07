from __future__ import annotations

import math
import sqlite3
import time
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "data.db"

STORES = [
    {
        "id": 1,
        "name": "스마트 타이어 1호점",
        "rating": 4.8,
        "lat": 37.4989,
        "lng": 127.0286,
        "mechanic_available": 1,
        "address": "서울 강남구 강남대로 390",
    },
    {
        "id": 2,
        "name": "타이어 센터 2호점",
        "rating": 4.5,
        "lat": 37.4965,
        "lng": 127.0255,
        "mechanic_available": 1,
        "address": "서울 강남구 역삼로 120",
    },
    {
        "id": 3,
        "name": "OO 타이어",
        "rating": 4.2,
        "lat": 37.5002,
        "lng": 127.0310,
        "mechanic_available": 0,
        "address": "서울 강남구 테헤란로 152",
    },
]

TIRES = [
    {"id": 1, "name": "타이어 A", "price": 120000, "desc": "사계절 프리미엄 컴포트 타이어"},
    {"id": 2, "name": "타이어 B", "price": 105000, "desc": "고효율 연비 최적화 타이어"},
    {"id": 3, "name": "타이어 C", "price": 145000, "desc": "접지력 강화 스포츠 타이어"},
]

DRIVER_ROUTE = [
    {"lat": 37.498, "lng": 127.027},
    {"lat": 37.499, "lng": 127.028},
    {"lat": 37.500, "lng": 127.029},
    {"lat": 37.501, "lng": 127.030},
]


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS stores (
            id INTEGER PRIMARY KEY,
            name TEXT,
            rating REAL,
            lat REAL,
            lng REAL,
            mechanic_available INTEGER,
            address TEXT
        );
        CREATE TABLE IF NOT EXISTS tires (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price INTEGER,
            desc TEXT
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            store_id INTEGER,
            tire_id INTEGER,
            method TEXT,
            date TEXT,
            user_lat REAL,
            user_lng REAL,
            created_at REAL
        );
        CREATE TABLE IF NOT EXISTS services (
            order_id INTEGER PRIMARY KEY,
            status TEXT,
            started_at REAL,
            driver_name TEXT,
            driver_rating REAL
        );
        """
    )
    cur.execute("SELECT COUNT(*) AS c FROM stores")
    if cur.fetchone()["c"] == 0:
        cur.executemany(
            "INSERT INTO stores VALUES (:id,:name,:rating,:lat,:lng,:mechanic_available,:address)",
            STORES,
        )
    cur.execute("SELECT COUNT(*) AS c FROM tires")
    if cur.fetchone()["c"] == 0:
        cur.executemany("INSERT INTO tires VALUES (:id,:name,:price,:desc)", TIRES)
    conn.commit()
    conn.close()


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlng / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def list_stores(lat: float, lng: float) -> list[dict]:
    conn = get_conn()
    rows = [dict(r) for r in conn.execute("SELECT * FROM stores").fetchall()]
    conn.close()
    result = []
    for row in rows:
        km = haversine_km(lat, lng, row["lat"], row["lng"])
        row["distance"] = f"{km:.1f}km"
        row["distance_km"] = round(km, 2)
        row["mechanic_available"] = bool(row["mechanic_available"])
        row["recommended"] = row["rating"] >= 4.7
        result.append(row)
    result.sort(key=lambda s: (-s["recommended"], s["distance_km"]))
    return result


def list_tires() -> list[dict]:
    conn = get_conn()
    rows = [dict(r) for r in conn.execute("SELECT * FROM tires").fetchall()]
    conn.close()
    return rows


def create_order(payload: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO orders (store_id, tire_id, method, date, user_lat, user_lng, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["store_id"],
            payload["tire_id"],
            payload["method"],
            payload.get("date"),
            payload.get("user_lat"),
            payload.get("user_lng"),
            time.time(),
        ),
    )
    order_id = cur.lastrowid
    conn.commit()
    order = dict(conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone())
    store = dict(conn.execute("SELECT * FROM stores WHERE id = ?", (order["store_id"],)).fetchone())
    tire = dict(conn.execute("SELECT * FROM tires WHERE id = ?", (order["tire_id"],)).fetchone())
    conn.close()
    order["store"] = store
    order["tire"] = tire
    return order


def match_driver(order_id: int) -> dict:
    conn = get_conn()
    order = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    if order is None:
        conn.close()
        raise ValueError("주문을 찾을 수 없습니다.")
    started = time.time()
    conn.execute(
        """
        INSERT OR REPLACE INTO services (order_id, status, started_at, driver_name, driver_rating)
        VALUES (?, ?, ?, ?, ?)
        """,
        (order_id, "MATCHING", started, "김OO", 4.9),
    )
    conn.commit()
    conn.close()
    return get_service_status(order_id)


def _phase(elapsed: float) -> tuple[str, int, int]:
    timeline = [
        (3, "MATCHING", 0, 8),
        (6, "MATCHED", 0, 8),
        (15, "MOVING_TO_USER", 20, 8),
        (18, "VEHICLE_PICKUP", 35, 6),
        (27, "MOVING_TO_STORE", 50, 5),
        (42, "TIRE_REPLACEMENT", 70, 15),
        (51, "RETURNING", 90, 8),
        (10_000, "COMPLETED", 100, 0),
    ]
    for limit, status, progress, eta in timeline:
        if elapsed < limit:
            if status == "TIRE_REPLACEMENT":
                inner = (elapsed - 27) / 15
                progress = int(10 + inner * 90)
            elif status == "MOVING_TO_USER":
                inner = (elapsed - 6) / 9
                progress = int(10 + inner * 20)
                eta = max(1, int(8 * (1 - inner)))
            elif status == "RETURNING":
                inner = (elapsed - 42) / 9
                progress = int(90 + inner * 10)
                eta = max(1, int(8 * (1 - inner)))
            return status, min(progress, 100), eta
    return "COMPLETED", 100, 0


def _route_point(elapsed: float, status: str) -> dict:
    if status in {"MATCHING", "MATCHED"}:
        return DRIVER_ROUTE[0]
    if status == "MOVING_TO_USER":
        t = min(max((elapsed - 6) / 9, 0), 1)
    elif status in {"VEHICLE_PICKUP", "MOVING_TO_STORE", "TIRE_REPLACEMENT"}:
        t = 1.0
    elif status == "RETURNING":
        t = 1.0 - min(max((elapsed - 42) / 9, 0), 1)
    else:
        t = 0.0
    idx = t * (len(DRIVER_ROUTE) - 1)
    i = min(int(idx), len(DRIVER_ROUTE) - 2)
    frac = idx - i
    a, b = DRIVER_ROUTE[i], DRIVER_ROUTE[i + 1]
    return {
        "lat": a["lat"] + (b["lat"] - a["lat"]) * frac,
        "lng": a["lng"] + (b["lng"] - a["lng"]) * frac,
    }


def get_service_status(order_id: int) -> dict:
    conn = get_conn()
    row = conn.execute("SELECT * FROM services WHERE order_id = ?", (order_id,)).fetchone()
    order = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    conn.close()
    if row is None:
        raise ValueError("서비스가 시작되지 않았습니다.")
    elapsed = time.time() - row["started_at"]
    status, progress, eta = _phase(elapsed)
    return {
        "order_id": order_id,
        "status": status,
        "progress": progress,
        "eta": eta,
        "driver_name": row["driver_name"],
        "rating": row["driver_rating"],
        "driver": _route_point(elapsed, status),
        "route": DRIVER_ROUTE,
        "user": {
            "lat": order["user_lat"] if order else 37.4979,
            "lng": order["user_lng"] if order else 127.0276,
        },
    }
