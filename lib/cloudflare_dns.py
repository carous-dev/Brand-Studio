"""
Cloudflare DNS Management Module

This module provides functions for creating and managing Cloudflare DNS records.
It uses the Python requests library for clean, reliable API interactions.
"""

import os
import json
import requests
from typing import Optional, Tuple, List


def _get_auth_headers() -> Tuple[Optional[str], Optional[str], dict]:
    zone_id = os.environ.get('CLOUDFLARE_ZONE_ID')
    api_token = os.environ.get('CLOUDFLARE_API_TOKEN')
    if not zone_id or not api_token:
        return (None, None, {})
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    return (zone_id, api_token, headers)


def create_dns_record(subdomain: str, ip_address: Optional[str] = None, proxied: bool = True) -> bool:
    """
    Create a Cloudflare DNS A record using clean Python requests implementation.
    
    Args:
        subdomain: The subdomain to create (e.g., 'test.carous.co.uk')
        ip_address: The IP address to point to (uses CLOUDFLARE_IP_ADDRESS env var or default)
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        zone_id, api_token, headers = _get_auth_headers()
        if not zone_id or not api_token:
            print("[CLOUDFLARE] ERROR: Missing CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN environment variables")
            return False
        
        # Use provided IP address or get from environment
        if not ip_address:
            ip_address = os.environ.get('CLOUDFLARE_IP_ADDRESS', '46.202.140.63')
        
        # Prepare the request
        url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
        
        payload = {
            "type": "A",
            "name": subdomain,
            "content": ip_address,
            "ttl": 300,
            "proxied": proxied
        }
        
        print(f"[CLOUDFLARE] Creating DNS record for {subdomain} -> {ip_address}")
        
        # Make the request with timeout
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        print(f"[CLOUDFLARE] Response status: {response.status_code}")
        
        # Parse the response
        try:
            result = response.json()
        except ValueError:
            print(f"[CLOUDFLARE] ERROR: Invalid JSON response: {response.text}")
            return False
        
        if response.status_code == 200:
            if result.get('success'):
                record_id = result.get('result', {}).get('id')
                print(f"[CLOUDFLARE] OK: DNS record created successfully (ID: {record_id}) for {subdomain}")
                return True
            else:
                errors = result.get('errors', [])
                error_messages = [error.get('message', 'Unknown error') for error in errors]
                print(f"[CLOUDFLARE] ERROR: {', '.join(error_messages)}")
                
                # Check for specific error cases
                for error in errors:
                    if error.get('code') == 81058:  # Record already exists
                        print(f"[CLOUDFLARE] INFO: DNS record already exists for {subdomain}")
                        return True  # This is actually OK
                
                return False
        else:
            # Cloudflare sometimes returns 4xx with code 81058 when the record already exists.
            errors = result.get('errors', [])
            error_messages = [error.get('message', 'Unknown error') for error in errors]

            text_lower = (response.text or '').lower()

            for error in errors:
                msg = str(error.get('message', '')).lower()
                if error.get('code') == 81058 or 'already exists' in msg or 'duplicate' in msg:
                    print(f"[CLOUDFLARE] INFO: DNS record already exists for {subdomain} (HTTP {response.status_code})")
                    return True

            if 'already exists' in text_lower or 'duplicate' in text_lower:
                print(f"[CLOUDFLARE] INFO: DNS record already exists for {subdomain} (HTTP {response.status_code}, text match)")
                return True

            print(f"[CLOUDFLARE] ERROR: HTTP {response.status_code}")
            if error_messages:
                print(f"[CLOUDFLARE] Error details: {', '.join(error_messages)}")
            else:
                print(f"[CLOUDFLARE] Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("[CLOUDFLARE] ERROR: Request timed out after 10 seconds")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"[CLOUDFLARE] ERROR: Connection failed: {e}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"[CLOUDFLARE] ERROR: Request failed: {e}")
        return False
    except Exception as e:
        print(f"[CLOUDFLARE] ERROR: Unexpected error: {e}")
        return False


def upsert_dns_record(subdomain: str, ip_address: Optional[str] = None, proxied: bool = True) -> bool:
    """
    Idempotent upsert: update existing A record content/proxy, or create if missing.
    """
    try:
        zone_id, api_token, headers = _get_auth_headers()
        if not zone_id or not api_token:
            print("[CLOUDFLARE] ERROR: Missing CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN environment variables")
            return False

        if not ip_address:
            ip_address = os.environ.get('CLOUDFLARE_IP_ADDRESS', '46.202.140.63')

        list_url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
        params = {"name": subdomain, "type": "A"}
        resp = requests.get(list_url, headers=headers, params=params, timeout=10)
        if resp.status_code != 200:
            print(f"[CLOUDFLARE] ERROR: list failed ({resp.status_code})")
            return False

        data = resp.json()
        existing: List[dict] = data.get("result", []) if data.get("success") else []

        if existing:
            record = existing[0]
            current_content = record.get("content")
            current_proxied = record.get("proxied")
            record_id = record.get("id")
            if current_content == ip_address and current_proxied == proxied:
                print(f"[CLOUDFLARE] INFO: DNS already correct for {subdomain} -> {ip_address} (proxied={proxied})")
                return True

            update_url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}"
            payload = {
                "type": "A",
                "name": subdomain,
                "content": ip_address,
                "ttl": 300,
                "proxied": proxied,
            }
            resp = requests.put(update_url, headers=headers, json=payload, timeout=10)
            if resp.status_code == 200 and resp.json().get("success"):
                print(f"[CLOUDFLARE] OK: DNS record updated for {subdomain} -> {ip_address} (proxied={proxied})")
                return True
            else:
                print(f"[CLOUDFLARE] ERROR: Update failed for {subdomain} ({resp.status_code}): {resp.text}")
                # Fall back to create in case record id was stale
                return create_dns_record(subdomain, ip_address, proxied)

        # No existing record; create new
        return create_dns_record(subdomain, ip_address, proxied)
    except Exception as e:
        print(f"[CLOUDFLARE] ERROR: Upsert failed: {e}")
        return False


def check_zone_access() -> Tuple[bool, str]:
    """
    Test if the API token can access the configured zone.
    
    Returns:
        Tuple[bool, str]: (success, zone_name_or_error_message)
    """
    try:
        zone_id = os.environ.get('CLOUDFLARE_ZONE_ID')
        api_token = os.environ.get('CLOUDFLARE_API_TOKEN')
        
        if not zone_id or not api_token:
            return (False, "Missing CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN environment variables")
        
        url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}"
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                zone_name = result.get('result', {}).get('name', 'Unknown')
                return (True, zone_name)
            else:
                errors = result.get('errors', [])
                error_messages = [error.get('message', 'Unknown error') for error in errors]
                return (False, f"API Error: {', '.join(error_messages)}")
        else:
            return (False, f"HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        return (False, f"Request failed: {str(e)}")


def delete_dns_record(subdomain: str) -> bool:
    """
    Delete a DNS record for the given subdomain.
    
    Args:
        subdomain: The subdomain to delete (e.g., 'test.carous.co.uk')
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        zone_id = os.environ.get('CLOUDFLARE_ZONE_ID')
        api_token = os.environ.get('CLOUDFLARE_API_TOKEN')
        
        if not zone_id or not api_token:
            print("[CLOUDFLARE] ERROR: Missing credentials")
            return False
        
        # First, find the record ID
        list_url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
        params = {"name": subdomain, "type": "A"}
        response = requests.get(list_url, headers=headers, params=params, timeout=10)
        
        if response.status_code != 200:
            print(f"[CLOUDFLARE] ERROR: Failed to list records: {response.status_code}")
            return False
        
        result = response.json()
        if not result.get('success'):
            errors = result.get('errors', [])
            error_messages = [error.get('message', 'Unknown error') for error in errors]
            print(f"[CLOUDFLARE] ERROR: {', '.join(error_messages)}")
            return False
        
        records = result.get('result', [])
        if not records:
            print(f"[CLOUDFLARE] INFO: No DNS record found for {subdomain}")
            return True  # Already gone
        
        # Delete the first matching record
        record_id = records[0].get('id')
        delete_url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}"
        
        response = requests.delete(delete_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"[CLOUDFLARE] OK: DNS record deleted for {subdomain}")
                return True
        
        print(f"[CLOUDFLARE] ERROR: Failed to delete record for {subdomain}")
        return False
        
    except Exception as e:
        print(f"[CLOUDFLARE] ERROR: Delete failed: {e}")
        return False


def list_dns_records(record_type: str = "A") -> list:
    """
    List all DNS records of a specific type for the zone.
    
    Args:
        record_type: The DNS record type to list (default: "A")
    
    Returns:
        list: List of DNS record dictionaries
    """
    try:
        zone_id = os.environ.get('CLOUDFLARE_ZONE_ID')
        api_token = os.environ.get('CLOUDFLARE_API_TOKEN')
        
        if not zone_id or not api_token:
            print("[CLOUDFLARE] ERROR: Missing credentials")
            return []
        
        url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
        params = {"type": record_type}
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code != 200:
            print(f"[CLOUDFLARE] ERROR: Failed to list records: {response.status_code}")
            return []
        
        result = response.json()
        if result.get('success'):
            records = result.get('result', [])
            print(f"[CLOUDFLARE] Found {len(records)} {record_type} records")
            return records
        else:
            errors = result.get('errors', [])
            error_messages = [error.get('message', 'Unknown error') for error in errors]
            print(f"[CLOUDFLARE] ERROR: {', '.join(error_messages)}")
            return []
            
    except Exception as e:
        print(f"[CLOUDFLARE] ERROR: List failed: {e}")
        return []
