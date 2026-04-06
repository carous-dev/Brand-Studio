"""Global config helpers for the Brand Dashboard backend."""

from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

ROOT_DIR = Path(__file__).resolve().parents[1]
PUBLIC_IMAGES_DIR = ROOT_DIR / 'public' / 'images'
APP_DATA_DIR = ROOT_DIR / 'app' / 'data'
INVENTORIES_DIR = APP_DATA_DIR / 'inventories'

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'}
ALLOWED_MIME_TYPES = {
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/webp',
}
ALLOWED_INVENTORY_EXTENSIONS = {'json'}


def ensure_storage_dirs() -> None:
    """Make sure directories used for assets and inventories exist."""
    for path in (PUBLIC_IMAGES_DIR, APP_DATA_DIR, INVENTORIES_DIR):
        path.mkdir(parents=True, exist_ok=True)
