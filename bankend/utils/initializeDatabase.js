// utils/initializeDatabase.js - MongoDB Version
import { getDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

export default async function initializeDatabase() {
  try {
    console.log("🔧 Starting database initialization...");

    const db = await getDatabase();
    console.log("✅ MongoDB connected successfully");

    console.log("🔄 Checking collections...");

    // List of required collections (tables in MySQL)
    const collections = [
      'books',
      'users',
      'articles', 
      'webinars',
      'webinar_registrations',
      'affiliates',
      'categories',
      'orders',
      'reviews',
      'transactions'
    ];

    // Check which collections exist
    const existingCollections = await db.listCollections().toArray();
    const existingCollectionNames = existingCollections.map(c => c.name);
    
    console.log("📁 Existing collections:", existingCollectionNames);

    // Create collections if they don't exist
    for (const collectionName of collections) {
      if (!existingCollectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`📁 Collection exists: ${collectionName}`);
      }
    }

    // Create indexes (similar to MySQL indexes)
    console.log("🔍 Creating indexes...");

    // Books collection indexes
    try {
      await db.collection('books').createIndex({ title: 1 });
      await db.collection('books').createIndex({ isbn: 1 }, { unique: true, sparse: true });
      await db.collection('books').createIndex({ category: 1 });
      await db.collection('books').createIndex({ status: 1 });
      await db.collection('books').createIndex({ featured: 1 });
      console.log("✅ Created books indexes");
    } catch (error) {
      console.log("📝 Books indexes already exist or error:", error.message);
    }

    // Users collection indexes
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ role: 1 });
      await db.collection('users').createIndex({ affiliate_status: 1 });
      await db.collection('users').createIndex({ affiliate_code: 1 }, { unique: true, sparse: true });
      console.log("✅ Created users indexes");
    } catch (error) {
      console.log("📝 Users indexes already exist or error:", error.message);
    }

    // Articles collection indexes
    try {
      await db.collection('articles').createIndex({ title: 1 });
      await db.collection('articles').createIndex({ category: 1 });
      await db.collection('articles').createIndex({ status: 1 });
      await db.collection('articles').createIndex({ featured: 1 });
      console.log("✅ Created articles indexes");
    } catch (error) {
      console.log("📝 Articles indexes already exist or error:", error.message);
    }

    // Webinars collection indexes
    try {
      await db.collection('webinars').createIndex({ date: 1 });
      await db.collection('webinars').createIndex({ status: 1 });
      await db.collection('webinars').createIndex({ category: 1 });
      console.log("✅ Created webinars indexes");
    } catch (error) {
      console.log("📝 Webinars indexes already exist or error:", error.message);
    }

    // Webinar registrations indexes
    try {
      await db.collection('webinar_registrations').createIndex({ webinar_id: 1, email: 1 }, { unique: true });
      await db.collection('webinar_registrations').createIndex({ webinar_id: 1 });
      console.log("✅ Created webinar_registrations indexes");
    } catch (error) {
      console.log("📝 Webinar registrations indexes already exist or error:", error.message);
    }

    console.log("✅ Database initialization completed");

    // Seed initial admin user if not exists
    await seedInitialData(db);

  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  }
}

