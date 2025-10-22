const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'communiversity'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL successfully!');
  
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message);
    } else {
      console.log('Tables in database:', results);
    }
    connection.end();
  });
});