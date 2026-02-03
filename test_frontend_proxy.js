#!/usr/bin/env node

// Test script to simulate the frontend registration request
const fetch = require('node-fetch');

async function testFrontendProxy() {
  try {
    const userData = {
      email: "testuser2@example.com",
      full_name: "Test User 2",
      password: "anothersecurepassword123"
    };

    console.log("Making registration request to frontend proxy...");

    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    console.log(`Status: ${response.status}`);
    const result = await response.text();
    console.log(`Response: ${result}`);

    if (response.status === 200) {
      console.log("✅ Frontend proxy registration successful!");
    } else {
      console.log("❌ Frontend proxy registration failed!");
    }
  } catch (error) {
    console.error("Error during request:", error);
  }
}

testFrontendProxy();