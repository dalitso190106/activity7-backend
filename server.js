// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 1. CORS Setup
const origins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);

app.use(cors({ origin: origins }));

// 2. JSON Body Parser
app.use(express.json());

// 3. Base Route: API Guide
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Library Service Requests API</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: auto; color: #333; background-color: #f4f7f6; }
        h1, h2 { color: #0f3b66; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; background: white; }
        th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
        th { background-color: #0f3b66; color: white; }
        code, pre { background: #e9ecef; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; }
        pre { padding: 1rem; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>Library Service Requests API</h1>
      <p><strong>Project Name:</strong> Library Service Requests</p>
      <p><strong>Student Number:</strong> 202504445</p>
      <p>This is a RESTful API for managing library service requests. It uses Node.js, Express, and SQLite.</p>
      
      <h2>Quick Links</h2>
      <ul>
        <li><a href="/health">Health Check</a></li>
        <li><a href="/api/records">View All Records</a></li>
      </ul>

      <h2>Required Routes</h2>
      <table>
        <tr><th>Method</th><th>Route</th><th>Purpose</th></tr>
        <tr><td>GET</td><td>/</td><td>Show this API guide</td></tr>
        <tr><td>GET</td><td>/health</td><td>Check server and database status</td></tr>
        <tr><td>GET</td><td>/api/records</td><td>Read all records</td></tr>
        <tr><td>GET</td><td>/api/records/:id</td><td>Read one record</td></tr>
        <tr><td>POST</td><td>/api/records</td><td>Create a record</td></tr>
        <tr><td>PUT</td><td>/api/records/:id</td><td>Update a record</td></tr>
        <tr><td>DELETE</td><td>/api/records/:id</td><td>Delete a record</td></tr>
      </table>

      <h2>Data Fields</h2>
      <ul>
        <li><code>title</code>: 3 to 80 characters</li>
        <li><code>category</code>: 2 to 40 characters</li>
        <li><code>description</code>: 5 to 300 characters</li>
        <li><code>status</code>: Must be exactly "Pending", "In progress", or "Completed"</li>
      </ul>

      <h2>Example POST / PUT Body</h2>
      <pre>{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending"
}</pre>

      <h2>Status Codes</h2>
      <ul>
        <li><strong>200 OK:</strong> Successful GET, PUT, DELETE</li>
        <li><strong>201 Created:</strong> Successful POST</li>
        <li><strong>400 Bad Request:</strong> Invalid input or malformed JSON</li>
        <li><strong>404 Not Found:</strong> Record or route does not exist</li>
        <li><strong>500 Internal Server Error:</strong> Unexpected server failure</li>
        <li><strong>503 Service Unavailable:</strong> Database health check failed</li>
      </ul>
      <p><em>Note: If hosted on a free tier (like Render), the service may take 30-50 seconds to start up if it has been idle.</em></p>
    </body>
    </html>
  `);
});

// 4. Health Check Route
app.get('/health', (req, res) => {
  const db = require('./db');
  db.get("SELECT 1", (err) => {
    if (err) {
      return res.status(503).json({ message: "Database connection failed." });
    }
    res.status(200).json({ status: "OK", database: "Connected" });
  });
});

// 5. Mount the Record Routes
app.use('/api/records', require('./routes/records'));

// 6. Handle Unknown Routes (404)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found." });
});

// 7. Global Error Handler (Handles JSON parse errors as 400, others as 500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: "Malformed JSON payload." });
  }
  
  res.status(500).json({ message: "Internal server error." });
});

// 8. Start Server
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});