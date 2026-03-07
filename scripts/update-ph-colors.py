#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Color mapping
COLOR_MAP = {
    '#0056B3': '#0038A8',  # Old blue to new Philippine blue
    '#00A86B': '#CE1126',  # Old green to Philippine red
    '#004494': '#002c86',  # Old hover blue to new hover blue
    '#00965A': '#b80f20',  # Old hover green to new hover red
}

# File extensions to process
EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json']

# Directories to scan
DIRECTORIES = ['app', 'components', 'lib', 'utils', 'config', 'public', 'styles']

def update_file(filepath):
    """Update colors in a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace each color
        for old_color, new_color in COLOR_MAP.items():
            content = content.replace(old_color, new_color)
        
        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    updated_count = 0
    total_count = 0
    
    for directory in DIRECTORIES:
        dir_path = Path(directory)
        if not dir_path.exists():
            continue
        
        for ext in EXTENSIONS:
            for filepath in dir_path.rglob(f'*{ext}'):
                total_count += 1
                if update_file(filepath):
                    updated_count += 1
                    print(f"✅ Updated: {filepath}")
    
    print(f"\n📊 Summary:")
    print(f"Total files scanned: {total_count}")
    print(f"Files updated: {updated_count}")
    print(f"Color mapping completed!")

if __name__ == '__main__':
    main()
