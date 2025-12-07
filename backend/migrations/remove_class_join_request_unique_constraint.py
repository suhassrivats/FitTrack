"""
Migration: Remove unique constraint from class_join_requests table

The unique constraint on (class_id, student_id) is too strict - it prevents
students from submitting new requests after a rejection. We want to allow
multiple requests per student-class pair, but only one pending request at a time
(enforced at application level).

For SQLite, we need to recreate the table to drop the constraint.
For PostgreSQL, we can use ALTER TABLE to drop the constraint.
"""

from app import app
from models import db
from sqlalchemy import text, inspect
import os

def migrate():
    """Remove the unique constraint from class_join_requests table"""
    with app.app_context():
        inspector = inspect(db.engine)
        db_url = app.config['SQLALCHEMY_DATABASE_URI']
        
        # Check if constraint exists
        constraints = inspector.get_unique_constraints('class_join_requests')
        constraint_exists = any(c['name'] == 'unique_class_join_request' for c in constraints)
        
        if not constraint_exists:
            print("✓ Unique constraint 'unique_class_join_request' does not exist. Migration not needed.")
            return
        
        print("Removing unique constraint 'unique_class_join_request'...")
        
        if 'sqlite' in db_url.lower():
            # SQLite: Need to recreate table
            print("Using SQLite - recreating table to drop constraint...")
            
            # Create new table without constraint
            db.engine.execute(text("""
                CREATE TABLE class_join_requests_new (
                    id INTEGER NOT NULL PRIMARY KEY,
                    class_id INTEGER NOT NULL,
                    student_id INTEGER NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    requested_at DATETIME,
                    responded_at DATETIME,
                    FOREIGN KEY(class_id) REFERENCES classes (id),
                    FOREIGN KEY(student_id) REFERENCES users (id)
                )
            """))
            
            # Copy data
            db.engine.execute(text("""
                INSERT INTO class_join_requests_new 
                SELECT id, class_id, student_id, status, requested_at, responded_at
                FROM class_join_requests
            """))
            
            # Drop old table
            db.engine.execute(text("DROP TABLE class_join_requests"))
            
            # Rename new table
            db.engine.execute(text("ALTER TABLE class_join_requests_new RENAME TO class_join_requests"))
            
            print("✓ Table recreated successfully")
        else:
            # PostgreSQL: Can drop constraint directly
            print("Using PostgreSQL - dropping constraint directly...")
            try:
                db.engine.execute(text("ALTER TABLE class_join_requests DROP CONSTRAINT unique_class_join_request"))
                print("✓ Constraint dropped successfully")
            except Exception as e:
                print(f"Error dropping constraint: {e}")
                print("Constraint may not exist or may have a different name")
        
        db.session.commit()
        print("✓ Migration completed successfully")

if __name__ == '__main__':
    migrate()

