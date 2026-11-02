// Workdone User & Profile Service
import * as crypto from 'node:crypto';
import { queryOne, queryAll, execute, runTransaction } from '../db/database.ts';
import { hashPassword, verifyPassword, isValidEmail, isValidPassword, logAuditEvent } from '../auth/auth.ts';
import type { User, CustomerProfile, UserRole, SessionData } from '../types/index.ts';

export interface RegisterCustomerInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  locality?: string;
  pinCode?: string;
}

export interface RegisterProInput {
  name: string;
  businessName?: string;
  email: string;
  password: string;
  phone?: string;
  primaryServiceSlug: string;
  additionalServiceSlugs?: string[];
  yearsExperience: number;
  city: string;
  locality?: string;
  pinCode?: string;
  languages?: string;
  bio: string;
  workingHours?: string;
  startingPrice?: number;
}

export function registerCustomer(input: RegisterCustomerInput): { success: boolean; user?: User; error?: string } {
  if (!isValidEmail(input.email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  const passCheck = isValidPassword(input.password);
  if (!passCheck.valid) {
    return { success: false, error: passCheck.message };
  }
  if (!input.name || input.name.trim().length < 2) {
    return { success: false, error: 'Full name is required (minimum 2 characters).' };
  }

  const existing = queryOne<{ id: string }>('SELECT id FROM users WHERE email = ?', [input.email.toLowerCase().trim()]);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  return runTransaction(() => {
    const userId = crypto.randomUUID();
    const custProfileId = crypto.randomUUID();
    const now = new Date().toISOString();
    const passHash = hashPassword(input.password);

    execute(
      `INSERT INTO users (id, email, password_hash, role, name, phone, avatar_url, is_active, is_email_verified, is_phone_verified, created_at, updated_at)
       VALUES (?, ?, ?, 'CUSTOMER', ?, ?, NULL, 1, 1, 0, ?, ?)`,
      [userId, input.email.toLowerCase().trim(), passHash, input.name.trim(), input.phone || null, now, now]
    );

    execute(
      `INSERT INTO customer_profiles (id, user_id, address, city, locality, pin_code, preferred_contact, created_at, updated_at)
       VALUES (?, ?, NULL, ?, ?, ?, 'IN_APP', ?, ?)`,
      [custProfileId, userId, input.city || null, input.locality || null, input.pinCode || null, now, now]
    );

    logAuditEvent(userId, 'REGISTER_CUSTOMER', 'USER', userId, { email: input.email });

    const created = getUserById(userId);
    return { success: true, user: created || undefined };
  });
}

export function registerProfessional(input: RegisterProInput): { success: boolean; user?: User; proProfileId?: string; error?: string } {
  if (!isValidEmail(input.email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  const passCheck = isValidPassword(input.password);
  if (!passCheck.valid) {
    return { success: false, error: passCheck.message };
  }
  if (!input.name || input.name.trim().length < 2) {
    return { success: false, error: 'Full name is required (minimum 2 characters).' };
  }
  if (!input.city || input.city.trim().length < 2) {
    return { success: false, error: 'Primary service city is required.' };
  }
  if (!input.bio || input.bio.trim().length < 15) {
    return { success: false, error: 'Please provide a professional bio/introduction (minimum 15 characters).' };
  }

  const existing = queryOne<{ id: string }>('SELECT id FROM users WHERE email = ?', [input.email.toLowerCase().trim()]);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  return runTransaction(() => {
    const userId = crypto.randomUUID();
    const proProfileId = crypto.randomUUID();
    const now = new Date().toISOString();
    const passHash = hashPassword(input.password);

    execute(
      `INSERT INTO users (id, email, password_hash, role, name, phone, avatar_url, is_active, is_email_verified, is_phone_verified, created_at, updated_at)
       VALUES (?, ?, ?, 'PROFESSIONAL', ?, ?, NULL, 1, 1, 0, ?, ?)`,
      [userId, input.email.toLowerCase().trim(), passHash, input.name.trim(), input.phone || null, now, now]
    );

    execute(
      `INSERT INTO professional_profiles (
         id, user_id, business_name, bio, years_experience, city, locality, pin_code,
         languages, working_hours, starting_price, pricing_notes, availability_status,
         availability_updated_at, verification_status, verification_notes, average_rating,
         total_reviews, completed_jobs_count, created_at, updated_at
       ) VALUES (
         ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'AVAILABLE', ?, 'PENDING_REVIEW', 'Registration submitted. Verification in progress.',
         0.0, 0, 0, ?, ?
       )`,
      [
        proProfileId,
        userId,
        input.businessName || null,
        input.bio.trim(),
        Math.max(1, Number(input.yearsExperience) || 1),
        input.city.trim(),
        input.locality || null,
        input.pinCode || null,
        input.languages || 'English',
        input.workingHours || '9:00 AM - 6:00 PM, Mon-Sat',
        Math.max(0, Number(input.startingPrice) || 0),
        now,
        now,
        now
      ]
    );

    // Primary service association
    if (input.primaryServiceSlug) {
      const cat = queryOne<{ id: string; name: string }>('SELECT id, name FROM service_categories WHERE slug = ?', [input.primaryServiceSlug]);
      if (cat) {
        execute(
          `INSERT INTO professional_services (id, pro_profile_id, category_id, service_name, description, base_rate, rate_type, is_primary)
           VALUES (?, ?, ?, ?, ?, ?, 'PER_JOB', 1)`,
          [crypto.randomUUID(), proProfileId, cat.id, cat.name, 'Primary service offerings', input.startingPrice || 0]
        );
      }
    }

    // Additional services
    if (Array.isArray(input.additionalServiceSlugs)) {
      for (const slug of input.additionalServiceSlugs) {
        if (slug !== input.primaryServiceSlug) {
          const addCat = queryOne<{ id: string; name: string }>('SELECT id, name FROM service_categories WHERE slug = ?', [slug]);
          if (addCat) {
            execute(
              `INSERT INTO professional_services (id, pro_profile_id, category_id, service_name, description, base_rate, rate_type, is_primary)
               VALUES (?, ?, ?, ?, ?, ?, 'PER_JOB', 0)`,
              [crypto.randomUUID(), proProfileId, addCat.id, addCat.name, 'Additional service', 0]
            );
          }
        }
      }
    }

    // Default primary service area
    execute(
      `INSERT INTO service_areas (id, pro_profile_id, city, locality, pin_code)
       VALUES (?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), proProfileId, input.city.trim(), input.locality || 'All Localities', input.pinCode || null]
    );

    // Default availability schedule (Mon-Sat 9:00 AM - 6:00 PM)
    for (let day = 1; day <= 6; day++) {
      execute(
        `INSERT INTO availability_schedules (id, pro_profile_id, day_of_week, start_time, end_time, is_working_day)
         VALUES (?, ?, ?, '09:00', '18:00', 1)`,
        [crypto.randomUUID(), proProfileId, day]
      );
    }
    // Sunday closed by default
    execute(
      `INSERT INTO availability_schedules (id, pro_profile_id, day_of_week, start_time, end_time, is_working_day)
       VALUES (?, ?, 0, '09:00', '18:00', 0)`,
      [crypto.randomUUID(), proProfileId]
    );

    // Initial verification record for review
    execute(
      `INSERT INTO verification_records (id, pro_profile_id, stage, document_type, document_number, status, notes, created_at)
       VALUES (?, ?, 'IDENTITY', 'GOVERNMENT_ID', 'Submitted during signup', 'PENDING', 'Self-registered. Pending admin review.', ?)`,
      [crypto.randomUUID(), proProfileId, now]
    );

    logAuditEvent(userId, 'REGISTER_PROFESSIONAL', 'USER', userId, {
      businessName: input.businessName,
      city: input.city,
      primaryService: input.primaryServiceSlug
    });

    return { success: true, user: getUserById(userId) || undefined, proProfileId };
  });
}

export function authenticateUser(email: string, password: string): { success: boolean; session?: SessionData; error?: string } {
  if (!email || !password) {
    return { success: false, error: 'Please provide both email and password.' };
  }

  const user = queryOne<any>('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  if (!user.is_active) {
    return { success: false, error: 'This account has been deactivated or suspended. Please contact support.' };
  }

  if (!verifyPassword(password, user.password_hash)) {
    return { success: false, error: 'Invalid email or password.' };
  }

  let custProfileId: string | undefined;
  let proProfileId: string | undefined;

  if (user.role === 'CUSTOMER') {
    const cust = queryOne<{ id: string }>('SELECT id FROM customer_profiles WHERE user_id = ?', [user.id]);
    custProfileId = cust?.id;
  } else if (user.role === 'PROFESSIONAL') {
    const pro = queryOne<{ id: string }>('SELECT id FROM professional_profiles WHERE user_id = ?', [user.id]);
    proProfileId = pro?.id;
  }

  const session: SessionData = {
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name,
    customerProfileId: custProfileId,
    proProfileId: proProfileId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  };

  logAuditEvent(user.id, 'LOGIN', 'USER', user.id);

  return { success: true, session };
}

export function getUserById(userId: string): User | null {
  const row = queryOne<any>('SELECT * FROM users WHERE id = ?', [userId]);
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    name: row.name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    isActive: Boolean(row.is_active),
    isEmailVerified: Boolean(row.is_email_verified),
    isPhoneVerified: Boolean(row.is_phone_verified),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function getCustomerProfileByUserId(userId: string): CustomerProfile | null {
  const row = queryOne<any>('SELECT * FROM customer_profiles WHERE user_id = ?', [userId]);
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    address: row.address,
    city: row.city,
    locality: row.locality,
    pinCode: row.pin_code,
    preferredContact: row.preferred_contact || 'IN_APP',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function updateCustomerProfile(userId: string, data: { name?: string; phone?: string; city?: string; locality?: string; pinCode?: string; address?: string }): { success: boolean; error?: string } {
  const now = new Date().toISOString();
  return runTransaction(() => {
    if (data.name || data.phone !== undefined) {
      execute(
        `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), updated_at = ? WHERE id = ?`,
        [data.name || null, data.phone !== undefined ? data.phone : null, now, userId]
      );
    }
    execute(
      `UPDATE customer_profiles SET city = COALESCE(?, city), locality = COALESCE(?, locality), pin_code = COALESCE(?, pin_code), address = COALESCE(?, address), updated_at = ? WHERE user_id = ?`,
      [data.city || null, data.locality || null, data.pinCode || null, data.address || null, now, userId]
    );
    return { success: true };
  });
}
