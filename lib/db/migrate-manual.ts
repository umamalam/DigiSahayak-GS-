import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'sqlite.db');
const db = new Database(dbPath);

console.log('Starting manual migration...');

try {
  db.exec(`
    -- Add new columns to users table
    ALTER TABLE users ADD COLUMN age INTEGER;
  `);
  console.log('✓ Added age column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error adding age:', e.message);
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN gender TEXT;`);
  console.log('✓ Added gender column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN occupation TEXT;`);
  console.log('✓ Added occupation column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN annual_income INTEGER;`);
  console.log('✓ Added annual_income column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN state TEXT;`);
  console.log('✓ Added state column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN district TEXT;`);
  console.log('✓ Added district column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN category TEXT;`);
  console.log('✓ Added category column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN marital_status TEXT;`);
  console.log('✓ Added marital_status column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN family_members INTEGER;`);
  console.log('✓ Added family_members column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN aadhaar_number TEXT UNIQUE;`);
  console.log('✓ Added aadhaar_number column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN pan_number TEXT UNIQUE;`);
  console.log('✓ Added pan_number column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

// Add columns to user_documents
try {
  db.exec(`ALTER TABLE user_documents ADD COLUMN verified_by INTEGER REFERENCES users(id);`);
  console.log('✓ Added verified_by column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE user_documents ADD COLUMN verification_notes TEXT;`);
  console.log('✓ Added verification_notes column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE user_documents ADD COLUMN verified_at INTEGER;`);
  console.log('✓ Added verified_at column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

// Add columns to user_applications
try {
  db.exec(`ALTER TABLE user_applications ADD COLUMN application_number TEXT UNIQUE;`);
  console.log('✓ Added application_number column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE user_applications ADD COLUMN attached_documents TEXT;`);
  console.log('✓ Added attached_documents column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE user_applications ADD COLUMN form_data TEXT;`);
  console.log('✓ Added form_data column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE user_applications ADD COLUMN review_notes TEXT;`);
  console.log('✓ Added review_notes column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE user_applications ADD COLUMN reviewed_by INTEGER REFERENCES users(id);`);
  console.log('✓ Added reviewed_by column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

try {
  db.exec(`ALTER TABLE user_applications ADD COLUMN reviewed_at INTEGER;`);
  console.log('✓ Added reviewed_at column');
} catch (e: any) {
  if (!e.message.includes('duplicate column')) console.error('Error:', e.message);
}

// Create notifications table
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0 NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      created_at INTEGER NOT NULL
    );
  `);
  console.log('✓ Created notifications table');
} catch (e: any) {
  console.error('Error creating notifications:', e.message);
}

// Create favorite_schemes table
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorite_schemes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      scheme_id INTEGER NOT NULL REFERENCES schemes(id),
      created_at INTEGER NOT NULL,
      UNIQUE(user_id, scheme_id)
    );
  `);
  console.log('✓ Created favorite_schemes table');
} catch (e: any) {
  console.error('Error creating favorite_schemes:', e.message);
}

// Update existing applications to have application numbers
try {
  const apps = db.prepare('SELECT id FROM user_applications WHERE application_number IS NULL').all();
  const updateStmt = db.prepare('UPDATE user_applications SET application_number = ?, status = ? WHERE id = ?');
  
  for (const app of apps as { id: number }[]) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const appNumber = `APP${timestamp}${random}`;
    updateStmt.run(appNumber, 'submitted', app.id);
  }
  console.log(`✓ Updated ${apps.length} applications with application numbers`);
} catch (e: any) {
  console.error('Error updating applications:', e.message);
}

console.log('\n✅ Migration completed successfully!');

db.close();
