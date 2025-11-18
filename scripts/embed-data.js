const fs = require('fs');
const path = require('path');

// Read the JSON data
const dataPath = path.join(__dirname, '../data/layoffs.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Create the embedded data file
const outputPath = path.join(__dirname, '../js/data.js');
const output = `// Auto-generated file - do not edit manually
// This file embeds the layoff data to avoid CORS issues when opening locally

window.layoffDataJSON = ${JSON.stringify(data, null, 2)};
`;

fs.writeFileSync(outputPath, output, 'utf8');
console.log('✓ Data embedded successfully');

