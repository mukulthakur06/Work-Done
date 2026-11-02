// Workdone Professional Service & Search Engine
import * as crypto from 'node:crypto';
import { queryOne, queryAll, execute, runTransaction } from '../db/database.ts';
import type {
  ProfessionalProfile,
  PortfolioProject,
  PortfolioMedia,
  AvailabilityStatus,
  VerificationStatus,
  AvailabilitySchedule
} from '../types/index.ts';

export interface SearchFilters {
  keyword?: string;
  categorySlug?: string;
  city?: string;
  minRating?: number;
  experience?: string; // '0-2', '3-5', '6-10', '10+'
  verification?: string; // 'all', 'verified', 'fully_verified'
  availability?: string; // 'all', 'available'
  sortBy?: 'rating' | 'experience' | 'reviews' | 'price_asc';
  page?: number;
  pageSize?: number;
}

export function searchProfessionals(filters: SearchFilters): {
  professionals: (ProfessionalProfile & { primaryServiceName?: string; coverImage?: string })[];
  total: number;
  page: number;
  totalPages: number;
} {
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(filters.pageSize) || 12));
  const offset = (page - 1) * pageSize;

  let whereClauses: string[] = ['u.is_active = 1'];
  let params: any[] = [];

  // Keyword search (searches user name, business name, bio, service names)
  if (filters.keyword && filters.keyword.trim().length > 0) {
    const kw = `%${filters.keyword.trim().toLowerCase()}%`;
    whereClauses.push(`(
      LOWER(u.name) LIKE ? OR
      LOWER(COALESCE(p.business_name, '')) LIKE ? OR
      LOWER(p.bio) LIKE ? OR
      EXISTS (
        SELECT 1 FROM professional_services ps
        WHERE ps.pro_profile_id = p.id AND LOWER(ps.service_name) LIKE ?
      )
    )`);
    params.push(kw, kw, kw, kw);
  }

  // Category filter
  if (filters.categorySlug && filters.categorySlug !== 'all') {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM professional_services ps
      JOIN service_categories sc ON ps.category_id = sc.id
      WHERE ps.pro_profile_id = p.id AND sc.slug = ?
    )`);
    params.push(filters.categorySlug);
  }

  // City / Locality filter
  if (filters.city && filters.city.trim().length > 0 && filters.city !== 'all') {
    const cityPattern = `%${filters.city.trim().toLowerCase()}%`;
    whereClauses.push(`(
      LOWER(p.city) LIKE ? OR
      LOWER(COALESCE(p.locality, '')) LIKE ? OR
      EXISTS (
        SELECT 1 FROM service_areas sa
        WHERE sa.pro_profile_id = p.id AND (LOWER(sa.city) LIKE ? OR LOWER(sa.locality) LIKE ?)
      )
    )`);
    params.push(cityPattern, cityPattern, cityPattern, cityPattern);
  }

  // Minimum Rating filter
  if (filters.minRating && Number(filters.minRating) > 0) {
    whereClauses.push('p.average_rating >= ?');
    params.push(Number(filters.minRating));
  }

  // Experience range filter
  if (filters.experience) {
    if (filters.experience === '0-2') {
      whereClauses.push('p.years_experience BETWEEN 0 AND 2');
    } else if (filters.experience === '3-5') {
      whereClauses.push('p.years_experience BETWEEN 3 AND 5');
    } else if (filters.experience === '6-10') {
      whereClauses.push('p.years_experience BETWEEN 6 AND 10');
    } else if (filters.experience === '10+') {
      whereClauses.push('p.years_experience >= 10');
    }
  }

  // Verification filter
  if (filters.verification) {
    if (filters.verification === 'verified') {
      whereClauses.push("p.verification_status IN ('IDENTITY_VERIFIED', 'BUSINESS_VERIFIED', 'FULLY_VERIFIED')");
    } else if (filters.verification === 'fully_verified') {
      whereClauses.push("p.verification_status = 'FULLY_VERIFIED'");
    }
  }

  // Availability filter
  if (filters.availability === 'available') {
    whereClauses.push("p.availability_status = 'AVAILABLE'");
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count query
  const countSql = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM professional_profiles p
    JOIN users u ON p.user_id = u.id
    ${whereSql}
  `;
  const countRow = queryOne<{ total: number }>(countSql, params);
  const total = countRow ? countRow.total : 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Sorting
  let orderSql = 'ORDER BY p.average_rating DESC, p.total_reviews DESC';
  if (filters.sortBy === 'experience') {
    orderSql = 'ORDER BY p.years_experience DESC, p.average_rating DESC';
  } else if (filters.sortBy === 'reviews') {
    orderSql = 'ORDER BY p.total_reviews DESC, p.average_rating DESC';
  } else if (filters.sortBy === 'price_asc') {
    orderSql = 'ORDER BY p.starting_price ASC';
  }

  // Data query
  const dataSql = `
    SELECT
      p.*,
      u.name as user_name,
      u.email as user_email,
      u.phone as user_phone,
      u.avatar_url as user_avatar_url,
      (
        SELECT ps.service_name FROM professional_services ps
        WHERE ps.pro_profile_id = p.id
        ORDER BY ps.is_primary DESC LIMIT 1
      ) as primary_service_name,
      (
        SELECT pm.media_url FROM portfolio_projects pp
        JOIN portfolio_media pm ON pm.project_id = pp.id
        WHERE pp.pro_profile_id = p.id AND pm.is_cover = 1
        LIMIT 1
      ) as cover_image
    FROM professional_profiles p
    JOIN users u ON p.user_id = u.id
    ${whereSql}
    ${orderSql}
    LIMIT ? OFFSET ?
  `;

  const rows = queryAll<any>(dataSql, [...params, pageSize, offset]);

  const professionals = rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    bio: row.bio,
    yearsExperience: row.years_experience,
    city: row.city,
    locality: row.locality,
    pinCode: row.pin_code,
    languages: row.languages,
    workingHours: row.working_hours,
    startingPrice: row.starting_price,
    pricingNotes: row.pricing_notes,
    availabilityStatus: row.availability_status as AvailabilityStatus,
    availabilityUpdatedAt: row.availability_updated_at,
    verificationStatus: row.verification_status as VerificationStatus,
    verificationNotes: row.verification_notes,
    averageRating: row.average_rating,
    totalReviews: row.total_reviews,
    completedJobsCount: row.completed_jobs_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    primaryServiceName: row.primary_service_name || 'Home Services',
    coverImage: row.cover_image || null,
    user: {
      id: row.user_id,
      email: row.user_email,
      passwordHash: '',
      role: 'PROFESSIONAL' as const,
      name: row.user_name,
      phone: row.user_phone,
      avatarUrl: row.user_avatar_url,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }));

  return { professionals, total, page, totalPages };
}

