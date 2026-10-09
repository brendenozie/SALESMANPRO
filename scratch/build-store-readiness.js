// Build Store Readiness Matrix for all 78 companies
const fs = require('fs');

const stageA = JSON.parse(fs.readFileSync('scratch/stage-a-parsed.json', 'utf8'));
const ownedIds = new Set(stageA.ownedCompanies.map(c => c.id));

const rawTaxonomy = JSON.parse(fs.readFileSync('scratch/taxonomy-parsed.json', 'utf8'));
const census = JSON.parse(fs.readFileSync('scratch/census-complete.json', 'utf8'));

// Read all companies from database dump if needed, or query MongoDB
// Let's create a script that will be executed via mongosh to fetch all 78 companies with their exact fields
console.log('Script ready for mongosh execution.');
