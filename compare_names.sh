#!/bin/bash

# Get the database politicians with their full names
psql $DATABASE_URL -t -c "SELECT name FROM politicians;" | sed 's/^ //g' > db_politicians.txt

# List file names without extension
find attached_assets -type f -name "*.png" | grep -v "Logo\|min\|Mobile\|image_" | sed 's|attached_assets/||' | sed 's|\.png$||' > all_politicians.txt

# List the ones that are not in db_politicians.txt
echo "Politicians with images that don't match exact names in database:"
grep -Fxvf db_politicians.txt all_politicians.txt
