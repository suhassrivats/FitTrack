"""
Migration: Add OAuth fields to User model
Run this script to add oauth_provider and oauth_id columns to the users table
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from models import db
from sqlalchemy import text
import os

# Create Flask app instance
app = Flask(__name__)
# Get the backend directory path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
db_path = os.path.join(backend_dir, 'instance', 'fittrack.db')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def migrate():
    """Add OAuth fields to users table"""
    with app.app_context():
        try:
            with db.engine.connect() as conn:
                # Check if columns already exist
                result = conn.execute(text("PRAGMA table_info(users)"))
                columns = [row[1] for row in result]
                
                # Add oauth_provider column if it doesn't exist
                if 'oauth_provider' not in columns:
                    conn.execute(text("""
                        ALTER TABLE users 
                        ADD COLUMN oauth_provider VARCHAR(20)
                    """))
                    conn.commit()
                    print("✅ Added oauth_provider column")
                else:
                    print("ℹ️  oauth_provider column already exists")
                
                # Add oauth_id column if it doesn't exist
                if 'oauth_id' not in columns:
                    conn.execute(text("""
                        ALTER TABLE users 
                        ADD COLUMN oauth_id VARCHAR(255)
                    """))
                    conn.commit()
                    print("✅ Added oauth_id column")
                else:
                    print("ℹ️  oauth_id column already exists")
                
                # Note: SQLite doesn't support ALTER COLUMN to make it nullable
                # We'll handle this by updating the model and recreating the table if needed
                print("✅ Migration completed successfully")
                print("ℹ️  Note: password_hash is now nullable for OAuth users in the model")
                
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            raise

if __name__ == '__main__':
    print("Running migration: Add OAuth fields to User model")
    migrate()
    print("Migration completed!")

