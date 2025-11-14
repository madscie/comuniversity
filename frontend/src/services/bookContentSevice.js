export const generateBookContent = (book) => {
  if (!book) return { chapters: [], totalPages: 0 };

  const bookTitle = book.title || "Unknown Title";
  const bookAuthor = book.author || "Unknown Author";
  const bookCategory = book.category || "General";
  const bookDescription =
    book.description || "This book covers various topics in depth.";

  const chapters = [
    {
      id: 1,
      title: "Introduction",
      pages: [
        `# ${bookTitle}\n\n## by ${bookAuthor}\n\n---\n\n*"The journey of a thousand miles begins with a single step."*\n\n## Introduction\n\nWelcome to "${bookTitle}", a comprehensive exploration of ${bookCategory.toLowerCase()}. This book represents years of research and practical insights into ${bookDescription.toLowerCase()}.\n\nIn these pages, you'll discover valuable information that can transform your understanding and application of these concepts.`,
        `## What You'll Learn\n\n• **Fundamental Concepts**: Master the core principles\n• **Practical Applications**: Real-world examples and case studies\n• **Advanced Techniques**: Professional strategies\n• **Best Practices**: Industry standards and methodologies\n\nThis book is designed to be your comprehensive guide for mastering ${bookCategory.toLowerCase()}.`,
        `## Who This Book Is For\n\n### Perfect For:\n• **Students & Academics** seeking knowledge\n• **Professionals** looking to enhance skills\n• **Enthusiasts** passionate about learning\n• **Lifelong Learners** committed to growth\n\nLet's begin this exciting journey together into the world of ${bookCategory.toLowerCase()}.`,
      ],
    },
    {
      id: 2,
      title: "Fundamental Concepts",
      pages: [
        `## Chapter 1: Fundamental Concepts\n\n### Understanding the Basics\n\nEvery field has its foundational principles, and ${bookCategory} is no exception. In this chapter, we explore the core concepts that form the bedrock of this discipline.\n\n### Key Principles\n\n1. **Foundation**: The fundamental building blocks\n2. **Application**: How concepts translate to practice\n3. **Integration**: Connecting different elements\n4. **Evolution**: How the field develops over time\n\nThese principles provide the framework for everything that follows.`,
        `## Historical Context\n\nThe study of ${bookCategory.toLowerCase()} has evolved significantly. Understanding this evolution helps contextualize current practices and future directions.\n\n### Major Milestones:\n- **Early Foundations**: Basic principles established\n- **Modern Development**: Rapid advancement\n- **Contemporary Era**: Integration with new methodologies\n\nThis perspective helps us appreciate progress and anticipate future trends.`,
      ],
    },
    {
      id: 3,
      title: "Advanced Applications",
      pages: [
        `## Chapter 2: Advanced Applications\n\n### Beyond the Basics\n\nNow that we understand the fundamentals, let's explore complex scenarios and advanced contexts where theory meets practice.\n\n### Complex Systems Analysis\n\nAdvanced applications involve:\n• **Multiple Components**: Understanding interactions\n• **Dynamic Environments**: Working with change\n• **Optimization**: Finding efficient solutions\n\nThese factors make real-world applications both challenging and rewarding.`,
        `## Case Study: Real-World Implementation\n\n### The Challenge\nAn organization faced challenges in implementing ${bookCategory.toLowerCase()} principles while dealing with real-world constraints.\n\n### The Solution\nBy applying core principles, they achieved significant improvements in efficiency and outcomes.\n\n### Key Takeaways\n• The importance of strategic thinking\n• How principles translate to real results\n• Lessons for future implementations`,
      ],
    },
    {
      id: 4,
      title: "Future Directions & Conclusion",
      pages: [
        `## Chapter 3: Future Directions\n\n### Emerging Trends\n\nThe field of ${bookCategory.toLowerCase()} continues to evolve with new technologies and methodologies.\n\n### Technological Impact\n\nNew tools are revolutionizing our approach:\n• **Artificial Intelligence**: Enhanced capabilities\n• **Data Analytics**: Deeper insights\n• **Collaboration**: Improved knowledge sharing\n\nThese advancements open up exciting new possibilities.`,
        `## Conclusion\n\nThank you for reading "${bookTitle}". We hope this journey has been valuable and that you feel equipped to apply these concepts.\n\n### Final Thoughts\n\n"*The beautiful thing about learning is that no one can take it away from you.*" - B.B. King\n\nRemember that mastery comes through consistent practice and application. Continue your learning journey with curiosity and dedication.\n\n---\n\n*This concludes "${bookTitle}". We hope it has been valuable to you.*`,
      ],
    },
  ];

  const totalPages = chapters.reduce(
    (total, chapter) => total + chapter.pages.length,
    0
  );

  return { chapters, totalPages };
};
