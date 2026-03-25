const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'knip_report_utf8.txt');
const reportContent = fs.readFileSync(reportPath, 'utf8');

const lines = reportContent.split('\n');
let deletedCount = 0;

for (let line of lines) {
  // Remove ANSI escape codes and trim
  const cleanLine = line.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim();
  
  if (!cleanLine) continue;

  // The path is the first token
  const relPath = cleanLine.split(/\s+/)[0];

  if (relPath.startsWith('src/') || relPath.startsWith('public/')) {
    const filePath = path.join(__dirname, relPath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('Deleted:', relPath);
        deletedCount++;
      } catch (err) {
        console.error('Failed to delete:', relPath, err.message);
      }
    }
  }
}

console.log(`Successfully deleted ${deletedCount} unused files.`);
