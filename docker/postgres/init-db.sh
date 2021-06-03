#!/bin/bash
set -e

echo 'trying to start postgres script...'
echo 'username : '
echo $POSTGRES_USER

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="$POSTGRES_DB"<<-EOSQL
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL
