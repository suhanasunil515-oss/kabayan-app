#!/bin/bash

# Color update script for Philippine flag colors
# This script replaces old blue-to-green gradient with Philippine flag colors

echo "Starting color update process..."

# Define colors
OLD_BLUE="#0056B3"
OLD_GREEN="#00A86B"
OLD_BLUE_HOVER="#004494"
OLD_GREEN_HOVER="#00965A"

NEW_BLUE="#0038A8"
NEW_RED="#CE1126"
NEW_BLUE_DARK="#002c86"
NEW_RED_DARK="#b80f20"

# Count of files to update
TOTAL_FILES=0

# Function to update colors in a file
update_file() {
    local file="$1"
    
    # Skip if file doesn't exist
    if [ ! -f "$file" ]; then
        return
    fi
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Replace colors
    sed -i "s/$OLD_BLUE/$NEW_BLUE/g" "$file"
    sed -i "s/$OLD_GREEN/$NEW_RED/g" "$file"
    sed -i "s/$OLD_BLUE_HOVER/$NEW_BLUE_DARK/g" "$file"
    sed -i "s/$OLD_GREEN_HOVER/$NEW_RED_DARK/g" "$file"
    
    # Check if any changes were made
    if ! diff -q "$file" "$file.bak" > /dev/null; then
        echo "✓ Updated: $file"
        TOTAL_FILES=$((TOTAL_FILES + 1))
        rm "$file.bak"
    else
        # Restore backup if no changes
        mv "$file.bak" "$file"
    fi
}

# Update all TypeScript/TSX files
echo "Updating TypeScript files..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "./node_modules/*" ! -path "./.next/*" | while read file; do
    update_file "$file"
done

# Update CSS files
echo "Updating CSS files..."
find . -type f -name "*.css" ! -path "./node_modules/*" ! -path "./.next/*" | while read file; do
    update_file "$file"
done

# Update JS files
echo "Updating JavaScript files..."
find . -type f -name "*.js" ! -path "./node_modules/*" ! -path "./.next/*" | while read file; do
    update_file "$file"
done

# Update JSON files
echo "Updating JSON files..."
find . -type f -name "*.json" ! -path "./node_modules/*" ! -path "./.next/*" | while read file; do
    update_file "$file"
done

echo ""
echo "✅ Color update complete!"
echo "Total files updated: $TOTAL_FILES"
echo ""
echo "Color mapping applied:"
echo "  $OLD_BLUE     → $NEW_BLUE     (Primary blue)"
echo "  $OLD_GREEN    → $NEW_RED      (Accent red)"
echo "  $OLD_BLUE_HOVER → $NEW_BLUE_DARK   (Hover blue)"
echo "  $OLD_GREEN_HOVER → $NEW_RED_DARK   (Hover red)"
