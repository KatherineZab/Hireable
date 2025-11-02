const fs = require('fs');
const path = require('path');

// Function to remove Hebrew comments from a file
function removeHebrewComments(content) {
    // Remove single-line comments with Hebrew characters
    content = content.replace(/\/\/.*[א-ת].*$/gm, '');
    
    // Remove multi-line comments with Hebrew characters
    content = content.replace(/\/\*[\s\S]*?[א-ת][\s\S]*?\*\//g, '');
    
    // Remove trailing whitespace and empty lines
    content = content.replace(/^\s*[\r\n]/gm, '');
    
    return content;
}

// Function to process a directory recursively
function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules and .git directories
            if (file !== 'node_modules' && file !== '.git') {
                processDirectory(filePath);
            }
        } else if (file.endsWith('.js')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const cleanedContent = removeHebrewComments(content);
                fs.writeFileSync(filePath, cleanedContent);
                console.log(`Processed: ${filePath}`);
            } catch (error) {
                console.error(`Error processing ${filePath}:`, error.message);
            }
        }
    });
}

// Process both frontend and backend directories
const frontendPath = './Final-react-project/src';
const backendPath = './Final-react-project-Back';

if (fs.existsSync(frontendPath)) {
    console.log('Processing frontend files...');
    processDirectory(frontendPath);
}

if (fs.existsSync(backendPath)) {
    console.log('Processing backend files...');
    processDirectory(backendPath);
}

console.log('Hebrew comments removal completed!'); 