// src/data/booksData.js

export const booksData = [
  {
    id: 1,
    title: "Introduction to React",
    author: "John Doe",
    price: 29.99,
    description:
      "A comprehensive guide to React development with modern practices and real-world examples.",
    pages: 320,
    language: "English",
    format: "PDF",
    category: "Technology",
    deweyCategory: "000-099",
    ddc: "005.133", // React programming
    year: 2024,
    coverImage:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400", // React image
    preview:
      "This book covers everything from basic concepts to advanced patterns...",
    isbn: "978-0-123456-78-9",
    publisher: "Tech Publications",
    rating: 4.5,
    downloads: 15420,
    fileSize: "45.2 MB",
    tags: ["React", "JavaScript", "Frontend", "Web Development"],
    content: `Chapter 1: Introduction to React\n\nReact has revolutionized frontend development with its component-based architecture...\n\nIn this chapter, you'll learn:\n• The core concepts of React\n• Setting up your development environment\n• Creating your first component\n• Understanding JSX syntax\n\nReact's virtual DOM and efficient rendering make it ideal for building modern web applications.`,
  },
  {
    id: 2,
    title: "JavaScript Fundamentals",
    author: "Jane Smith",
    price: 24.99,
    description:
      "Master the basics of JavaScript programming with hands-on examples.",
    pages: 280,
    language: "English",
    format: "PDF + EPUB",
    category: "Technology",
    deweyCategory: "000-099",
    ddc: "005.133", // JavaScript programming
    year: 2023,
    coverImage:
      "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400", // JavaScript image
    preview: "Learn JavaScript from the ground up with practical examples...",
    isbn: "978-0-987654-32-1",
    publisher: "Code Masters",
    rating: 4.3,
    downloads: 8920,
    fileSize: "38.7 MB",
    tags: ["JavaScript", "Programming", "Web Development", "Beginner"],
    content: `Chapter 1: JavaScript Basics\n\nJavaScript is the language of the web, powering interactive experiences...\n\nKey topics covered:\n• Variables and data types\n• Functions and scope\n• DOM manipulation\n• Event handling\n\nMaster these fundamentals to build dynamic web applications.`,
  },
  {
    id: 3,
    title: "Advanced Mathematics for Engineers",
    author: "Dr. Emily Chen",
    year: 2021,
    ddc: "510.2",
    category: "Mathematics",
    deweyCategory: "500-599",
    description:
      "Advanced mathematical concepts applied to engineering problems.",
    price: 34.99,
    pages: 480,
    language: "English",
    format: "PDF",
    coverImage:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    preview: "Comprehensive coverage of engineering mathematics...",
    isbn: "978-1-234567-89-0",
    publisher: "Academic Press",
    rating: 4.7,
    downloads: 5670,
    fileSize: "67.8 MB",
    tags: ["Mathematics", "Engineering", "Calculus", "Advanced"],
    content: `Chapter 1: Advanced Calculus\n\nEngineering mathematics requires a deep understanding of calculus principles...\n\nTopics include:\n• Multivariable calculus\n• Differential equations\n• Vector analysis\n• Complex variables\n\nEssential for solving real-world engineering challenges.`,
  },
  {
    id: 4,
    title: "World History: Modern Era",
    author: "Prof. Robert Johnson",
    year: 2020,
    ddc: "909.8",
    category: "History",
    deweyCategory: "900-999",
    description: "Detailed analysis of world history from 1900 to present day.",
    price: 27.99,
    pages: 560,
    language: "English",
    format: "PDF + EPUB",
    coverImage:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    preview: "Explore the major events that shaped our modern world...",
    isbn: "978-1-345678-90-1",
    publisher: "History Press",
    rating: 4.4,
    downloads: 12340,
    fileSize: "89.3 MB",
    tags: ["History", "Modern Era", "World Events", "Politics"],
    content: `Chapter 1: The 20th Century Dawn\n\nThe modern era began with unprecedented global changes...\n\nCovering:\n• World Wars and their impact\n• Cold War dynamics\n• Decolonization movements\n• Globalization trends\n\nUnderstand how historical events shape our present world.`,
  },
  {
    id: 5,
    title: "Organic Chemistry Fundamentals",
    author: "Dr. Sarah Williams",
    year: 2019,
    ddc: "547",
    category: "Chemistry",
    deweyCategory: "500-599",
    description:
      "Comprehensive guide to organic chemistry principles and reactions.",
    price: 31.99,
    pages: 420,
    language: "English",
    format: "PDF",
    coverImage:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400",
    preview: "Master the fundamentals of organic chemistry...",
    isbn: "978-1-456789-01-2",
    publisher: "Science Publishers",
    rating: 4.6,
    downloads: 7890,
    fileSize: "72.1 MB",
    tags: ["Chemistry", "Organic", "Science", "Education"],
    content: `Chapter 1: Introduction to Organic Chemistry\n\nOrganic chemistry studies carbon-based compounds and their reactions...\n\nKey concepts:\n• Molecular structure and bonding\n• Functional groups\n• Reaction mechanisms\n• Spectroscopy analysis\n\nBuild a strong foundation in chemical sciences.`,
  },
  {
    id: 6,
    title: "Renaissance Art Masterpieces",
    author: "Maria Gonzalez",
    year: 2018,
    ddc: "709.024",
    category: "Art History",
    deweyCategory: "700-799",
    description: "Exploration of influential art from the Renaissance period.",
    price: 26.99,
    pages: 380,
    language: "English",
    format: "PDF + EPUB",
    coverImage:
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400",
    preview: "Discover the masterpieces that defined the Renaissance...",
    isbn: "978-1-567890-12-3",
    publisher: "Art World Publications",
    rating: 4.8,
    downloads: 6540,
    fileSize: "95.6 MB",
    tags: ["Art", "Renaissance", "History", "Culture"],
    content: `Chapter 1: The Renaissance Awakening\n\nThe Renaissance marked a rebirth of art and culture in Europe...\n\nExploring:\n• Italian Renaissance masters\n• Northern Renaissance developments\n• Artistic techniques and innovations\n• Cultural and historical context\n\nAppreciate the artistic revolution that changed Western art forever.`,
  },
  {
    id: 7,
    title: "Machine Learning Principles",
    author: "Dr. Alex Thompson",
    year: 2023,
    ddc: "006.31",
    category: "Computer Science",
    deweyCategory: "000-099",
    description: "Fundamental concepts and algorithms in machine learning.",
    price: 39.99,
    pages: 520,
    language: "English",
    format: "PDF + EPUB",
    coverImage:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
    preview:
      "Learn machine learning from theory to practical implementation...",
    isbn: "978-1-678901-23-4",
    publisher: "AI Press",
    rating: 4.9,
    downloads: 23450,
    fileSize: "78.9 MB",
    tags: ["Machine Learning", "AI", "Data Science", "Python"],
    content: `Chapter 1: Introduction to Machine Learning\n\nMachine learning enables computers to learn from data without explicit programming...`,
  },
  {
    id: 8,
    title: "Classical Literature Collection",
    author: "Prof. Elizabeth Brown",
    year: 2017,
    ddc: "808.8",
    category: "Literature",
    deweyCategory: "800-899",
    description:
      "Timeless works of classical literature with critical analysis.",
    price: 22.99,
    pages: 620,
    language: "English",
    format: "EPUB",
    coverImage:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    preview: "Explore the greatest works of classical literature...",
    isbn: "978-1-789012-34-5",
    publisher: "Literary Classics",
    rating: 4.7,
    downloads: 8760,
    fileSize: "82.4 MB",
    tags: ["Literature", "Classics", "Fiction", "Poetry"],
    content: `Chapter 1: The Epic Tradition\n\nClassical literature forms the foundation of Western literary tradition...`,
  },
  {
    id: 9,
    title: "Environmental Science Today",
    author: "Dr. Michael Green",
    year: 2022,
    ddc: "363.7",
    category: "Environmental Science",
    deweyCategory: "300-399",
    description: "Current issues and solutions in environmental conservation.",
    price: 28.99,
    pages: 380,
    language: "English",
    format: "PDF",
    coverImage:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    preview: "Understand modern environmental challenges and solutions...",
    isbn: "978-1-890123-45-6",
    publisher: "Eco Publications",
    rating: 4.5,
    downloads: 11230,
    fileSize: "58.3 MB",
    tags: ["Environment", "Science", "Conservation", "Ecology"],
    content: `Chapter 1: Our Changing Planet\n\nEnvironmental science addresses the complex interactions between humans and nature...`,
  },
  {
    id: 10,
    title: "Business Strategy Essentials",
    author: "Richard Davis",
    year: 2021,
    ddc: "658.4",
    category: "Business",
    deweyCategory: "600-699",
    description: "Strategic frameworks for modern business success.",
    price: 32.99,
    pages: 340,
    language: "English",
    format: "PDF + EPUB",
    coverImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    preview: "Master the art of business strategy and leadership...",
    isbn: "978-1-901234-56-7",
    publisher: "Business Press",
    rating: 4.4,
    downloads: 9870,
    fileSize: "46.7 MB",
    tags: ["Business", "Strategy", "Management", "Leadership"],
    content: `Chapter 1: Strategic Thinking\n\nEffective business strategy requires understanding market dynamics and competitive advantage...`,
  },
  {
    id: 11,
    title: "Children's Science Adventures",
    author: "Lisa Johnson",
    year: 2023,
    ddc: "J 500",
    category: "Children's Science",
    deweyCategory: "J 500-599",
    description: "Fun and educational science experiments for young learners.",
    price: 18.99,
    pages: 120,
    language: "English",
    format: "PDF",
    coverImage:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400",
    preview: "Spark curiosity with exciting science activities...",
    isbn: "978-2-012345-67-8",
    publisher: "Kids Learn Press",
    rating: 4.8,
    downloads: 15670,
    fileSize: "25.3 MB",
    tags: ["Children", "Science", "Education", "Activities"],
    content: `Chapter 1: Amazing Science Experiments\n\nScience is all around us! Let's explore the wonders of our world through fun experiments...`,
  },
  {
    id: 12,
    title: "Philosophy of Mind",
    author: "Dr. Thomas Wright",
    year: 2020,
    ddc: "128.2",
    category: "Philosophy",
    deweyCategory: "100-199",
    description: "Exploring consciousness, thought, and the nature of mind.",
    price: 29.99,
    pages: 410,
    language: "English",
    format: "PDF + EPUB",
    coverImage:
      "https://images.unsplash.com/photo-1581771515427-9d3b14c4d1e1?w=400",
    preview: "Deep dive into the philosophical questions of consciousness...",
    isbn: "978-2-123456-78-9",
    publisher: "Philosophical Press",
    rating: 4.6,
    downloads: 5430,
    fileSize: "51.8 MB",
    tags: ["Philosophy", "Mind", "Consciousness", "Psychology"],
    content: `Chapter 1: The Mind-Body Problem\n\nWhat is consciousness? How does the mind relate to the physical brain?...`,
  },
];

