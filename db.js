// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// 1. Create the table FIRST
db.run(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error("Error creating table:", err.message);
    return;
  }
  
  // 2. Once the table is created, check if it's empty
  db.get("SELECT COUNT(*) AS count FROM records", (err, row) => {
    if (err) {
      console.error("Error checking records count:", err.message);
      return;
    }

    // 3. If empty, seed the data
    if (row.count === 0) {
      console.log("Seeding initial records...");
      const initialRecords = [
        ["Book search for Database Systems", "Book search", "Need help finding the 4th edition of the Database Systems textbook in the main library.", "Pending"],
        ["Cannot log into student account", "Account help", "My student number and password are not working on the library portal. Please assist.", "In progress"],
        ["Borrowing limit issue", "Borrowing", "I am unable to borrow a new book even though I only have two books out. Please check.", "Completed"],
        ["Request for research article", "Book search", "Looking for a specific IEEE paper on frontend development. Is there a way to access it?", "Pending"],
        ["Overdue fine inquiry", "Account help", "I returned a book last week but there is still a fine showing on my account. Need clarification.", "In progress"],
        ["Reservation for programming book", "Borrowing", "Please reserve the 'JavaScript: The Good Parts' book for me for next week.", "Completed"],
        ["Quiet study area disruption", "Account help", "The third-floor quiet study area has a group making loud noise. Can you send someone?", "Pending"],
        ["Lost library card", "Account help", "I lost my library card. What is the process for getting a replacement?", "In progress"]
      ];

      const stmt = db.prepare(`
        INSERT INTO records (title, category, description, status) 
        VALUES (?, ?, ?, ?)
      `);

      initialRecords.forEach(record => {
        stmt.run(record);
      });

      stmt.finalize((err) => {
        if (!err) console.log("Seeded 8 records successfully.");
      });
    } else {
      console.log("Database already has records. Skipping seed.");
    }
  });
});

module.exports = db;