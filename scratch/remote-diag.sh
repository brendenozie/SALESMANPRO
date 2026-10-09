#!/bin/bash
echo "=== REMOTE SERVER ENVIRONMENT DIAGNOSTIC ==="
echo "Hostname: $(hostname)"
echo "Kernel: $(uname -a)"
echo "Uptime: $(uptime)"
echo ""
echo "Database Configuration in /var/www/salesmanpro/shared/.env:"
python3 -c '
import re

try:
    with open("/var/www/salesmanpro/shared/.env", "r") as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL") or line.startswith("REDIS_URL"):
                k, v = line.split("=", 1)
                v = v.strip("\"'\''")
                if "@" in v:
                    after_at = v.split("@", 1)[1]
                    host = after_at.split("/")[0]
                    db = after_at.split("/")[1].split("?")[0] if "/" in after_at else ""
                    print(f"  {k} -> Host: {host}, DB: {db}")
                else:
                    print(f"  {k} -> {v[:25]}")
except Exception as e:
    print("Error:", e)
'