// Helper function to get book by ID
export const getBookById = (id) => {
  return booksData.find((book) => book.id === parseInt(id));
};

// Helper function to search books with improved filtering
export const searchBooks = (query, filters = {}) => {
  let results = [...booksData];

  // Text search across multiple fields
  if (query && query.trim()) {
    const searchTerm = query.toLowerCase().trim();
    results = results.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.description.toLowerCase().includes(searchTerm) ||
        book.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
        book.ddc.includes(query) ||
        book.category.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by Dewey category range
  if (filters.category && filters.category !== "") {
    if (filters.category.includes("-")) {
      const [start, end] = filters.category
        .split("-")
        .map((num) => parseInt(num));
      results = results.filter((book) => {
        const bookDewey = parseInt(book.ddc.split(".")[0]);
        return bookDewey >= start && bookDewey <= end;
      });
    }
  }

  // Filter by author
  if (filters.author && filters.author.trim()) {
    results = results.filter((book) =>
      book.author.toLowerCase().includes(filters.author.toLowerCase().trim())
    );
  }

  // Filter by year
  if (filters.year && filters.year.trim()) {
    results = results.filter((book) => book.year === parseInt(filters.year));
  }

  return results;
};

// Get books by category
export const getBooksByCategory = (deweyCategory) => {
  return booksData.filter((book) => book.deweyCategory === deweyCategory);
};

// Get featured books
export const getFeaturedBooks = (limit = 6) => {
  return booksData
    .sort((a, b) => b.rating - a.rating || b.downloads - a.downloads)
    .slice(0, limit);
};

// Get related books
export const getRelatedBooks = (bookId, limit = 3) => {
  const book = getBookById(bookId);
  if (!book) return [];

  return booksData
    .filter((b) => b.id !== book.id && b.category === book.category)
    .slice(0, limit);
};

// Convert to object format for Checkout page
export const booksDataObject = booksData.reduce((acc, book) => {
  acc[book.id] = book;
  return acc;
}, {});

// Get all unique categories for filtering
export const getAllCategories = () => {
  const categories = [...new Set(booksData.map((book) => book.deweyCategory))];
  return categories.sort();
};

// Get all unique authors for filtering
export const getAllAuthors = () => {
  const authors = [...new Set(booksData.map((book) => book.author))];
  return authors.sort();
};

// Get books by price range
export const getBooksByPriceRange = (minPrice, maxPrice) => {
  return booksData.filter(
    (book) => book.price >= minPrice && book.price <= maxPrice
  );
};

// Search books by tags
export const searchBooksByTags = (tags) => {
  return booksData.filter((book) =>
    tags.some((tag) => book.tags.includes(tag))
  );
};
// Helper to determine if book requires payment
export const isBookPaidContent = (book) => {
  return book.price > 0; // Or use explicit isPaidContent flag if you add it
};

// Helper to get free books
export const getFreeBooks = () => {
  return booksData.filter(book => book.price === 0);
};

// Helper to get paid books  
export const getPaidBooks = () => {
  return booksData.filter(book => book.price > 0);
};