import { safeParseJSON, safeSetJSON } from "../utils/storageHelpers";

class ReadingService {
  // Reading progress
  getReadingProgress(bookId) {
    return safeParseJSON(`readingProgress_${bookId}`, {});
  }

  updateReadingProgress(bookId, chapterIndex, pageIndex) {
    const progress = this.getReadingProgress(bookId);
    const newProgress = {
      ...progress,
      [chapterIndex]: pageIndex,
    };
    safeSetJSON(`readingProgress_${bookId}`, newProgress);
    return newProgress;
  }

  calculateChapterProgress(chapterIndex, chapters, progress) {
    const currentPage = progress[chapterIndex] || 0;
    const totalPages = chapters[chapterIndex]?.pages?.length || 0;
    return totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
  }

  calculateOverallProgress(chapters, progress) {
    let totalRead = 0;
    let totalPossible = 0;

    chapters.forEach((chapter, index) => {
      const currentPage = progress[index] || 0;
      totalRead += currentPage + 1;
      totalPossible += chapter.pages?.length || 0;
    });

    return totalPossible > 0 ? (totalRead / totalPossible) * 100 : 0;
  }

  // Bookmarks
  getBookmarks(bookId) {
    return safeParseJSON(`bookmarks_${bookId}`, []);
  }

  toggleBookmark(bookId, chapterIndex, pageIndex) {
    const bookmarks = this.getBookmarks(bookId);
    const bookmarkKey = `${chapterIndex}-${pageIndex}`;

    const newBookmarks = bookmarks.includes(bookmarkKey)
      ? bookmarks.filter((b) => b !== bookmarkKey)
      : [...bookmarks, bookmarkKey];

    safeSetJSON(`bookmarks_${bookId}`, newBookmarks);
    return newBookmarks;
  }

  // Reading stats
  getReadingStats(bookId) {
    return safeParseJSON(`readingStats_${bookId}`, {
      wordsRead: 0,
      pagesRead: 0,
      readingSpeed: 200,
      lastRead: null,
      totalReadingTime: 0,
    });
  }

  updateReadingStats(bookId, updates) {
    const stats = this.getReadingStats(bookId);
    const newStats = {
      ...stats,
      ...updates,
      lastRead: new Date().toISOString(),
    };
    safeSetJSON(`readingStats_${bookId}`, newStats);
    return newStats;
  }

  // Favorites
  getFavorites() {
    return safeParseJSON("favorites", []);
  }

  toggleFavorite(bookId) {
    const favorites = this.getFavorites();
    const isFavorite = favorites.includes(bookId);

    const newFavorites = isFavorite
      ? favorites.filter((id) => id !== bookId)
      : [...favorites, bookId];

    safeSetJSON("favorites", newFavorites);
    return !isFavorite;
  }

  isFavorite(bookId) {
    const favorites = this.getFavorites();
    return favorites.includes(bookId);
  }

  // Purchases
  getPurchases() {
    return safeParseJSON("purchases", {});
  }

  addPurchase(bookId) {
    const purchases = this.getPurchases();
    const newPurchases = { ...purchases, [bookId]: true };
    safeSetJSON("purchases", newPurchases);
    return newPurchases;
  }

  hasPurchased(bookId) {
    const purchases = this.getPurchases();
    return purchases[bookId] || false;
  }
}

export const readingService = new ReadingService();
