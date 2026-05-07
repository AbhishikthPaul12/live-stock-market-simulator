import axios from 'axios';

async function testEndpoints() {
  const baseURL = 'http://localhost:5000/api';
  // Note: We need a token to test these, so we'll just check if they return 401 (meaning they exist)
  // vs 404 (meaning they don't).
  
  const endpoints = [
    '/trade/transactions',
    '/transactions',
    '/transactions/'
  ];

  for (const endpoint of endpoints) {
    try {
      await axios.get(`${baseURL}${endpoint}`);
      console.log(`${endpoint}: 200 OK (Unexpected without token, but exists)`);
    } catch (err) {
      console.log(`${endpoint}: ${err.response?.status || err.message}`);
    }
  }
}

testEndpoints();
