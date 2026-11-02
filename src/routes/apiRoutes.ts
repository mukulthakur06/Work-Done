// Workdone Comprehensive RESTful API Endpoints
import * as http from 'node:http';
import {
  authenticateUser,
  registerCustomer,
  registerProfessional,
  getUserById,
  getCustomerProfileByUserId,
  updateCustomerProfile
} from '../services/userService.ts';
import {
  searchProfessionals,
  getProfessionalById,
  getProfessionalByUserId,
  addPortfolioProject,
  deletePortfolioProject,
  updateAvailability,
  toggleSavedProfessional,
  getSavedProfessionals
} from '../services/proService.ts';
import {
  createBooking,
  updateBookingStatus,
  getBookingById,
  getCustomerBookings,
  getProBookings
} from '../services/bookingService.ts';
import { createEstimate, acceptEstimate, getEstimateById } from '../services/estimateService.ts';
import { submitReview, respondToReview, reportReview } from '../services/reviewService.ts';
import { submitComplaint, updateComplaintStatus, getAllComplaints } from '../services/complaintService.ts';
import {
  getPendingVerifications,
  reviewVerificationRecord,
  submitVerification
} from '../services/verificationService.ts';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationService.ts';
import {
  saveContactInquiry,
  saveBookingRequest,
  saveProRegistration,
  saveCustomerReview,
  saveEstimateRequest,
  saveNewsletterSignup,
  saveComplaintSubmission
} from '../services/supabaseService.ts';
import {
  getAdminMetrics,
  getAllUsers,
  toggleUserActiveStatus,
  getReportedReviews,
  moderateReview,
  getAuditLogs
} from '../services/adminService.ts';
import { serializeCookie, clearCookie } from '../auth/auth.ts';
import type { SessionData, UserRole, BookingStatus } from '../types/index.ts';

