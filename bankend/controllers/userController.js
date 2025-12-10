import { getCollection } from '../config/database.js';
import { ObjectId } from 'mongodb';

// Get user's library (purchased/borrowed books)
export const getUserLibrary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactionsCollection = await getCollection('transactions');
    const booksCollection = await getCollection('books');

    // Build query based on access type
    const query = {
      "user.userId": userId,
      status: { $in: ["completed", "active"] }
    };

    // Filter by type: purchase, borrow, or all
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by status: active, completed, returned, etc.
    if (status && status !== 'all') {
      query.status = status;
    }

    // For borrows, only show active ones (not expired or returned)
    if (!type || type === 'borrow') {
      query.$or = [
        { type: { $ne: 'borrow' } },
        { 
          type: 'borrow',
          $or: [
            { "dates.expiresAt": { $gt: new Date() } },
            { "dates.expiresAt": null }
          ]
        }
      ];
    }

    const transactionsCursor = transactionsCollection.find(query, {
      projection: {
        transactionId: 1,
        type: 1,
        status: 1,
        book: 1,
        dates: 1,
        "payment.amount": 1,
        access: 1,
        createdAt: 1
      }
    })
    .sort({ "dates.purchaseDate": -1, "dates.borrowDate": -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const transactions = await transactionsCursor.toArray();
    const total = await transactionsCollection.countDocuments(query);

    // Get book details for each transaction
    const library = [];
    
    for (const transaction of transactions) {
      const book = await booksCollection.findOne(
        { _id: transaction.book.bookId },
        {
          projection: {
            title: 1,
            authors: 1,
            coverImage: 1,
            "publication.pages": 1,
            description: 1,
            category: 1,
            format: 1,
            deweyDecimal: 1,
            deweyHierarchy: 1
          }
        }
      );

      if (book) {
        library.push({
          transactionId: transaction.transactionId,
          bookId: transaction.book.bookId,
          type: transaction.type,
          status: transaction.status,
          title: book.title,
          authors: book.authors,
          cover_image: book.coverImage,
          pages: book.publication?.pages,
          description: book.description,
          category: book.category,
          format: book.format,
          dewey_decimal: book.deweyDecimal,
          dewey_hierarchy: book.deweyHierarchy,
          purchase_date: transaction.dates?.purchaseDate || transaction.createdAt,
          borrow_date: transaction.dates?.borrowDate,
          due_date: transaction.dates?.dueDate,
          return_date: transaction.dates?.returnDate,
          purchase_price: transaction.payment?.amount || 0,
          access_type: transaction.type,
          access_granted: transaction.access?.granted || false,
          download_limit: transaction.access?.downloadLimit || 0,
          downloads_used: transaction.access?.downloadsUsed || 0
        });
      }
    }

    res.json({
      status: 'success',
      data: { 
        library,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get library error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get user's reading list (wishlist/favorites)
export const getReadingList = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const usersCollection = await getCollection('users');

    // Get user with reading list
    const user = await usersCollection.findOne(
      { _id: userId },
      {
        projection: {
          readingList: 1,
          favorites: 1,
          _id: 0
        }
      }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const booksCollection = await getCollection('books');

    // Combine reading list and favorites
    const readingListItems = [
      ...(user.readingList || []),
      ...(user.favorites || []).map(fav => ({
        bookId: fav.bookId,
        addedAt: fav.addedAt,
        type: 'favorite'
      }))
    ];

    // Remove duplicates
    const uniqueItems = readingListItems.reduce((acc, item) => {
      const existing = acc.find(i => i.bookId.toString() === item.bookId.toString());
      if (!existing) {
        acc.push(item);
      }
      return acc;
    }, []);

    // Sort by added date
    uniqueItems.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    // Apply pagination
    const paginatedItems = uniqueItems.slice(skip, skip + parseInt(limit));

    // Get book details for paginated items
    const readingList = [];
    
    for (const item of paginatedItems) {
      const book = await booksCollection.findOne(
        { _id: item.bookId },
        {
          projection: {
            title: 1,
            authors: 1,
            coverImage: 1,
            "publication.pages": 1,
            description: 1,
            category: 1,
            format: 1,
            price: 1,
            "availability.status": 1,
            "availability.availableCopies": 1
          }
        }
      );

      if (book) {
        readingList.push({
          bookId: item.bookId,
          title: book.title,
          authors: book.authors,
          cover_image: book.coverImage,
          pages: book.publication?.pages,
          description: book.description,
          category: book.category,
          format: book.format,
          price: book.price,
          status: book.availability?.status,
          available_copies: book.availability?.availableCopies,
          added_date: item.addedAt,
          type: item.type || 'reading_list',
          progress: item.progress || 0,
          last_read: item.lastRead,
          notes: item.notes
        });
      }
    }

    res.json({
      status: 'success',
      data: { 
        readingList,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: uniqueItems.length,
          pages: Math.ceil(uniqueItems.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reading list error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Add book to reading list
export const addToReadingList = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.body;

    const usersCollection = await getCollection('users');
    const booksCollection = await getCollection('books');

    // Verify book exists
    const book = await booksCollection.findOne({
      _id: new ObjectId(bookId),
      "availability.status": "available"
    });

    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    // Check if already in reading list or favorites
    const user = await usersCollection.findOne({ _id: userId });
    
    const alreadyInList = user.readingList?.some(item => 
      item.bookId.toString() === bookId
    );
    
    const alreadyFavorite = user.favorites?.some(fav => 
      fav.bookId.toString() === bookId
    );

    if (alreadyInList) {
      return res.status(400).json({
        status: 'error',
        message: 'Book already in reading list'
      });
    }

    // Add to reading list
    const readingListItem = {
      bookId: new ObjectId(bookId),
      addedAt: new Date(),
      progress: 0,
      notes: '',
      lastRead: null
    };

    await usersCollection.updateOne(
      { _id: userId },
      { 
        $push: { 
          readingList: readingListItem 
        },
        $inc: { "statistics.readingListCount": 1 }
      }
    );

    // Update book statistics
    await booksCollection.updateOne(
      { _id: new ObjectId(bookId) },
      { $inc: { "statistics.favoriteCount": 1 } }
    );

    res.json({
      status: 'success',
      message: 'Book added to reading list',
      data: {
        bookId: bookId,
        bookTitle: book.title,
        addedAt: readingListItem.addedAt
      }
    });
  } catch (error) {
    console.error('Add to reading list error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Remove book from reading list
export const removeFromReadingList = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;

    const usersCollection = await getCollection('users');
    const booksCollection = await getCollection('books');

    // Remove from reading list
    const result = await usersCollection.updateOne(
      { _id: userId },
      { 
        $pull: { 
          readingList: { bookId: new ObjectId(bookId) } 
        },
        $inc: { "statistics.readingListCount": -1 }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found in reading list'
      });
    }

    // Also remove from favorites if present
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $pull: { 
          favorites: { bookId: new ObjectId(bookId) } 
        }
      }
    );

    // Update book statistics
    await booksCollection.updateOne(
      { _id: new ObjectId(bookId) },
      { $inc: { "statistics.favoriteCount": -1 } }
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

// Update reading progress
export const updateReadingProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;
    const { progress, notes } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Progress must be between 0 and 100'
      });
    }

    const usersCollection = await getCollection('users');

    // Update reading progress in reading list
    const result = await usersCollection.updateOne(
      { 
        _id: userId,
        "readingList.bookId": new ObjectId(bookId)
      },
      { 
        $set: { 
          "readingList.$.progress": progress,
          "readingList.$.lastRead": new Date(),
          "readingList.$.notes": notes || ''
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found in reading list'
      });
    }

    // If progress is 100%, add to completed books
    if (progress === 100) {
      await usersCollection.updateOne(
        { _id: userId },
        { 
          $addToSet: { 
            completedBooks: new ObjectId(bookId) 
          },
          $inc: { "statistics.completedBooks": 1 }
        }
      );
    }

    res.json({
      status: 'success',
      message: 'Reading progress updated',
      data: {
        bookId: bookId,
        progress: progress,
        lastRead: new Date(),
        completed: progress === 100
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersCollection = await getCollection('users');
    const transactionsCollection = await getCollection('transactions');

    // Get user with statistics
    const user = await usersCollection.findOne(
      { _id: userId },
      {
        projection: {
          statistics: 1,
          readingList: 1,
          favorites: 1,
          completedBooks: 1,
          purchaseHistory: 1,
          _id: 0
        }
      }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Calculate additional stats from transactions
    const activeBorrows = await transactionsCollection.countDocuments({
      "user.userId": userId,
      type: "borrow",
      status: "active",
      "dates.expiresAt": { $gt: new Date() }
    });

    const completedPurchases = await transactionsCollection.countDocuments({
      "user.userId": userId,
      type: "purchase",
      status: "completed"
    });

    // Calculate total spent
    const purchaseTransactions = await transactionsCollection.find(
      {
        "user.userId": userId,
        type: "purchase",
        status: "completed"
      },
      {
        projection: {
          "payment.amount": 1
        }
      }
    ).toArray();

    const totalSpent = purchaseTransactions.reduce((sum, transaction) => {
      return sum + (transaction.payment?.amount || 0);
    }, 0);

    // Calculate reading list progress
    const readingInProgress = user.readingList?.filter(item => 
      item.progress > 0 && item.progress < 100
    ).length || 0;

    const completedReading = user.readingList?.filter(item => 
      item.progress === 100
    ).length || 0;

    res.json({
      status: 'success',
      data: {
        stats: {
          totalBooks: completedPurchases + activeBorrows,
          purchasedBooks: completedPurchases,
          borrowedBooks: activeBorrows,
          readingListCount: user.readingList?.length || 0,
          favoritesCount: user.favorites?.length || 0,
          readingInProgress: readingInProgress,
          completedBooks: completedReading,
          totalSpent: totalSpent,
          totalCompleted: user.completedBooks?.length || 0,
          // User statistics from embedded document
          totalDownloads: user.statistics?.totalDownloads || 0,
          totalReviews: user.statistics?.totalReviews || 0,
          accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) // Days
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

// Add book to favorites
export const addToFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.body;

    const usersCollection = await getCollection('users');
    const booksCollection = await getCollection('books');

    // Verify book exists
    const book = await booksCollection.findOne({
      _id: new ObjectId(bookId),
      "availability.status": "available"
    });

    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    // Check if already in favorites
    const user = await usersCollection.findOne({ _id: userId });
    const alreadyFavorite = user.favorites?.some(fav => 
      fav.bookId.toString() === bookId
    );

    if (alreadyFavorite) {
      return res.status(400).json({
        status: 'error',
        message: 'Book already in favorites'
      });
    }

    // Add to favorites
    const favoriteItem = {
      bookId: new ObjectId(bookId),
      addedAt: new Date(),
      title: book.title,
      authors: book.authors,
      coverImage: book.coverImage
    };

    await usersCollection.updateOne(
      { _id: userId },
      { 
        $push: { 
          favorites: favoriteItem 
        },
        $inc: { "statistics.favoritesCount": 1 }
      }
    );

    // Update book statistics
    await booksCollection.updateOne(
      { _id: new ObjectId(bookId) },
      { $inc: { "statistics.favoriteCount": 1 } }
    );

    res.json({
      status: 'success',
      message: 'Book added to favorites',
      data: {
        bookId: bookId,
        bookTitle: book.title,
        addedAt: favoriteItem.addedAt
      }
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Remove book from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;

    const usersCollection = await getCollection('users');
    const booksCollection = await getCollection('books');

    // Remove from favorites
    const result = await usersCollection.updateOne(
      { _id: userId },
      { 
        $pull: { 
          favorites: { bookId: new ObjectId(bookId) } 
        },
        $inc: { "statistics.favoritesCount": -1 }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found in favorites'
      });
    }

    // Update book statistics
    await booksCollection.updateOne(
      { _id: new ObjectId(bookId) },
      { $inc: { "statistics.favoriteCount": -1 } }
    );

    res.json({
      status: 'success',
      message: 'Book removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get user's completed books
export const getCompletedBooks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const usersCollection = await getCollection('users');

    // Get user's completed books
    const user = await usersCollection.findOne(
      { _id: userId },
      {
        projection: {
          completedBooks: 1,
          readingList: 1,
          _id: 0
        }
      }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get books from reading list with progress 100%
    const completedFromReadingList = user.readingList?.filter(item => 
      item.progress === 100
    ).map(item => item.bookId) || [];

    // Combine completed books
    const allCompletedBookIds = [
      ...(user.completedBooks || []),
      ...completedFromReadingList
    ];

    // Remove duplicates
    const uniqueBookIds = [...new Set(allCompletedBookIds.map(id => id.toString()))];
    
    // Apply pagination
    const paginatedBookIds = uniqueBookIds.slice(skip, skip + parseInt(limit));

    const booksCollection = await getCollection('books');
    const completedBooks = [];

    // Get book details
    for (const bookId of paginatedBookIds) {
      const book = await booksCollection.findOne(
        { _id: new ObjectId(bookId) },
        {
          projection: {
            title: 1,
            authors: 1,
            coverImage: 1,
            "publication.pages": 1,
            description: 1,
            category: 1,
            deweyDecimal: 1
          }
        }
      );

      if (book) {
        completedBooks.push({
          bookId: bookId,
          title: book.title,
          authors: book.authors,
          cover_image: book.coverImage,
          pages: book.publication?.pages,
          description: book.description,
          category: book.category,
          dewey_decimal: book.deweyDecimal
        });
      }
    }

    res.json({
      status: 'success',
      data: {
        completedBooks: completedBooks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: uniqueBookIds.length,
          pages: Math.ceil(uniqueBookIds.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get completed books error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get user's reading history
export const getReadingHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, days } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const usersCollection = await getCollection('users');

    // Get user's reading history
    const user = await usersCollection.findOne(
      { _id: userId },
      {
        projection: {
          readingHistory: 1,
          _id: 0
        }
      }
    );

    if (!user || !user.readingHistory) {
      return res.json({
        status: 'success',
        data: {
          readingHistory: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Filter by days if specified
    let filteredHistory = user.readingHistory;
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      
      filteredHistory = user.readingHistory.filter(item => 
        new Date(item.readDate) >= cutoffDate
      );
    }

    // Sort by read date (newest first)
    filteredHistory.sort((a, b) => new Date(b.readDate) - new Date(a.readDate));

    // Apply pagination
    const paginatedHistory = filteredHistory.slice(skip, skip + parseInt(limit));

    const booksCollection = await getCollection('books');
    const readingHistory = [];

    // Get book details
    for (const historyItem of paginatedHistory) {
      const book = await booksCollection.findOne(
        { _id: historyItem.bookId },
        {
          projection: {
            title: 1,
            authors: 1,
            coverImage: 1,
            category: 1,
            deweyDecimal: 1
          }
        }
      );

      if (book) {
        readingHistory.push({
          bookId: historyItem.bookId,
          title: book.title,
          authors: book.authors,
          cover_image: book.coverImage,
          category: book.category,
          dewey_decimal: book.deweyDecimal,
          read_date: historyItem.readDate,
          duration_minutes: historyItem.durationMinutes || 0,
          progress: historyItem.progress || 0,
          location: historyItem.location || 'unknown',
          device: historyItem.device || 'unknown'
        });
      }
    }

    res.json({
      status: 'success',
      data: {
        readingHistory: readingHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredHistory.length,
          pages: Math.ceil(filteredHistory.length / limit)
        },
        summary: {
          totalRead: filteredHistory.length,
          totalReadingTime: filteredHistory.reduce((sum, item) => 
            sum + (item.durationMinutes || 0), 0
          ),
          averagePerDay: days ? (filteredHistory.length / parseInt(days)).toFixed(2) : null
        }
      }
    });
  } catch (error) {
    console.error('Get reading history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};