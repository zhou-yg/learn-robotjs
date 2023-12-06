const { execSync } = require('child_process');
const path = require('path');

/**
 * 
 * @param {string} path 
 * @returns string[]
 */
function ocrScan (img) {
  // /Users/zhouyunge/Downloads/brook-img-texts.png
  const stdout = execSync(`python3 ocr/simple.py ${img}`, {
    cwd: path.join(__dirname, '../..')
  })
  
  const result = JSON.parse(stdout.toString())
  
  return result
}


exports.ocrScan = ocrScan