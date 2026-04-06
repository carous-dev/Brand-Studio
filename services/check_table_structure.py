#!/usr/bin/env python3
"""
Quick script to check the actual structure of the previews table
"""

import pymysql
import os
import sys

# Load .env manually
project_root = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(os.path.dirname(project_root), '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

# Connect to database
try:
    connection = pymysql.connect(
        host=os.environ.get('MYSQL_HOST', 'localhost'),
        user=os.environ.get('MYSQL_USER', 'root'),
        password=os.environ.get('MYSQL_PASSWORD', ''),
        database=os.environ.get('MYSQL_DATABASE', 'dealers_previews'),
        port=int(os.environ.get('MYSQL_PORT', 3306)),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    with connection.cursor() as cursor:
        # Check if table exists
        cursor.execute("SHOW TABLES LIKE 'previews'")
        table_exists = cursor.fetchone()
        
        if table_exists:
            print("✅ 'previews' table found!")
            
            # Get table structure
            cursor.execute("DESCRIBE previews")
            columns = cursor.fetchall()
            
            print("\n📋 Table Structure:")
            for col in columns:
                print(f"  - {col['Field']}: {col['Type']} {'(NULL)' if col['Null'] == 'YES' else '(NOT NULL)'}")
            
            # Get sample data
            cursor.execute("SELECT * FROM previews LIMIT 3")
            sample_data = cursor.fetchall()
            
            if sample_data:
                print(f"\n📄 Sample Data ({len(sample_data)} rows):")
                for i, row in enumerate(sample_data, 1):
                    print(f"  Row {i}: {row}")
            else:
                print("\n📄 No data in previews table")
                
        else:
            print("❌ 'previews' table does not exist!")
            
            # Show all tables
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"\n📋 Available tables ({len(tables)}):")
            for table in tables:
                table_name = list(table.values())[0]
                print(f"  - {table_name}")
    
    connection.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
