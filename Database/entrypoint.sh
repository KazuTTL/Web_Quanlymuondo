#!/bin/bash

# Wait for SQL Server to start
until /opt/mssql-tools18/bin/sqlcmd -S db -U sa -P "Cdkcmkvl123." -C -Q "SELECT 1" &>/dev/null; do
    echo "Waiting for SQL Server to start..."
    sleep 2
done

echo "SQL Server is ready! Checking database..."

# Check if database already exists
DB_EXISTS=$(/opt/mssql-tools18/bin/sqlcmd -S db -U sa -P "Cdkcmkvl123." -C -h -1 -Q "IF DB_ID('QuanLyMuonThietBi') IS NOT NULL PRINT '1' ELSE PRINT '0'")
DB_EXISTS=$(echo $DB_EXISTS | tr -d '\r\n[:space:]')

if [ "$DB_EXISTS" = "1" ]; then
    echo "Database 'QuanLyMuonThietBi' already exists. Skipping initialization."
else
    echo "Database 'QuanLyMuonThietBi' does not exist. Initializing database..."
    
    # Run 01_CreateDatabase.sql (using -S db to connect to the db service container)
    /opt/mssql-tools18/bin/sqlcmd -S db -U sa -P "Cdkcmkvl123." -C -i /usr/config/01_CreateDatabase.sql

    # List of files to run in order
    files=(
        "02_CreateTables.sql"
        "03_SeedData.sql"
        "05_Views.sql"
        "06_StoredProcedures.sql"
        "07_Functions.sql"
        "08_Triggers.sql"
        "09_Security.sql"
        "10_Indexes_Performance.sql"
        "11_AuditTrail.sql"
        "12_Security_Roles.sql"
        "13_NewTables.sql"
        "15_AdvancedSP.sql"
        "16_AdvancedFunctions.sql"
        "22_AdvancedTriggers.sql"
        "FIX_PasswordHash.sql"
    )

    for file in "${files[@]}"; do
        echo "Running $file..."
        /opt/mssql-tools18/bin/sqlcmd -S db -U sa -P "Cdkcmkvl123." -C -d QuanLyMuonThietBi -i "/usr/config/$file"
    done

    echo "Database initialization completed successfully!"
fi
