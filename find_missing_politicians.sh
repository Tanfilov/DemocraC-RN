#!/bin/bash

# Get the database politicians with their full names
psql $DATABASE_URL -t -c "SELECT name FROM politicians;" | sort > /tmp/db_politicians.txt

# Get all politician image filenames and convert to names by removing extension
find attached_assets -type f -name "*.png" | grep -v "Logo\|min\|Mobile\|image_" | sed 's|attached_assets/||' | sed 's|\.png$||' | sort > /tmp/all_politicians.txt

# Find which politicians are not in the database
echo "Politicians with images but not in database:"
comm -23 /tmp/all_politicians.txt /tmp/db_politicians.txt

# For potential name mismatches, show possible matches with Levenshtein distance
echo
echo "Potential name matches for 'ישראל קץ':"
psql $DATABASE_URL -c "SELECT name, position, party FROM politicians WHERE levenshtein(name, 'ישראל קץ') <= 3;"

echo 
echo "Looking for close matches for missing images..."
while read politician; do
  echo "Potential matches for '$politician':"
  psql $DATABASE_URL -c "SELECT name, position, party FROM politicians WHERE levenshtein(name, '$politician') <= 3 ORDER BY levenshtein(name, '$politician');"
done < <(comm -23 /tmp/all_politicians.txt /tmp/db_politicians.txt)
