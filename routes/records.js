// routes/records.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper function to validate record data
function validateRecord(body) {
  const { title, category, description, status } = body;

  // 1. Check if all fields exist and are strings
  if (typeof title !== 'string' || typeof category !== 'string' || 
      typeof description !== 'string' || typeof status !== 'string') {
    return "All fields (title, category, description, status) must be provided as text.";
  }

  // 2. Trim spaces for length checking
  const trimmedTitle = title.trim();
  const trimmedCategory = category.trim();
  const trimmedDesc = description.trim();

  // 3. Check lengths
  if (trimmedTitle.length < 3 || trimmedTitle.length > 80) {
    return "Title must have 3 to 80 characters.";
  }
  if (trimmedCategory.length < 2 || trimmedCategory.length > 40) {
    return "Category must have 2 to 40 characters.";
  }
  if (trimmedDesc.length < 5 || trimmedDesc.length > 300) {
    return "Description must have 5 to 300 characters.";
  }

  // 4. Check status exact values
  const validStatuses = ["Pending", "In progress", "Completed"];
  if (!validStatuses.includes(status)) {
    return "Status must be 'Pending', 'In progress', or 'Completed'.";
  }

  return null; // No errors
}

// GET /api/records - Read all records
router.get('/', (req, res) => {
  db.all("SELECT id, title, category, description, status FROM records ORDER BY id", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error: " + err.message });
    }
    res.status(200).json(rows);
  });
});

// GET /api/records/:id - Read one record
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  // Check if id is a positive whole number
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid id. Must be a positive whole number." });
  }

  db.get("SELECT id, title, category, description, status FROM records WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Database error: " + err.message });
    }
    if (!row) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(row);
  });
});

// POST /api/records - Create a record
router.post('/', (req, res) => {
  const errorMsg = validateRecord(req.body);
  if (errorMsg) {
    return res.status(400).json({ message: errorMsg });
  }

  // We ignore any client-supplied id and let SQLite AUTOINCREMENT handle it
  const { title, category, description, status } = req.body;
  
  const sql = `INSERT INTO records (title, category, description, status) VALUES (?, ?, ?, ?)`;
  const params = [title.trim(), category.trim(), description.trim(), status];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ message: "Database error: " + err.message });
    }
    
    // Return the newly created record
    db.get("SELECT * FROM records WHERE id = ?", [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching new record." });
      }
      res.status(201).json(row);
    });
  });
});

// PUT /api/records/:id - Update a record
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid id. Must be a positive whole number." });
  }

  const errorMsg = validateRecord(req.body);
  if (errorMsg) {
    return res.status(400).json({ message: errorMsg });
  }

  // First check if the record exists
  db.get("SELECT id FROM records WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ message: "Database error." });
    if (!row) return res.status(404).json({ message: "Record not found." });

    // Update the record
    const { title, category, description, status } = req.body;
    const sql = `UPDATE records SET title = ?, category = ?, description = ?, status = ? WHERE id = ?`;
    const params = [title.trim(), category.trim(), description.trim(), status, id];

    db.run(sql, params, function(err) {
      if (err) {
        return res.status(500).json({ message: "Database error: " + err.message });
      }
      
      // Return the updated record
      db.get("SELECT * FROM records WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ message: "Error fetching updated record." });
        res.status(200).json(row);
      });
    });
  });
});

// DELETE /api/records/:id - Delete a record
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid id. Must be a positive whole number." });
  }

  db.run("DELETE FROM records WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ message: "Database error: " + err.message });
    }
    
    // 'this.changes' tells us how many rows were deleted
    if (this.changes === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    
    res.status(200).json({ message: "Record deleted." });
  });
});

module.exports = router;