const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/tienda',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.log('BODY:', body.substring(0, 500)); // Log first 500 chars of error
        } else {
            console.log('Body length:', body.length);
            if (body.includes('<title>Tienda - PowerFit</title>')) {
                console.log('Page Title Verified');
            } else {
                console.log('Page Title NOT Found');
            }
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
