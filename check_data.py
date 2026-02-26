import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
conn_string = os.environ.get("DB_CONNECTION_STRING")
conn = psycopg2.connect(conn_string)
cursor = conn.cursor()

# Check for match_stats_map data
cursor.execute("SELECT adr, kast, hs_pct, fk, fd, plants FROM match_stats_map WHERE adr IS NOT NULL LIMIT 5")
stats = cursor.fetchall()
print("Stats Sample:", stats)

# Check for round data
cursor.execute("SELECT winning_team_id, win_type, plant, defuse FROM match_rounds LIMIT 5")
rounds = cursor.fetchall()
print("Rounds Sample:", rounds)

conn.close()
