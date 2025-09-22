const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function migratePasswords() {
  try {
    // Get all admins with plain text passwords
    const [admins] = await db.promise().execute('SELECT * FROM admins WHERE password NOT LIKE "$2%"');
    
    for (const admin of admins) {
      if (!admin.password.startsWith('$2')) {
        // Hash the plain text password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password, salt);
        
        // Update the admin record
        await db.promise().execute(
          'UPDATE admins SET password = ?, updated_at = NOW() WHERE id = ?',
          [hashedPassword, admin.id]
        );
        
        console.log(`Migrated password for admin ${admin.email}`);
      }
    }
    
    console.log('Password migration completed successfully');
  } catch (error) {
    console.error('Error migrating passwords:', error);
  }
}

// Run the migration
migratePasswords();