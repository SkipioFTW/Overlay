import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
conn_string = os.environ.get("DB_CONNECTION_STRING")
conn = psycopg2.connect(conn_string)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
tables = [t[0] for t in cursor.fetchall()]

schema_output = "Tables in database:\n"
for table in tables:
    cursor.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}' ORDER BY ordinal_position")
    columns = cursor.fetchall()
    schema_output += f"\nTable: {table}\n"
    for col in columns:
        schema_output += f"  - {col[0]} ({col[1]})\n"

with open("db_schema.txt", "w") as f:
    f.write(schema_output)

conn.close()
