const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to SQLite database
const db = new sqlite3.Database('aircon_database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS AirConditioners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            aircon TEXT NOT NULL,
            price INTEGER NOT NULL,
            star_rating INTEGER NOT NULL,
            energy_consumption REAL NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table created or already exists.');
        }
    });

    // Insert sample data if the table is empty
    db.get('SELECT COUNT(*) AS count FROM AirConditioners', (err, row) => {
        if (err) {
            console.error('Error querying table:', err.message);
        } else if (row.count === 0) {
            const sampleData = [
                ['Daikin', 'DAIKIN INVERTER SYSTEM 3 AIRCON ISMILE ECO MKM', 4420, 5, 6.56],
                ['Daikin', 'DAIKIN INVERTER SYSTEM 3 AIRCON EZI SERIES MKC', 3065, 3, 5.03],
                ['LG', 'LG INVERTER SYSTEM 3 AIRCON ALPHA+ Z3UQ26GFA0', 3188, 5, 6.46]
            ];
            const stmt = db.prepare('INSERT INTO AirConditioners (brand, aircon, price, star_rating, energy_consumption) VALUES (?, ?, ?, ?, ?)');
            sampleData.forEach(data => stmt.run(data, (err) => {
                if (err) {
                    console.error('Error inserting data:', err.message);
                }
            }));
            stmt.finalize();
        }
    });
});

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM AirConditioners', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Simple authentication logic (replace with real authentication)
    if (email === 'skye@gmail.com' && password === 'password') {
        res.redirect('/main.html');
    } else {
        res.redirect('/login.html');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
