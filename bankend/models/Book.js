const db = require('../config/database');

class Book {
  static async create(bookData) {
    const {
      title, author, isbn, dewey_decimal, description, cover_image, file_url,
      file_format, file_size, page_count, uploader_id, publisher, published_year,
      language, category_id, tags
    } = bookData;

    const query = `
      INSERT INTO books 
      (title, author, isbn, dewey_decimal, description, cover_image, file_url, 
       file_format, file_size, page_count, uploader_id, publisher, published_year, 
       language, category_id, tags, is_approved) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().execute(query, [
      title, author, isbn, dewey_decimal, description, cover_image, file_url,
      file_format, file_size, page_count, uploader_id, publisher, published_year,
      language, category_id, JSON.stringify(tags), 1 // Auto-approve for now
    ]);

    return result.insertId;
  }

  static async findAll(searchParams = {}) {
    let query = `
      SELECT b.*, 
        CONCAT(a.fname, ' ', a.lname) as uploader_name,
        dc.name as dewey_category_name
      FROM books b
      LEFT JOIN admins a ON b.uploader_id = a.id
      LEFT JOIN dewey_categories dc ON b.dewey_decimal LIKE CONCAT(dc.code, '%')
      WHERE b.is_approved = 1
    `;
    const params = [];

    if (searchParams.q) {
      query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)`;
      const searchTerm = `%${searchParams.q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (searchParams.category) {
      query += ` AND b.dewey_decimal LIKE ?`;
      params.push(`${searchParams.category}%`);
    }

    if (searchParams.author) {
      query += ` AND b.author LIKE ?`;
      params.push(`%${searchParams.author}%`);
    }

    query += ' ORDER BY b.created_at DESC';

    const [rows] = await db.promise().execute(query, params);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT b.*, 
        CONCAT(a.fname, ' ', a.lname) as uploader_name,
        dc.name as dewey_category_name
      FROM books b
      LEFT JOIN admins a ON b.uploader_id = a.id
      LEFT JOIN dewey_categories dc ON b.dewey_decimal LIKE CONCAT(dc.code, '%')
      WHERE b.id = ? AND b.is_approved = 1
    `;
    const [rows] = await db.promise().execute(query, [id]);
    return rows[0];
  }

  static async incrementDownloadCount(id) {
    const query = 'UPDATE books SET download_count = download_count + 1 WHERE id = ?';
    await db.promise().execute(query, [id]);
  }

  static async incrementViewCount(id) {
    const query = 'UPDATE books SET view_count = view_count + 1 WHERE id = ?';
    await db.promise().execute(query, [id]);
  }

  static async getCategories() {
    const query = 'SELECT * FROM dewey_categories ORDER BY code';
    const [rows] = await db.promise().execute(query);
    return rows;
  }

  static async getCount() {
  const [rows] = await db.promise().execute('SELECT COUNT(*) as count FROM books');
  return rows[0].count;
}

static async getAvailableCount() {
  const [rows] = await db.promise().execute('SELECT COUNT(*) as count FROM books WHERE available_copies > 0');
  return rows[0].count;
}

static async getRecentBooks(days = 7) {
  const [rows] = await db.promise().execute(
    'SELECT * FROM books WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY created_at DESC',
    [days]
  );
  return rows;
}

}


module.exports = Book;