export function getFeaturedProfessionals(limit: number = 4): (ProfessionalProfile & { primaryServiceName?: string; coverImage?: string })[] {
  const result = searchProfessionals({
    verification: 'verified',
    minRating: 4.0,
    pageSize: limit,
    sortBy: 'rating'
  });
  if (result.professionals.length < limit) {
    // Fallback without strict verification filter if seeded dataset is growing
    return searchProfessionals({ pageSize: limit, sortBy: 'rating' }).professionals;
  }
  return result.professionals;
}

export function getProfessionalById(proProfileId: string): ProfessionalProfile | null {
  const row = queryOne<any>(
    `SELECT p.*, u.name as user_name, u.email as user_email, u.phone as user_phone, u.avatar_url as user_avatar_url
     FROM professional_profiles p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = ?`,
    [proProfileId]
  );
  if (!row) return null;

  // Services
  const services = queryAll<any>(
    `SELECT ps.*, sc.name as category_name, sc.slug as category_slug
     FROM professional_services ps
     JOIN service_categories sc ON ps.category_id = sc.id
     WHERE ps.pro_profile_id = ?
     ORDER BY ps.is_primary DESC`,
    [proProfileId]
  );

  // Service Areas
  const serviceAreas = queryAll<any>(
    'SELECT * FROM service_areas WHERE pro_profile_id = ?',
    [proProfileId]
  );

  // Portfolios
  const portfolioRows = queryAll<any>(
    'SELECT * FROM portfolio_projects WHERE pro_profile_id = ? ORDER BY created_at DESC',
    [proProfileId]
  );

  const portfolios: PortfolioProject[] = portfolioRows.map((proj) => {
    const media = queryAll<PortfolioMedia>(
      'SELECT * FROM portfolio_media WHERE project_id = ? ORDER BY sort_order ASC',
      [proj.id]
    );
    return {
      id: proj.id,
      proProfileId: proj.pro_profile_id,
      title: proj.title,
      description: proj.description,
      categoryName: proj.category_name,
      projectCost: proj.project_cost,
      completionDate: proj.completion_date,
      createdAt: proj.created_at,
      updatedAt: proj.updated_at,
      media
    };
  });

  // Availability schedules
  const availabilitySchedules = queryAll<AvailabilitySchedule>(
    'SELECT * FROM availability_schedules WHERE pro_profile_id = ? ORDER BY day_of_week ASC',
    [proProfileId]
  );

  // Reviews with customer names
  const reviewRows = queryAll<any>(
    `SELECT r.*, u.name as customer_name, cp.city as customer_city
     FROM reviews r
     JOIN customer_profiles cp ON r.customer_id = cp.id
     JOIN users u ON cp.user_id = u.id
     WHERE r.pro_profile_id = ? AND r.is_moderated = 0
     ORDER BY r.created_at DESC`,
    [proProfileId]
  );

  const reviews = reviewRows.map((r) => ({
    id: r.id,
    bookingId: r.booking_id,
    customerId: r.customer_id,
    proProfileId: r.pro_profile_id,
    overallRating: r.overall_rating,
    punctualityRating: r.punctuality_rating,
    workmanshipRating: r.workmanship_rating,
    communicationRating: r.communication_rating,
    valueRating: r.value_rating,
    comment: r.comment,
    photos: r.photos,
    proResponse: r.pro_response,
    proResponseDate: r.pro_response_date,
    isVerifiedBooking: Boolean(r.is_verified_booking),
    isModerated: Boolean(r.is_moderated),
    isFlagged: Boolean(r.is_flagged),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    customerName: r.customer_name,
    customerCity: r.customer_city
  }));

  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    bio: row.bio,
    yearsExperience: row.years_experience,
    city: row.city,
    locality: row.locality,
    pinCode: row.pin_code,
    languages: row.languages,
    workingHours: row.working_hours,
    startingPrice: row.starting_price,
    pricingNotes: row.pricing_notes,
    availabilityStatus: row.availability_status as AvailabilityStatus,
    availabilityUpdatedAt: row.availability_updated_at,
    verificationStatus: row.verification_status as VerificationStatus,
    verificationNotes: row.verification_notes,
    averageRating: row.average_rating,
    totalReviews: row.total_reviews,
    completedJobsCount: row.completed_jobs_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user: {
      id: row.user_id,
      email: row.user_email,
      passwordHash: '',
      role: 'PROFESSIONAL' as const,
      name: row.user_name,
      phone: row.user_phone,
      avatarUrl: row.user_avatar_url,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    },
    services: services.map((s) => ({
      id: s.id,
      proProfileId: s.pro_profile_id,
      categoryId: s.category_id,
      serviceName: s.service_name,
      description: s.description,
      baseRate: s.base_rate,
      rateType: s.rate_type,
      isPrimary: Boolean(s.is_primary),
      category: {
        id: s.category_id,
        slug: s.category_slug,
        name: s.category_name,
        description: '',
        iconName: '',
        sortOrder: 0,
        isActive: true,
        createdAt: ''
      }
    })),
    serviceAreas: serviceAreas.map((sa) => ({
      id: sa.id,
      proProfileId: sa.pro_profile_id,
      city: sa.city,
      locality: sa.locality,
      pinCode: sa.pin_code
    })),
    portfolios,
    availabilitySchedules,
    reviews
  };
}

