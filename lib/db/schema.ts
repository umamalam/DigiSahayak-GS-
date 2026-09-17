import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'), // 'user', 'admin', or 'employee'
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  otp: text('otp'),
  otpExpiry: integer('otp_expiry', { mode: 'timestamp' }),
  
  // Enhanced Profile Fields
  age: integer('age'),
  gender: text('gender'), // 'male', 'female', 'other'
  occupation: text('occupation'),
  annualIncome: integer('annual_income'),
  state: text('state'),
  district: text('district'),
  category: text('category'), // 'general', 'sc', 'st', 'obc'
  maritalStatus: text('marital_status'), // 'single', 'married', 'divorced', 'widowed'
  familyMembers: integer('family_members'),
  aadhaarNumber: text('aadhaar_number').unique(),
  panNumber: text('pan_number').unique(),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const schemes = sqliteTable('schemes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  ministry: text('ministry').notNull(),
  description: text('description').notNull(),
  benefits: text('benefits').notNull(),
  eligibility: text('eligibility'),
  notEligible: text('not_eligible'),
  requiredDocuments: text('required_documents'),
  howToApply: text('how_to_apply'),
  processingTime: text('processing_time'),
  schemeValidity: text('scheme_validity'),
  commonMistakes: text('common_mistakes'),
  additionalNotes: text('additional_notes'),
  officialLink: text('official_link'),
  imageUrl: text('image_url'),
  launchYear: text('launch_year'),
  helplinePhone: text('helpline_phone'),
  helplineEmail: text('helpline_email'),
  pdfGuideline: text('pdf_guideline'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const userDocuments = sqliteTable('user_documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  documentType: text('document_type').notNull(), // Normalized key for matching (e.g., "aadhaar", "birth_certificate")
  sourceLabel: text('source_label'), // Original label from scheme (e.g., "Birth certificate", "Father's service certificate")
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  contentType: text('content_type').notNull(),
  status: text('status').notNull().default('uploaded'), // 'uploaded', 'pending_verification', 'verified', 'rejected'
  verifiedBy: integer('verified_by').references(() => users.id), // Employee/Admin who verified
  verificationNotes: text('verification_notes'), // Reason for rejection or verification notes
  verifiedAt: integer('verified_at', { mode: 'timestamp' }),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const userApplications = sqliteTable('user_applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  schemeId: integer('scheme_id').notNull().references(() => schemes.id),
  applicationNumber: text('application_number').notNull().unique(), // Unique application number
  status: text('status').notNull().default('submitted'), // 'submitted', 'under_review', 'approved', 'rejected', 'on_hold'
  attachedDocuments: text('attached_documents'), // JSON array of document IDs
  formData: text('form_data'), // JSON data from application form
  reviewNotes: text('review_notes'), // Admin/Employee notes
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  appliedAt: integer('applied_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const passwordReset = sqliteTable('password_reset', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  otp: text('otp').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const tickets = sqliteTable('tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  schemeId: integer('scheme_id').references(() => schemes.id),
  ticketNumber: text('ticket_number'),
  title: text('title'),
  subject: text('subject'),
  description: text('description').notNull(),
  status: text('status').notNull().default('open'), // 'open', 'in_progress', 'resolved', 'closed'
  priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
  response: text('response'),
  assignedTo: integer('assigned_to').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'application_status', 'document_verification', 'ticket_response', 'new_scheme', 'deadline'
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'), // URL to navigate when clicked
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  entityType: text('entity_type'), // 'application', 'document', 'ticket', 'scheme'
  entityId: integer('entity_id'), // ID of the related entity
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const favoriteSchemes = sqliteTable('favorite_schemes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  schemeId: integer('scheme_id').notNull().references(() => schemes.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Scheme = typeof schemes.$inferSelect;
export type UserDocument = typeof userDocuments.$inferSelect;
export type UserApplication = typeof userApplications.$inferSelect;
export type PasswordReset = typeof passwordReset.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type FavoriteScheme = typeof favoriteSchemes.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type NewScheme = typeof schemes.$inferInsert;
export type NewUserDocument = typeof userDocuments.$inferInsert;
export type NewUserApplication = typeof userApplications.$inferInsert;
export type NewPasswordReset = typeof passwordReset.$inferInsert;
export type NewTicket = typeof tickets.$inferInsert;
export type NewNotification = typeof notifications.$inferInsert;
export type NewFavoriteScheme = typeof favoriteSchemes.$inferInsert;
