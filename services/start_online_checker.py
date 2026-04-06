#!/usr/bin/env python3
"""
Online Checker Service Startup Script
Run this script to start the online checker service as a standalone process
"""

import os
import sys
import argparse
import signal
import time
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from services.online_checker import start_service, stop_service, get_service
from services.online_checker_config import get_config

def signal_handler(sig, frame):
    """Handle shutdown signals"""
    print("\nReceived shutdown signal, stopping service...")
    stop_service()
    sys.exit(0)

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Online Checker Service')
    parser.add_argument('--env', choices=['development', 'production'], 
                       default='production', help='Environment')
    parser.add_argument('--workers', type=int, help='Number of worker threads')
    parser.add_argument('--interval', type=int, help='Check interval in seconds')
    parser.add_argument('--config', help='Custom config file path')
    parser.add_argument('--daemon', action='store_true', help='Run as daemon')
    
    args = parser.parse_args()
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Load configuration
    config = get_config(args.env)
    
    # Override with command line arguments
    if args.workers:
        config['num_workers'] = args.workers
    if args.interval:
        config['check_interval'] = args.interval
    
    print(f"Starting Online Checker Service in {args.env} mode...")
    print(f"Configuration: {config}")
    
    # Start service
    try:
        service = start_service()
        
        # Apply configuration
        for key, value in config.items():
            if hasattr(service, key):
                setattr(service, key, value)
        
        print("Online Checker Service started successfully!")
        print("Press Ctrl+C to stop")
        
        # Keep main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nShutting down...")
        stop_service()
    except Exception as e:
        print(f"Error starting service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
