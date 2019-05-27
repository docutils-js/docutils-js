const fs = require('fs');
const testSource = require('../testRst' ).default;
testSource.forEach(a => {
    const [name, rst] = a;
    const fName = name.toLowerCase().replace(/[ \.,:]/g, '_');
    fs.writeFileSync(`testfiles/forms/${fName}.txt`, rst, 'utf-8');
});
    
