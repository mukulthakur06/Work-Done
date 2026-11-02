// Workdone SQLite Database Engine using Node.js built-in node:sqlite
import { DatabaseSync } from 'node:sqlite';
import * as path from 'node:path';
import * as fs from 'node:fs';

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'workdone.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    initSchema(dbInstance);
  }
  return dbInstance;
}

export function initSchema(db: DatabaseSync): void {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CUSTOMER',
      name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_email_verified INTEGER NOT NULL DEFAULT 0,
      is_phone_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    -- Customer Profiles table
    CREATE TABLE IF NOT EXISTS customer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      address TEXT,
      city TEXT,
      locality TEXT,
      pin_code TEXT,
      preferred_contact TEXT DEFAULT 'IN_APP',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_customer_profiles_city ON customer_profiles(city);

    -- Professional Profiles table
    CREATE TABLE IF NOT EXISTS professional_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      business_name TEXT,
      bio TEXT NOT NULL,
      years_experience INTEGER NOT NULL DEFAULT 1,
      city TEXT NOT NULL,
      locality TEXT,
      pin_code TEXT,
      languages TEXT DEFAULT 'English',
      working_hours TEXT DEFAULT '9:00 AM - 6:00 PM, Mon-Sat',
      starting_price REAL DEFAULT 0,
      pricing_notes TEXT,
      availability_status TEXT NOT NULL DEFAULT 'AVAILABLE',
      availability_updated_at TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
      verification_notes TEXT,
      average_rating REAL NOT NULL DEFAULT 0.0,
      total_reviews INTEGER NOT NULL DEFAULT 0,
      completed_jobs_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_pro_profiles_city ON professional_profiles(city);
    CREATE INDEX IF NOT EXISTS idx_pro_profiles_verif ON professional_profiles(verification_status);
    CREATE INDEX IF NOT EXISTS idx_pro_profiles_avail ON professional_profiles(availability_status);
    CREATE INDEX IF NOT EXISTS idx_pro_profiles_rating ON professional_profiles(average_rating);

    -- Service Categories table
    CREATE TABLE IF NOT EXISTS service_categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      banner_image TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);

    -- Professional Services table
    CREATE TABLE IF NOT EXISTS professional_services (
      id TEXT PRIMARY KEY,
      pro_profile_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      description TEXT,
      base_rate REAL,
      rate_type TEXT DEFAULT 'PER_JOB',
      is_primary INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (pro_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS idx_pro_services_pro ON professional_services(pro_profile_id);
    CREATE INDEX IF NOT EXISTS idx_pro_services_cat ON professional_services(category_id);

    -- Service Areas table
    CREATE TABLE IF NOT EXISTS service_areas (
      id TEXT PRIMARY KEY,
      pro_profile_id TEXT NOT NULL,
      city TEXT NOT NULL,
      locality TEXT NOT NULL,
      pin_code TEXT,
      FOREIGN KEY (pro_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_service_areas_pro ON service_areas(pro_profile_id);
    CREATE INDEX IF NOT EXISTS idx_service_areas_city_loc ON service_areas(city, locality);

    -- Portfolio Projects table
    CREATE TABLE IF NOT EXISTS portfolio_projects (
      id TEXT PRIMARY KEY,
      pro_profile_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category_name TEXT NOT NULL,
      project_cost REAL,
      completion_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (pro_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_portfolio_pro ON portfolio_projects(pro_profile_id);

    -- Portfolio Media table
    CREATE TABLE IF NOT EXISTS portfolio_media (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      media_url TEXT NOT NULL,
      caption TEXT,
      is_cover INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES portfolio_projects(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_portfolio_media_proj ON portfolio_media(project_id);

    -- Availability Schedules table
    CREATE TABLE IF NOT EXISTS availability_schedules (
      id TEXT PRIMARY KEY,
      pro_profile_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_working_day INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (pro_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
      UNIQUE(pro_profile_id, day_of_week)
    );

    -- Unavailable Dates table
    CREATE TABLE IF NOT EXISTS unavailable_dates (
      id TEXT PRIMARY KEY,
      pro_profile_id TEXT NOT NULL,
      date TEXT NOT NULL,
      reason TEXT,
      FOREIGN KEY (pro_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_unavail_pro_date ON unavailable_dates(pro_profile_id, date);

    -- Bookings table
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      pro_profile_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      service_title TEXT NOT NULL,
      description TEXT NOT NULL,
      approximate_location TEXT NOT NULL,
      city TEXT NOT NULL,
      locality TEXT,
      pin_code TEXT,
      requested_date TEXT NOT NULL,
      confirmed_date TEXT,
      rescheduled_date TEXT,
      budget_range_min REAL,
      budget_range_max REAL,
      final_amount REAL,
      status TEXT NOT NULL DEFAULT 'REQUESTED',
      cancellation_reason TEXT,
      reschedule_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (pro_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_cust ON bookings(customer_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_pro ON bookings(pro_profile_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

    -- Booking Status History table
    CREATE TABLE IF NOT EXISTS booking_status_history (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_bsh_booking ON booking_status_history(booking_id);

    -- Estimates table
    CREATE TABLE IF NOT EXISTS estimates (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      estimate_number TEXT UNIQUE NOT NULL,
      labour_cost REAL NOT NULL DEFAULT 0,
      material_cost REAL NOT NULL DEFAULT 0,
      additional_charges REAL NOT NULL DEFAULT 0,
      total_cost REAL NOT NULL DEFAULT 0,
      estimated_duration TEXT NOT NULL,
      work_included TEXT NOT NULL,
      work_excluded TEXT,
      payment_terms TEXT,
      expires_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'SENT',
      customer_accepted_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_estimates_booking ON estimates(booking_id);

    -- Estimate Revisions table
    CREATE TABLE IF NOT EXISTS estimate_revisions (
      id TEXT PRIMARY KEY,
      estimate_id TEXT NOT NULL,
      revision_number INTEGER NOT NULL DEFAULT 1,
      labour_cost REAL NOT NULL,
      material_cost REAL NOT NULL,
      additional_charges REAL NOT NULL,
      total_cost REAL NOT NULL,
      change_reason TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_est_rev_estimate ON estimate_revisions(estimate_id);

    -- Reviews table (tied to completed booking)
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      booking_id TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      pro_profile_id TEXT NOT NULL,
      overall_rating INTEGER NOT NULL,
      punctuality_rating INTEGER NOT NULL,
      workmanship_rating INTEGER NOT NULL,
      communication_rating INTEGER NOT NULL,
      value_rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      photos TEXT,
      pro_response TEXT,
      pro_response_date TEXT,
      is_verified_booking INTEGER NOT NULL DEFAULT 1,
      is_moderated INTEGER NOT NULL DEFAULT 0,
      is_flagged INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (pro_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_pro ON reviews(pro_profile_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(overall_rating);

    -- Review Reports table
    CREATE TABLE IF NOT EXISTS review_reports (
      id TEXT PRIMARY KEY,
      review_id TEXT NOT NULL,
      reported_by TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      action_taken TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
      FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_rev_reports_review ON review_reports(review_id);

    -- Saved Professionals table
    CREATE TABLE IF NOT EXISTS saved_professionals (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      pro_profile_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (pro_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
      UNIQUE(customer_id, pro_profile_id)
    );

    -- Verification Records table
    CREATE TABLE IF NOT EXISTS verification_records (
      id TEXT PRIMARY KEY,
      pro_profile_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      document_type TEXT,
      document_number TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      verified_by TEXT,
      verified_at TEXT,
      rejection_reason TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (pro_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_verif_pro ON verification_records(pro_profile_id);
    CREATE INDEX IF NOT EXISTS idx_verif_status ON verification_records(status);

    -- Customer Complaints table
    CREATE TABLE IF NOT EXISTS customer_complaints (
      id TEXT PRIMARY KEY,
      complaint_number TEXT UNIQUE NOT NULL,
      booking_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      pro_profile_id TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      resolution_notes TEXT,
      resolved_by TEXT,
      resolved_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (pro_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON customer_complaints(status);

    -- Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      link_url TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

    -- Audit Logs table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
  `);
}

// Database helper functions with safe parameterized statements
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const db = getDb();
  const stmt = db.prepare(sql);
  const result = stmt.get(...params);
  return (result as T) || null;
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  const results = stmt.all(...params);
  return (results as T[]) || [];
}

export function execute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number | bigint } {
  const db = getDb();
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return {
    changes: Number(result.changes),
    lastInsertRowid: result.lastInsertRowid
  };
}

export function runTransaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec('BEGIN TRANSACTION;');
  try {
    const result = fn();
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
