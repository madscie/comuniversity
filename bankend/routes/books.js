// routes/books.js - CLEANED VERSION
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
  updateBookStatus, // Make sure this is imported
} from "../controllers/bookController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

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

// Other routes
router.get("/", getBooks);
router.get("/categories", getCategories);
router.get("/featured", getFeaturedBooks);
router.get("/search", searchBooks);
router.get("/category/:category", getBooksByCategory);
router.get("/:id", getBookById);
router.delete("/:id", deleteBook);
router.put("/:id/status", updateBookStatus);

export default router;