const Book = require('../models/Book');
const path = require('path');
const fs = require('fs');

// Utility: Delete a file safely
const deleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Server error while fetching books.' });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Server error while fetching book.' });
  }
};

// Create new book
exports.createBook = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);

    const {
      title,
      author,
      isbn,
      dewey_decimal,
      description,
      publisher,
      published_year,
      language,
      category_id,
      tags,
      is_featured,
      is_approved,
      content_type,
      total_copies,
      available_copies,
      journal_name,
      volume,
      issue,
      pages,
      doi,
      age_group,
      reading_level
    } = req.body;

    // Uploaded files - UPDATED FIELD NAMES
    let cover_image = null;
    let file_url = null;

    if (req.files?.cover_image) {
      cover_image = `/uploads/${req.files.cover_image[0].filename}`;
    }
    if (req.files?.content_file) { // Changed from 'file_url' to 'content_file'
      const fileExt = path.extname(req.files.content_file[0].originalname).toLowerCase();
      if (fileExt !== ".pdf") {
        deleteFile(req.files.content_file[0].path);
        return res.status(400).json({ message: "Only PDF files are allowed for book uploads." });
      }
      file_url = `/uploads/${req.files.content_file[0].filename}`;
    }

    // Check if book already exists by ISBN
    if (isbn) {
      const existingBook = await Book.findByIsbn(isbn);
      if (existingBook) {
        if (req.files?.cover_image) deleteFile(req.files.cover_image[0].path);
        if (req.files?.content_file) deleteFile(req.files.content_file[0].path);
        return res.status(400).json({ message: 'Book with this ISBN already exists.' });
      }
    }

    const bookId = await Book.create({
      title,
      author,
      isbn,
      dewey_decimal,
      description: description || '',
      cover_image,
      file_url,
      file_format: 'PDF',
      file_size: req.files?.content_file ? req.files.content_file[0].size : 0,
      page_count: req.body.page_count ? parseInt(req.body.page_count) : 0,
      publisher,
      published_year: published_year ? parseInt(published_year) : null,
      language: language || 'English',
      category_id: category_id ? parseInt(category_id) : null,
      tags: tags ? JSON.parse(tags) : null,
      is_featured: is_featured ? parseInt(is_featured) : 0,
      is_approved: is_approved ? parseInt(is_approved) : 0,
      uploader_id: req.user ? req.user.id : null,
      content_type: content_type || 'book',
      total_copies: total_copies ? parseInt(total_copies) : 1,
      available_copies: available_copies ? parseInt(available_copies) : 1,
      journal_name,
      volume,
      issue,
      pages,
      doi,
      age_group,
      reading_level
    });

    const newBook = await Book.findById(bookId);
    res.status(201).json({ message: 'Book created successfully.', book: newBook });

  } catch (error) {
    console.error('Error creating book:', error);
    if (req.files?.cover_image) deleteFile(req.files.cover_image[0].path);
    if (req.files?.content_file) deleteFile(req.files.content_file[0].path);
    res.status(500).json({ message: 'Server error while creating book.' });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const dataToUpdate = { ...req.body };

    if (req.files?.cover_image) {
      dataToUpdate.cover_image = `/uploads/${req.files.cover_image[0].filename}`;
    }
    if (req.files?.content_file) { // Changed from 'file_url' to 'content_file'
      const fileExt = path.extname(req.files.content_file[0].originalname).toLowerCase();
      if (fileExt !== ".pdf") {
        deleteFile(req.files.content_file[0].path);
        return res.status(400).json({ message: "Only PDF files are allowed." });
      }
      dataToUpdate.file_url = `/uploads/${req.files.content_file[0].filename}`;
      dataToUpdate.file_format = 'PDF';
      dataToUpdate.file_size = req.files.content_file[0].size;
    }

    const updated = await Book.update(id, dataToUpdate);
    if (!updated) return res.status(404).json({ message: 'Book not found.' });

    const updatedBook = await Book.findById(id);
    res.json({ message: 'Book updated successfully.', book: updatedBook });

  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error while updating book.' });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not found.' });

    // Delete files from disk
    deleteFile(path.join(__dirname, `../public${book.cover_image}`));
    deleteFile(path.join(__dirname, `../public${book.file_url}`));

    await Book.delete(id);
    res.json({ message: 'Book deleted successfully.' });

  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error while deleting book.' });
  }
};

// Search books
exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query is required.' });

    const books = await Book.search(q);
    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ message: 'Server error while searching books.' });
  }
};

// Get books by category
exports.getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const books = await Book.findByCategory(category);
    res.json(books);
  } catch (error) {
    console.error('Error fetching books by category:', error);
    res.status(500).json({ message: 'Server error while fetching books by category.' });
  }
};