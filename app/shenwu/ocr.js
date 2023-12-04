const { execSync } = require('child_process');
const path = require('path');


const stdout = execSync('python3 ocr/simple.py', {
  cwd: path.join(__dirname, '../..')
})

const result = JSON.parse(stdout.toString())

console.log('stdout: ', result);