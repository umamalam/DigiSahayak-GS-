import Database from 'better-sqlite3';

const sqlite = new Database('sqlite.db');

console.log('📊 Creating database tables...');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_verified INTEGER NOT NULL DEFAULT 0,
    otp TEXT,
    otp_expiry INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    ministry TEXT NOT NULL,
    description TEXT NOT NULL,
    benefits TEXT NOT NULL,
    eligibility TEXT,
    not_eligible TEXT,
    required_documents TEXT,
    how_to_apply TEXT,
    processing_time TEXT,
    scheme_validity TEXT,
    common_mistakes TEXT,
    additional_notes TEXT,
    official_link TEXT,
    image_url TEXT,
    launch_year TEXT,
    helpline_phone TEXT,
    helpline_email TEXT,
    pdf_guideline TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    document_type TEXT NOT NULL,
    source_label TEXT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    content_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploaded',
    uploaded_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    scheme_id INTEGER NOT NULL REFERENCES schemes(id),
    status TEXT NOT NULL,
    applied_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS password_reset (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    scheme_id INTEGER REFERENCES schemes(id),
    ticket_number TEXT,
    title TEXT,
    subject TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    response TEXT,
    assigned_to INTEGER REFERENCES users(id),
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  );
`);

console.log('✅ Database tables created successfully');

sqlite.close();
