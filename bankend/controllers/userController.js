const db = require('../config/database');

exports.getUserLibrary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [library] = await db.execute(
      `SELECT ul.*, b.title, b.author, b.cover_image, b.pages, b.description,
              b.category, b.format as available_formats
       FROM user_library ul
       JOIN books b ON ul.book_id = b.id
       WHERE ul.user_id = ?
       ORDER BY ul.purchase_date DESC`,
      [userId]
    );

    res.json({
      status: 'success',
      data: { library }
    });
  } catch (error) {
    console.error('Get library error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.getReadingList = async (req, res) => {
  try {
    const userId = req.user.id;

    const [readingList] = await db.execute(
      `SELECT rl.*, b.title, b.author, b.cover_image, b.pages, b.description
       FROM reading_lists rl
       JOIN books b ON rl.book_id = b.id
       WHERE rl.user_id = ?
       ORDER BY rl.added_date DESC`,
      [userId]
    );

    res.json({
      status: 'success',
      data: { readingList }
    });
  } catch (error) {
    console.error('Get reading list error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.addToReadingList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    await db.execute(
      `INSERT IGNORE INTO reading_lists (user_id, book_id) VALUES (?, ?)`,
      [userId, bookId]
    );

    res.json({
      status: 'success',
      message: 'Book added to reading list'
    });
  } catch (error) {
    console.error('Add to reading list error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.removeFromReadingList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    await db.execute(
      'DELETE FROM reading_lists WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );

    res.json({
      status: 'success',
      message: 'Book removed from reading list'
    });
  } catch (error) {
    console.error('Remove from reading list error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.updateReadingProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;
    const { progress } = req.body;

    await db.execute(
      `UPDATE reading_lists SET progress = ? WHERE user_id = ? AND book_id = ?`,
      [progress, userId, bookId]
    );

    res.json({
      status: 'success',
      message: 'Reading progress updated'
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [libraryStats] = await db.execute(
      `SELECT COUNT(*) as total_books,
              SUM(CASE WHEN reading_progress > 0 AND reading_progress < 100 THEN 1 ELSE 0 END) as reading_in_progress,
              SUM(CASE WHEN reading_progress = 100 THEN 1 ELSE 0 END) as completed_books,
              SUM(purchase_price) as total_spent
       FROM user_library WHERE user_id = ?`,
      [userId]
    );

    const [readingListStats] = await db.execute(
      'SELECT COUNT(*) as reading_list_count FROM reading_lists WHERE user_id = ?',
      [userId]
    );

    res.json({
      status: 'success',
      data: {
        stats: {
          totalBooks: libraryStats[0].total_books,
          readingInProgress: libraryStats[0].reading_in_progress,
          completedBooks: libraryStats[0].completed_books,
          readingListCount: readingListStats[0].reading_list_count,
          totalSpent: libraryStats[0].total_spent || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};