"""File storage helpers for images and inventory data."""

import json
from pathlib import Path

from backend.config import (
    ALLOWED_EXTENSIONS,
    ALLOWED_INVENTORY_EXTENSIONS,
    INVENTORIES_DIR,
    PUBLIC_IMAGES_DIR,
    ensure_storage_dirs,
)


def allowed_file(filename: str) -> bool:
    """Validate that an image has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def allowed_inventory_file(filename: str) -> bool:
    """Ensure inventory uploads are JSON files."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_INVENTORY_EXTENSIONS


def save_image_file(file, slug: str, image_type: str) -> str:
    """Persist an uploaded image and return the public relative path."""
    ensure_storage_dirs()

    if not file or not file.filename:
        raise ValueError(f"No file provided for {image_type}")

    if not allowed_file(file.filename):
        raise ValueError(f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    ext = file.filename.rsplit('.', 1)[1].lower()
    if image_type == 'heroImage':
        filename = f"{slug}-hero.{ext}"
    else:
        filename = f"{slug}-{image_type}.{ext}"

    file_path = PUBLIC_IMAGES_DIR / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file.save(str(file_path))

    if not file_path.exists():
        raise ValueError(f"Failed to save {image_type} file to {file_path}")

    return f"/images/{filename}"


def save_inventory_file(file, slug: str) -> str:
    """Persist an inventory JSON file for a brand."""
    ensure_storage_dirs()

    if not file or not file.filename:
        raise ValueError("No file provided for inventory")

    if not allowed_inventory_file(file.filename):
        raise ValueError("File type not allowed. Only JSON files are accepted.")

    try:
        file.seek(0)
        inventory_data = json.load(file)
        if not isinstance(inventory_data, list):
            raise ValueError("Inventory must be a JSON array of vehicles")
        file.seek(0)
    except json.JSONDecodeError as err:
        raise ValueError(f"Invalid JSON format: {str(err)}")

    filename = f"{slug}-inventory.json"
    file_path = INVENTORIES_DIR / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file.save(str(file_path))

    if not file_path.exists():
        raise ValueError(f"Failed to save inventory file to {file_path}")

    return f"inventories/{filename}"


def get_brand_inventory_path(slug: str) -> Path:
    """Return the filesystem path for a brand inventory file."""
    return INVENTORIES_DIR / f"{slug}-inventory.json"


def brand_has_inventory(slug: str) -> bool:
    """Check whether an inventory file exists for the brand."""
    return get_brand_inventory_path(slug).exists()
