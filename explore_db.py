import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
conn_string = os.environ.get("DB_CONNECTION_STRING")
conn = psycopg2.connect(conn_string)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
tables = [t[0] for t in cursor.fetchall()]

print("Tables in database:", tables)

schema = {}
for table in tables:
    cursor.execute(f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '{table}'
    """)
    schema[table] = cursor.fetchall()

for table, columns in schema.items():
    print(f"\nTable: {table}")
    for col in columns:
        print(f"  - {col[0]} ({col[1]})")

conn.close()
