const db = require('./config/database');

async function testArticles() {
  try {
    console.log('🧪 Testing articles query...');
    const [articles] = await db.execute('SELECT * FROM articles WHERE status = "published" LIMIT 5');
    console.log('✅ Articles found:', articles.length);
    console.log('Sample article:', articles[0]?.title);
  } catch (error) {
    console.error('❌ Articles test failed:', error.message);
  }
}

async function testWebinars() {
  try {
    console.log('🧪 Testing webinars query...');
    const [webinars] = await db.execute('SELECT * FROM webinars WHERE status = "scheduled" LIMIT 5');
    console.log('✅ Webinars found:', webinars.length);
    console.log('Sample webinar:', webinars[0]?.title);
  } catch (error) {
    console.error('❌ Webinars test failed:', error.message);
  }
}

async function runTests() {
  await testArticles();
  await testWebinars();
  process.exit();
}

runTests();