export async function handleApiRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  session: SessionData | null,
  body: any
): Promise<boolean> {
  const method = req.method || 'GET';

  // Helper JSON responders
  const json = (data: any, status = 200, headers: Record<string, string> = {}) => {
    if (res.headersSent) return true;
    res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify(data));
    return true;
  };

  const error = (message: string, status = 400) => {
    if (res.headersSent) return true;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: message }));
    return true;
  };

  const requireAuth = (): SessionData | null => {
    if (!session) {
      error('Authentication required.', 401);
      return null;
    }
    return session;
  };

  const requireRole = (allowedRoles: UserRole[]): SessionData | null => {
    const s = requireAuth();
    if (!s) return null;
    if (!allowedRoles.includes(s.role)) {
      error(`Forbidden. Requires one of roles: ${allowedRoles.join(', ')}`, 403);
      return null;
    }
    return s;
  };

  // -------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------
  if (pathname === '/api/auth/register-customer' && method === 'POST') {
    const result = registerCustomer(body);
    if (!result.success) return error(result.error || 'Registration failed.');

    // Auto-login upon registration
    const auth = authenticateUser(body.email, body.password);
    if (auth.success && auth.session) {
      const cookie = serializeCookie('wd_session', JSON.stringify(auth.session));
      return json({ success: true, user: result.user }, 201, { 'Set-Cookie': cookie });
    }
    return json({ success: true, user: result.user }, 201);
  }

  if (pathname === '/api/auth/register-pro' && method === 'POST') {
    const result = registerProfessional(body);
    if (!result.success) return error(result.error || 'Registration failed.');

    const auth = authenticateUser(body.email, body.password);
    if (auth.success && auth.session) {
      // Async sync to Supabase backend
      saveProRegistration({
        full_name: body.name,
        email: body.email,
        phone: body.phone || '',
        city: body.city || '',
        trade_category: body.primaryServiceSlug || '',
        years_experience: Number(body.yearsExperience) || 0,
        business_name: body.businessName,
        brief_bio: body.bio
      }).catch(err => console.warn('[SupabaseSync] Pro registration warning:', err));

      const cookie = serializeCookie('wd_session', JSON.stringify(auth.session));
      return json({ success: true, user: result.user, proProfileId: result.proProfileId }, 201, { 'Set-Cookie': cookie });
    }
    // Async sync to Supabase backend
    saveProRegistration({
      full_name: body.name,
      email: body.email,
      phone: body.phone || '',
      city: body.city || '',
      trade_category: body.primaryServiceSlug || '',
      years_experience: Number(body.yearsExperience) || 0,
      business_name: body.businessName,
      brief_bio: body.bio
    }).catch(err => console.warn('[SupabaseSync] Pro registration warning:', err));
    return json({ success: true, user: result.user, proProfileId: result.proProfileId }, 201);
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email, password } = body;
    const auth = authenticateUser(email, password);
    if (!auth.success || !auth.session) {
      return error(auth.error || 'Invalid credentials.', 401);
    }
    const cookie = serializeCookie('wd_session', JSON.stringify(auth.session));
    return json({ success: true, user: auth.session }, 200, { 'Set-Cookie': cookie });
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    return json({ success: true }, 200, { 'Set-Cookie': clearCookie('wd_session') });
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    if (!session) return json({ authenticated: false, user: null });
    const user = getUserById(session.userId);
    return json({ authenticated: true, user: { ...session, fullUser: user } });
  }

  // -------------------------------------------------------------
  // CUSTOMER PROFILE
  // -------------------------------------------------------------
  if (pathname === '/api/customer/profile' && method === 'POST') {
    const s = requireRole(['CUSTOMER']);
    if (!s) return true;
    const result = updateCustomerProfile(s.userId, body);
    if (!result.success) return error(result.error || 'Failed to update profile.');
    return json({ success: true });
  }

  // -------------------------------------------------------------
  // PROFESSIONALS & SEARCH
  // -------------------------------------------------------------
  if (pathname === '/api/professionals' && method === 'GET') {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const results = searchProfessionals({
      keyword: url.searchParams.get('keyword') || undefined,
      categorySlug: url.searchParams.get('category') || undefined,
      city: url.searchParams.get('city') || undefined,
      minRating: url.searchParams.get('minRating') ? Number(url.searchParams.get('minRating')) : undefined,
      experience: url.searchParams.get('experience') || undefined,
      verification: url.searchParams.get('verification') || undefined,
      availability: url.searchParams.get('availability') || undefined,
      sortBy: (url.searchParams.get('sortBy') as any) || undefined,
      page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1,
      pageSize: url.searchParams.get('pageSize') ? Number(url.searchParams.get('pageSize')) : 12
    });
    return json(results);
  }

  // Compare multiple professionals
  if (pathname === '/api/professionals/compare' && method === 'GET') {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const ids = (url.searchParams.get('ids') || '').split(',').map((id) => id.trim()).filter(Boolean);
    if (ids.length === 0) return error('Please provide at least one professional ID to compare.');

    const pros = ids.map((id) => getProfessionalById(id)).filter(Boolean);
    return json({ professionals: pros });
  }

  // Single professional detail
  if (pathname.startsWith('/api/professionals/') && method === 'GET') {
    const proId = pathname.replace('/api/professionals/', '');
    const pro = getProfessionalById(proId);
    if (!pro) return error('Professional not found.', 404);
    return json({ professional: pro });
  }

  // Toggle saved professional bookmark
  if (pathname.startsWith('/api/professionals/saved/') && method === 'POST') {
    const s = requireRole(['CUSTOMER']);
    if (!s) return true;
    if (!s.customerProfileId) return error('Customer profile required.', 403);
    const proId = pathname.replace('/api/professionals/saved/', '');
    const result = toggleSavedProfessional(s.customerProfileId, proId);
    return json({ success: true, saved: result.saved });
  }

  // Professional portfolio management
  if (pathname === '/api/professionals/portfolio' && method === 'POST') {
    const s = requireRole(['PROFESSIONAL']);
    if (!s) return true;
    if (!s.proProfileId) return error('Professional profile required.', 403);
    const result = addPortfolioProject(s.proProfileId, body);
    if (!result.success) return error(result.error || 'Failed to add project.');
    return json({ success: true, projectId: result.projectId }, 201);
  }

  if (pathname.startsWith('/api/professionals/portfolio/') && method === 'DELETE') {
    const s = requireRole(['PROFESSIONAL']);
    if (!s) return true;
    if (!s.proProfileId) return error('Professional profile required.', 403);
    const projId = pathname.replace('/api/professionals/portfolio/', '');
    const result = deletePortfolioProject(s.proProfileId, projId);
    if (!result.success) return error(result.error || 'Failed to delete project.');
    return json({ success: true });
  }

  // Professional availability management
  if (pathname === '/api/professionals/availability' && method === 'POST') {
    const s = requireRole(['PROFESSIONAL']);
    if (!s) return true;
    if (!s.proProfileId) return error('Professional profile required.', 403);
    const { status, workingHours } = body;
    const result = updateAvailability(s.proProfileId, status, workingHours);
    return json({ success: true });
  }

  // -------------------------------------------------------------
  // BOOKINGS & JOBS
  // -------------------------------------------------------------
  if (pathname === '/api/bookings' && method === 'POST') {
    const s = requireRole(['CUSTOMER']);
    if (!s) return true;
    if (!s.customerProfileId) return error('Customer profile required to request bookings.', 403);

    const result = createBooking({
      ...body,
      customerId: s.customerProfileId
    });
    if (!result.success) return error(result.error || 'Failed to create booking.');

    // Asynchronously save to Supabase booking_requests table
    const pro = body.proProfileId ? getProfessionalById(body.proProfileId) : null;
    saveBookingRequest({
      customer_name: s.name,
      customer_email: s.email,
      customer_phone: s.phone || '',
      professional_name: pro?.businessName || pro?.user?.name || '',
      professional_id: body.proProfileId,
      service_category: body.serviceTitle || body.categoryId || 'General Service',
      service_description: body.description || '',
      preferred_date: body.requestedDate,
      city: body.city || '',
      address: body.approximateLocation || '',
      budget_estimate: Number(body.budgetRangeMax || body.budgetRangeMin) || undefined,
      notes: body.description
    }).catch(err => console.warn('[SupabaseSync] Booking request sync warning:', err));

    return json({ success: true, booking: result.booking }, 201);
  }

  if (pathname.startsWith('/api/bookings/') && pathname.endsWith('/status') && method === 'POST') {
    const s = requireAuth();
    if (!s) return true;
    const bookingId = pathname.replace('/api/bookings/', '').replace('/status', '');
    const { status, note, rescheduledDate, cancellationReason } = body;

    const result = updateBookingStatus(bookingId, s.userId, s.role, status as BookingStatus, {
      note,
      rescheduledDate,
      cancellationReason
    });
    if (!result.success) return error(result.error || 'Status update failed.');
    return json({ success: true });
  }

  if (pathname.startsWith('/api/bookings/') && method === 'GET') {
    const s = requireAuth();
    if (!s) return true;
    const bookingId = pathname.replace('/api/bookings/', '');
    const booking = getBookingById(bookingId);
    if (!booking) return error('Booking not found.', 404);

    // Authorization check
    if (s.role !== 'ADMIN' && booking.customer?.userId !== s.userId && booking.proProfile?.userId !== s.userId) {
      return error('Unauthorized to view this booking.', 403);
    }
    return json({ booking });
  }

  // -------------------------------------------------------------
  // ESTIMATES
  // -------------------------------------------------------------
  if (pathname === '/api/estimates' && method === 'POST') {
    const s = requireRole(['PROFESSIONAL']);
    if (!s) return true;
    const result = createEstimate({
      ...body,
      proUserId: s.userId
    });
    if (!result.success) return error(result.error || 'Failed to issue estimate.');

    // Asynchronously save to Supabase estimate_requests
    try {
      const b = body.bookingId ? getBookingById(body.bookingId) : null;
      saveEstimateRequest({
        customer_name: b?.customer?.user?.name || 'Customer',
        customer_email: b?.customer?.user?.email || 'customer@workdone.local',
        customer_phone: b?.customer?.user?.phone,
        city: b?.city || 'Local',
        service_category: b?.serviceTitle || 'Home Service',
        project_description: body.workIncluded || 'Formal Estimate',
        timeline: body.estimatedDuration,
        budget_range: String(body.labourCost + (body.materialCost || 0))
      }).catch(err => console.warn('[SupabaseSync] Estimate sync warning:', err));
    } catch (e) {
      // safe fallback
    }

    return json({ success: true, estimate: result.estimate }, 201);
  }

  if (pathname.startsWith('/api/estimates/') && pathname.endsWith('/accept') && method === 'POST') {
    const s = requireRole(['CUSTOMER']);
    if (!s) return true;
    const estimateId = pathname.replace('/api/estimates/', '').replace('/accept', '');
    const result = acceptEstimate(estimateId, s.userId);
    if (!result.success) return error(result.error || 'Failed to accept estimate.');
    return json({ success: true });
  }

  // -------------------------------------------------------------
  // REVIEWS & RATINGS
  // -------------------------------------------------------------
  if (pathname === '/api/reviews' && method === 'POST') {
    const s = requireRole(['CUSTOMER']);
    if (!s) return true;
    const result = submitReview({
      ...body,
      customerUserId: s.userId
    });
    if (!result.success) return error(result.error || 'Failed to submit review.');

    // Asynchronously save to Supabase customer_reviews
    try {
      const b = body.bookingId ? getBookingById(body.bookingId) : null;
      saveCustomerReview({
        customer_name: s.name,
        customer_email: s.email,
        professional_name: b?.proProfile?.businessName || b?.proProfile?.user?.name || 'Professional',
        professional_id: b?.proProfileId,
        service_category: b?.serviceTitle,
        booking_reference: b?.bookingNumber,
        rating_overall: Number(body.overallRating) || 5,
        rating_quality: Number(body.workmanshipRating) || 5,
        rating_punctuality: Number(body.punctualityRating) || 5,
        rating_value: Number(body.valueRating) || 5,
        review_title: 'Customer Review',
        review_body: body.comment
      }).catch(err => console.warn('[SupabaseSync] Review sync warning:', err));
    } catch (e) {}

    return json({ success: true, review: result.review }, 201);
  }

  if (pathname.startsWith('/api/reviews/') && pathname.endsWith('/respond') && method === 'POST') {
    const s = requireRole(['PROFESSIONAL']);
    if (!s) return true;
    const reviewId = pathname.replace('/api/reviews/', '').replace('/respond', '');
    const result = respondToReview(reviewId, s.userId, body.response);
    if (!result.success) return error(result.error || 'Failed to post response.');
    return json({ success: true });
  }

  if (pathname.startsWith('/api/reviews/') && pathname.endsWith('/report') && method === 'POST') {
    const s = requireAuth();
    if (!s) return true;
    const reviewId = pathname.replace('/api/reviews/', '').replace('/report', '');
    const result = reportReview(reviewId, s.userId, body.reason);
    if (!result.success) return error(result.error || 'Failed to report review.');
    return json({ success: true });
  }

  // -------------------------------------------------------------
  // COMPLAINTS & DISPUTES
  // -------------------------------------------------------------
  if (pathname === '/api/complaints' && method === 'POST') {
    const s = requireRole(['CUSTOMER']);
    if (!s) return true;
    const result = submitComplaint({
      ...body,
      customerUserId: s.userId
    });
    if (!result.success) return error(result.error || 'Failed to file complaint.');

    // Asynchronously save to Supabase complaint_submissions
    try {
      const b = body.bookingId ? getBookingById(body.bookingId) : null;
      saveComplaintSubmission({
        complainant_name: s.name,
        complainant_email: s.email,
        complainant_phone: s.phone,
        against_professional: b?.proProfile?.businessName || b?.proProfile?.user?.name || 'Professional',
        professional_id: b?.proProfileId,
        booking_reference: b?.bookingNumber,
        complaint_type: (body.category?.toLowerCase() || 'other') as any,
        description: body.description,
        resolution_sought: 'Customer Dashboard Dispute'
      }).catch(err => console.warn('[SupabaseSync] Complaint sync warning:', err));
    } catch (e) {}

    return json({ success: true, complaint: result.complaint }, 201);
  }

  // -------------------------------------------------------------
  // DIRECT PUBLIC FORMS & SUPABASE INQUIRIES
  // -------------------------------------------------------------
  if ((pathname === '/api/contact' || pathname === '/api/inquiries') && method === 'POST') {
    if (!body.name || !body.email || !body.message) {
      return error('Full name, email address, and message details are required.');
    }
    const supRes = await saveContactInquiry({
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject || 'Website Inquiry',
      message: body.message,
      inquiry_type: body.inquiry_type || 'general',
      source_page: body.source_page || 'contact_form'
    });
    return json({ success: true, message: 'Inquiry successfully saved to Supabase.', supabaseStatus: supRes.status }, 201);
  }

  if (pathname === '/api/complaints/public' && method === 'POST') {
    if (!body.complainant_name || !body.complainant_email || !body.description || !body.against_professional) {
      return error('Name, email, professional name, and detailed description are required.');
    }
    const supRes = await saveComplaintSubmission({
      complainant_name: body.complainant_name,
      complainant_email: body.complainant_email,
      complainant_phone: body.complainant_phone,
      against_professional: body.against_professional,
      booking_reference: body.booking_reference,
      complaint_type: body.complaint_type || 'other',
      description: body.description,
      resolution_sought: body.resolution_sought
    });
    return json({ success: true, message: 'Dispute report successfully saved to Supabase.', supabaseStatus: supRes.status }, 201);
  }

  if (pathname === '/api/newsletter' && method === 'POST') {
    if (!body.email || !body.email.includes('@')) {
      return error('Please enter a valid email address.');
    }
    const supRes = await saveNewsletterSignup({
      email: body.email,
      name: body.name,
      city: body.city,
      source: body.source || 'footer'
    });
    return json({ success: true, message: 'Thank you for subscribing! Your email is saved in Supabase.', supabaseStatus: supRes.status }, 201);
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  if (pathname === '/api/notifications' && method === 'GET') {
    const s = requireAuth();
    if (!s) return true;
    const data = getUserNotifications(s.userId);
    return json(data);
  }

  if (pathname.startsWith('/api/notifications/') && pathname.endsWith('/read') && method === 'POST') {
    const s = requireAuth();
    if (!s) return true;
    const notifId = pathname.replace('/api/notifications/', '').replace('/read', '');
    markNotificationAsRead(notifId, s.userId);
    return json({ success: true });
  }

  if (pathname === '/api/notifications/read-all' && method === 'POST') {
    const s = requireAuth();
    if (!s) return true;
    markAllNotificationsAsRead(s.userId);
    return json({ success: true });
  }

  // -------------------------------------------------------------
  // ADMINISTRATOR ENDPOINTS
  // -------------------------------------------------------------
  if (pathname === '/api/admin/metrics' && method === 'GET') {
    const s = requireRole(['ADMIN']);
    if (!s) return true;
    return json(getAdminMetrics());
  }

  if (pathname === '/api/admin/users' && method === 'GET') {
    const s = requireRole(['ADMIN']);
    if (!s) return true;
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const users = getAllUsers(url.searchParams.get('role') || undefined, url.searchParams.get('search') || undefined);
    return json({ users });
  }

  if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/toggle-active') && method === 'POST') {
    const s = requireRole(['ADMIN']);
    if (!s) return true;
    const targetUserId = pathname.replace('/api/admin/users/', '').replace('/toggle-active', '');
    const result = toggleUserActiveStatus(targetUserId, s.userId, Boolean(body.isActive), body.reason);
    if (!result.success) return error(result.error || 'Operation failed.');
    return json({ success: true });
  }

  if (pathname === '/api/admin/verifications' && method === 'GET') {
    const s = requireRole(['ADMIN']);
    if (!s) return true;
    return json({ pendingVerifications: getPendingVerifications() });
  }

  if (pathname.startsWith('/api/admin/verifications/') && pathname.endsWith('/review') && method === 'POST') {
    const s = requireRole(['ADMIN']);
    if (!s) return true;
    const recordId = pathname.replace('/api/admin/verifications/', '').replace('/review', '');
    const result = reviewVerificationRecord(recordId, s.userId, Boolean(body.approved), body.reason);
    if (!result.success) return error(result.error || 'Verification review failed.');
    return json({ success: true });
  }

  if (pathname === '/api/admin/reviews/reported' && method === 'GET') {
    const s = requireRole(['ADMIN']);
    if (!s) return true;
    return json({ reports: getReportedReviews() });
  }

  if (pathname === '/api/admin/reviews/moderate' && method === 'POST') {
    const s = requireRole(['ADMIN']);
    if (!s) return true;
    const { reportId, action, moderationNotes } = body;
    const result = moderateReview(reportId, s.userId, action, moderationNotes);
    if (!result.success) return error(result.error || 'Moderation action failed.');
    return json({ success: true });
  }

  if (pathname === '/api/admin/complaints' && method === 'GET') {
    const s = requireRole(['ADMIN']);
    if (!s) return true;
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    return json({ complaints: getAllComplaints(url.searchParams.get('status') || undefined) });
  }

  if (pathname.startsWith('/api/admin/complaints/') && pathname.endsWith('/resolve') && method === 'POST') {
    const s = requireRole(['ADMIN']);
    if (!s) return true;
    const compId = pathname.replace('/api/admin/complaints/', '').replace('/resolve', '');
    const result = updateComplaintStatus(compId, s.userId, body.status, body.resolutionNotes || '');
    if (!result.success) return error(result.error || 'Complaint resolution update failed.');
    return json({ success: true });
  }

  if (pathname === '/api/admin/audit-logs' && method === 'GET') {
    const s = requireRole(['ADMIN']);
    if (!s) return true;
    return json({ auditLogs: getAuditLogs(50) });
  }

  // Not handled by API
  return false;
}
