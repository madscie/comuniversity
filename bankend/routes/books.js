// routes/books.js
import express from "express";
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getFeaturedBooks,
  getBooksByCategory,
  searchBooks,
  getCategories,
} from "../controllers/bookController.js";
import upload from "../middleware/multer.js";
import db from "../config/database.js";

const router = express.Router();

// controllers/bookController.js - Add this function
export const updateBookStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if book exists
    const [existingBook] = await db.execute(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Calculate available copies based on status
    const available_copies =
      status === "available" ? existingBook[0].total_copies : 0;

    await db.execute(
      `UPDATE books SET 
        status = ?, available_copies = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [status, available_copies, id]
    );

    console.log("✅ BOOK STATUS UPDATED SUCCESSFULLY, ID:", id);

    res.json({
      success: true,
      message: "Book status updated successfully",
    });
  } catch (error) {
    console.error("❌ UPDATE BOOK STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update book status",
      error: error.message,
    });
  }
};

// routes/books.js - Add this route

// Apply multer middleware for book creation and updates
router.post(
  "/",
  upload.fields([
    { name: "cover_image", maxCount: 1 },
    { name: "book_file", maxCount: 1 },
  ]),
  createBook
);

router.put(
  "/:id",
  upload.fields([
    { name: "cover_image", maxCount: 1 },
    { name: "book_file", maxCount: 1 },
  ]),
  updateBook
);

// Other routes remain the same
router.get("/", getBooks);
router.get("/categories", getCategories);
router.get("/featured", getFeaturedBooks);
router.get("/search", searchBooks);
router.get("/category/:category", getBooksByCategory);
router.get("/:id", getBookById);
router.delete("/:id", deleteBook);
// router.patch("/:id/status", updateBookStatus);
// routes/books.js - Change from PATCH to PUT
router.put("/:id/status", updateBookStatus);
export default router;
