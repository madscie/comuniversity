const db = require('../config/database');
const crypto = require('crypto');

exports.getDownloadToken = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    // Check if user owns the book
    const [library] = await db.execute(
      'SELECT id FROM user_library WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );

    if (library.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not own this book'
      });
    }

    // Generate download token
    const downloadToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store download token
    await db.execute(
      `INSERT INTO downloads (user_id, book_id, download_token, format, expires_at)
       VALUES (?, ?, ?, 'PDF', ?)`,
      [userId, bookId, downloadToken, expiresAt]
    );

    // Get book details
    const [books] = await db.execute(
      'SELECT title, author, file_url FROM books WHERE id = ?',
      [bookId]
    );

    if (books.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    const book = books[0];

    res.json({
      status: 'success',
      data: {
        downloadToken,
        bookId,
        bookTitle: book.title,
        bookAuthor: book.author,
        fileUrl: book.file_url,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Get download token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.downloadBook = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify download token
    const [downloads] = await db.execute(
      `SELECT d.*, b.title, b.author, b.file_url, b.file_size
       FROM downloads d
       JOIN books b ON d.book_id = b.id
       WHERE d.download_token = ? AND d.expires_at > NOW()`,
      [token]
    );

    if (downloads.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Download token invalid or expired'
      });
    }

    const download = downloads[0];

    // Update download count
    await db.execute(
      'UPDATE books SET downloads = downloads + 1 WHERE id = ?',
      [download.book_id]
    );

    await db.execute(
      'UPDATE user_library SET download_count = download_count + 1, last_download = NOW() WHERE user_id = ? AND book_id = ?',
      [download.user_id, download.book_id]
    );

    // Return download information
    res.json({
      status: 'success',
      data: {
        downloadUrl: download.file_url,
        fileName: `${download.title}.pdf`,
        fileSize: download.file_size,
        bookTitle: download.title,
        bookAuthor: download.author
      }
    });
  } catch (error) {
    console.error('Download book error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};