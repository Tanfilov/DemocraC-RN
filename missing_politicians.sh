#!/bin/bash

# Get list of politician images in database
psql $DATABASE_URL -t -c "SELECT REPLACE(image_url, '/attached_assets/', '') FROM politicians;" > db_politicians.txt

# Get list of politician images in assets folder (excluding non-politician images)
find attached_assets -type f -name "*.png" | grep -v "Logo\|min\|Mobile\|image_" | sed 's|attached_assets/||' > all_politicians.txt

# Compare the two lists
echo "Politicians with images but not in database:"
grep -vf db_politicians.txt all_politicians.txt
