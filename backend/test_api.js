const https = require('https');

https.get('https://api.undercodeec.com/api/check-payment-status/a0607111bf81723', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${data}`);
  });
}).on('error', (err) => {
  console.error("Error: " + err.message);
});

const postData = JSON.stringify({
  orderData: {
    email: 'test@example.com',
    razonSocial: 'Test',
    planName: 'Test',
    tipoPago: 'total',
    planPrice: 100,
    amountPaid: 100
  }
});

const options = {
  hostname: 'api.undercodeec.com',
  port: 443,
  path: '/api/send-order-emails',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`POST STATUS: ${res.statusCode}`);
    console.log(`POST BODY: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
