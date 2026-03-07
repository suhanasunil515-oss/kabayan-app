#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Color mappings
const colorMap = {
  '#0056B3': '#0038A8',  // Old blue → New Philippine blue
  '#00A86B': '#CE1126',  // Old green → New Philippine red
  '#004494': '#002c86',  // Old hover blue → New hover blue
  '#00965A': '#b80f20',  // Old hover green → New hover red
  '0056B3': '0038A8',    // Without # for inline styles
  '00A86B': 'CE1126',    // Without # for inline styles
  '004494': '002c86',    // Without # for inline styles
  '00965A': 'b80f20',    // Without # for inline styles
};

let totalFiles = 0;
let totalUpdates = 0;

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      // Skip node_modules, .next, .git, and other common exclude directories
      if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'public' || file === 'scripts') {
        return;
      }
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (stat.isFile()) {
        const ext = path.extname(file);
        
        // Process TypeScript, JavaScript, CSS, and JSON files
        if (['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.md'].includes(ext)) {
          processFile(filePath);
        }
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Replace each color
    Object.entries(colorMap).forEach(([oldColor, newColor]) => {
      if (content.includes(oldColor)) {
        content = content.replace(new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newColor);
        updated = true;
        totalUpdates++;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
      totalFiles++;
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err.message);
  }
}

console.log('🎨 Starting Philippine flag color update...\n');
console.log('Color mapping:');
console.log('  #0056B3 → #0038A8 (Primary blue)');
console.log('  #00A86B → #CE1126 (Accent red)');
console.log('  #004494 → #002c86 (Hover blue)');
console.log('  #00965A → #b80f20 (Hover red)');
console.log('\n');

// Start from root
walkDir(path.resolve(__dirname, '..'));

console.log('\n✅ Color update complete!');
console.log(`Total files updated: ${totalFiles}`);
console.log(`Total color replacements: ${totalUpdates}`);