async function seedInitialData(db) {
  try {
    console.log("🌱 Checking for initial data...");

    // Check if admin user exists
    const adminExists = await db.collection('users').findOne({ 
      email: 'admin@communiversity.com' 
    });

    if (!adminExists) {
      console.log("👤 Creating admin user...");
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = {
        name: 'Admin User',
        email: 'admin@communiversity.com',
        password: hashedPassword,
        role: 'admin',
        affiliate_status: 'approved',
        affiliate_code: 'ADMIN001',
        total_referrals: 0,
        total_earnings: 0,
        pending_earnings: 0,
        join_date: new Date(),
        last_login: null,
        bio: 'System Administrator',
        profile_image: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      await db.collection('users').insertOne(adminUser);
      console.log("✅ Created admin user");
    } else {
      console.log("👤 Admin user already exists");
    }

    // Check if we have at least one test book
    const booksCount = await db.collection('books').countDocuments();
    
    if (booksCount === 0) {
      console.log("📚 Creating sample book...");
      
      const sampleBook = {
        title: 'Getting Started with MongoDB',
        author: 'John Doe',
        description: 'A comprehensive guide to MongoDB for beginners',
        isbn: '978-1234567890',
        category: 'Technology',
        dewey_number: '005.75',
        price: 29.99,
        format: 'digital',
        cover_image: 'sample-cover.jpg',
        file_url: 'sample-book.pdf',
        file_size: '2.5MB',
        pages: 300,
        publisher: 'Tech Publications',
        published_date: new Date('2024-01-15'),
        language: 'English',
        tags: ['MongoDB', 'Database', 'Programming'],
        rating: 4.5,
        total_ratings: 120,
        downloads: 500,
        status: 'available',
        total_copies: 1,
        available_copies: 1,
        featured: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      await db.collection('books').insertOne(sampleBook);
      console.log("✅ Created sample book");
    }

    // Check if we have at least one test article
    const articlesCount = await db.collection('articles').countDocuments();
    
    if (articlesCount === 0) {
      console.log("📰 Creating sample article...");
      
      const sampleArticle = {
        title: 'Introduction to Node.js and Express',
        content: 'This is a comprehensive guide to getting started with Node.js and Express framework...',
        excerpt: 'Learn how to build web applications with Node.js and Express',
        author: 'Jane Smith',
        category: 'Web Development',
        image_url: 'nodejs-article.jpg',
        file_url: 'nodejs-guide.pdf',
        file_name: 'nodejs-guide.pdf',
        file_type: 'application/pdf',
        file_size: 1024000,
        dewey_decimal: '005.276',
        amount: 0,
        views: 150,
        read_time: 8,
        published_date: new Date('2024-02-01'),
        status: 'published',
        featured: true,
        tags: ['Node.js', 'Express', 'JavaScript', 'Backend'],
        created_at: new Date(),
        updated_at: new Date()
      };

      await db.collection('articles').insertOne(sampleArticle);
      console.log("✅ Created sample article");
    }

    // Check if we have at least one test webinar
    const webinarsCount = await db.collection('webinars').countDocuments();
    
    if (webinarsCount === 0) {
      console.log("🎤 Creating sample webinar...");
      
      // Create a future date for the webinar
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
      futureDate.setHours(14, 0, 0, 0); // 2:00 PM

      const sampleWebinar = {
        title: 'Introduction to Cloud Computing',
        description: 'Learn the fundamentals of cloud computing and how to get started',
        speaker: 'Dr. Michael Chen',
        speaker_bio: 'Cloud Architect with 10+ years of experience',
        date: futureDate,
        duration: 90, // 90 minutes
        max_attendees: 100,
        current_attendees: 0,
        join_link: 'https://meet.google.com/abc-defg-hij',
        recording_link: null,
        status: 'scheduled',
        image_url: 'cloud-webinar.jpg',
        price: 0,
        is_premium: false,
        category: 'Technology',
        tags: ['Cloud Computing', 'AWS', 'Azure', 'GCP'],
        created_at: new Date(),
        updated_at: new Date()
      };

      await db.collection('webinars').insertOne(sampleWebinar);
      console.log("✅ Created sample webinar");
    }

    // Create default categories
    const defaultCategories = [
      { name: 'Technology', type: 'book', description: 'Technology and programming books', created_at: new Date() },
      { name: 'Business', type: 'book', description: 'Business and entrepreneurship', created_at: new Date() },
      { name: 'Science', type: 'book', description: 'Scientific books and research', created_at: new Date() },
      { name: 'Education', type: 'book', description: 'Educational materials', created_at: new Date() },
      { name: 'Web Development', type: 'article', description: 'Web development articles', created_at: new Date() },
      { name: 'Data Science', type: 'article', description: 'Data science and analytics', created_at: new Date() },
      { name: 'Cloud Computing', type: 'webinar', description: 'Cloud technology webinars', created_at: new Date() },
      { name: 'Digital Marketing', type: 'webinar', description: 'Marketing and sales webinars', created_at: new Date() }
    ];

    for (const category of defaultCategories) {
      const exists = await db.collection('categories').findOne({ 
        name: category.name,
        type: category.type 
      });

      if (!exists) {
        await db.collection('categories').insertOne(category);
        console.log(`✅ Created category: ${category.name} (${category.type})`);
      }
    }

    console.log("🌱 Initial data seeding completed");

  } catch (error) {
    console.error("❌ Error seeding initial data:", error);
    // Don't throw error, just log it
  }
}