export function getProfessionalByUserId(userId: string): ProfessionalProfile | null {
  const row = queryOne<{ id: string }>('SELECT id FROM professional_profiles WHERE user_id = ?', [userId]);
  if (!row) return null;
  return getProfessionalById(row.id);
}

export function updateAvailability(
  proProfileId: string,
  status: AvailabilityStatus,
  workingHours?: string
): { success: boolean } {
  const now = new Date().toISOString();
  execute(
    `UPDATE professional_profiles
     SET availability_status = ?, working_hours = COALESCE(?, working_hours), availability_updated_at = ?, updated_at = ?
     WHERE id = ?`,
    [status, workingHours || null, now, now, proProfileId]
  );
  return { success: true };
}

export function addPortfolioProject(
  proProfileId: string,
  data: {
    title: string;
    description: string;
    categoryName: string;
    projectCost?: number;
    completionDate?: string;
    mediaUrls?: string[];
  }
): { success: boolean; projectId?: string; error?: string } {
  if (!data.title || data.title.trim().length < 3) {
    return { success: false, error: 'Project title is required (minimum 3 characters).' };
  }
  if (!data.description || data.description.trim().length < 10) {
    return { success: false, error: 'Project description is required (minimum 10 characters).' };
  }

  return runTransaction(() => {
    const projectId = crypto.randomUUID();
    const now = new Date().toISOString();

    execute(
      `INSERT INTO portfolio_projects (id, pro_profile_id, title, description, category_name, project_cost, completion_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        proProfileId,
        data.title.trim(),
        data.description.trim(),
        data.categoryName || 'General',
        data.projectCost || null,
        data.completionDate || now.substring(0, 10),
        now,
        now
      ]
    );

    if (Array.isArray(data.mediaUrls) && data.mediaUrls.length > 0) {
      data.mediaUrls.forEach((url, idx) => {
        if (url && url.trim().length > 0) {
          execute(
            `INSERT INTO portfolio_media (id, project_id, media_url, caption, is_cover, sort_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), projectId, url.trim(), null, idx === 0 ? 1 : 0, idx]
          );
        }
      });
    }

    return { success: true, projectId };
  });
}

