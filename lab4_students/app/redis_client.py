import redis
import json
from app.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

def get_cached_data(key: str):
    """Отримання даних з кешу"""
    data = redis_client.get(key)
    if data:
        return json.loads(data)
    return None

def set_cached_data(key: str, data: list, expire: int = 60):
    """Запис даних у кеш"""
    redis_client.setex(key, expire, json.dumps(data))

def clear_cache(key: str):
    """Очищення кешу при зміні даних"""
    redis_client.delete(key)