export function deletePortfolioProject(proProfileId: string, projectId: string): { success: boolean; error?: string } {
  // Authorization check
  const proj = queryOne<{ id: string }>('SELECT id FROM portfolio_projects WHERE id = ? AND pro_profile_id = ?', [
    projectId,
    proProfileId
  ]);
  if (!proj) {
    return { success: false, error: 'Portfolio project not found or access unauthorized.' };
  }

  execute('DELETE FROM portfolio_projects WHERE id = ?', [projectId]);
  return { success: true };
}

export function toggleSavedProfessional(customerId: string, proProfileId: string): { saved: boolean } {
  const existing = queryOne<{ id: string }>(
    'SELECT id FROM saved_professionals WHERE customer_id = ? AND pro_profile_id = ?',
    [customerId, proProfileId]
  );
  if (existing) {
    execute('DELETE FROM saved_professionals WHERE id = ?', [existing.id]);
    return { saved: false };
  } else {
    execute(
      'INSERT INTO saved_professionals (id, customer_id, pro_profile_id, created_at) VALUES (?, ?, ?, ?)',
      [crypto.randomUUID(), customerId, proProfileId, new Date().toISOString()]
    );
    return { saved: true };
  }
}

export function isProfessionalSaved(customerId: string, proProfileId: string): boolean {
  const existing = queryOne<{ id: string }>(
    'SELECT id FROM saved_professionals WHERE customer_id = ? AND pro_profile_id = ?',
    [customerId, proProfileId]
  );
  return Boolean(existing);
}

export function getSavedProfessionals(customerId: string): ProfessionalProfile[] {
  const rows = queryAll<{ pro_profile_id: string }>(
    'SELECT pro_profile_id FROM saved_professionals WHERE customer_id = ? ORDER BY created_at DESC',
    [customerId]
  );
  const results: ProfessionalProfile[] = [];
  for (const row of rows) {
    const pro = getProfessionalById(row.pro_profile_id);
    if (pro) results.push(pro);
  }
  return results;
}
