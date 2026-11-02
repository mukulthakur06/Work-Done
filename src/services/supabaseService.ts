// Workdone Supabase Backend Integration Service
// Saves inquiries, forms, bookings, reviews, and registrations to Supabase PostgREST API

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://exxxcuwmkqknluppkyrg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eHhjdXdta3Frbmx1cHBreXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NDk0MjksImV4cCI6MjEwOTEyNTQyOX0.NQohevQpXvHqKI4NDXYA4iVcjblflPkKZs0EXymwxh4';

interface PostgRestResponse {
  success: boolean;
  status?: number;
  error?: string;
}

async function postToTable(table: string, data: Record<string, any>): Promise<PostgRestResponse> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[SupabaseSync] Error inserting into ${table} (HTTP ${res.status}):`, errText);
      return { success: false, status: res.status, error: errText };
    }

    return { success: true, status: res.status };
  } catch (err: any) {
    // Network / offline error - log as warning, do not crash local server or unit tests
    console.warn(`[SupabaseSync] Network or connection notice for ${table}:`, err?.message || err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

// 1. General Contact & Inquiries
export interface ContactInquiryInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  inquiry_type?: 'general' | 'support' | 'partnership' | 'report' | 'feedback';
  source_page?: string;
  user_agent?: string;
  ip_address?: string;
}

export async function saveContactInquiry(input: ContactInquiryInput): Promise<PostgRestResponse> {
  return postToTable('contact_inquiries', {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    subject: input.subject?.trim() || 'General Inquiry',
    message: input.message.trim(),
    inquiry_type: input.inquiry_type || 'general',
    source_page: input.source_page || 'website',
    user_agent: input.user_agent || null,
    ip_address: input.ip_address || null
  });
}

// 2. Booking Requests
export interface BookingRequestInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  professional_name?: string;
  professional_id?: string;
  service_category: string;
  service_description: string;
  preferred_date?: string;
  preferred_time?: string;
  city?: string;
  address?: string;
  budget_estimate?: number;
  notes?: string;
}

export async function saveBookingRequest(input: BookingRequestInput): Promise<PostgRestResponse> {
  return postToTable('booking_requests', {
    customer_name: input.customer_name,
    customer_email: input.customer_email.toLowerCase().trim(),
    customer_phone: input.customer_phone || null,
    professional_name: input.professional_name || null,
    professional_id: input.professional_id || null,
    service_category: input.service_category,
    service_description: input.service_description,
    preferred_date: input.preferred_date || null,
    preferred_time: input.preferred_time || null,
    city: input.city || null,
    address: input.address || null,
    budget_estimate: input.budget_estimate || null,
    notes: input.notes || null
  });
}

// 3. Pro Registration Inquiries
export interface ProRegistrationInput {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  trade_category: string;
  years_experience?: number;
  has_gst?: boolean;
  business_name?: string;
  brief_bio?: string;
  portfolio_url?: string;
}

export async function saveProRegistration(input: ProRegistrationInput): Promise<PostgRestResponse> {
  return postToTable('pro_registration_inquiries', {
    full_name: input.full_name,
    email: input.email.toLowerCase().trim(),
    phone: input.phone,
    city: input.city,
    trade_category: input.trade_category,
    years_experience: input.years_experience || 0,
    has_gst: Boolean(input.has_gst),
    business_name: input.business_name || null,
    brief_bio: input.brief_bio || null,
    portfolio_url: input.portfolio_url || null
  });
}

// 4. Customer Reviews
export interface CustomerReviewInput {
  customer_name: string;
  customer_email: string;
  professional_name: string;
  professional_id?: string;
  service_category?: string;
  booking_reference?: string;
  rating_overall: number;
  rating_quality?: number;
  rating_punctuality?: number;
  rating_value?: number;
  review_title?: string;
  review_body: string;
  would_recommend?: boolean;
}

export async function saveCustomerReview(input: CustomerReviewInput): Promise<PostgRestResponse> {
  return postToTable('customer_reviews', {
    customer_name: input.customer_name,
    customer_email: input.customer_email.toLowerCase().trim(),
    professional_name: input.professional_name,
    professional_id: input.professional_id || null,
    service_category: input.service_category || null,
    booking_reference: input.booking_reference || null,
    rating_overall: input.rating_overall,
    rating_quality: input.rating_quality || input.rating_overall,
    rating_punctuality: input.rating_punctuality || input.rating_overall,
    rating_value: input.rating_value || input.rating_overall,
    review_title: input.review_title || null,
    review_body: input.review_body,
    would_recommend: input.would_recommend !== false
  });
}

// 5. Estimate Requests
export interface EstimateRequestInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  city: string;
  service_category: string;
  project_description: string;
  project_size?: string;
  timeline?: string;
  budget_range?: string;
}

export async function saveEstimateRequest(input: EstimateRequestInput): Promise<PostgRestResponse> {
  return postToTable('estimate_requests', {
    customer_name: input.customer_name,
    customer_email: input.customer_email.toLowerCase().trim(),
    customer_phone: input.customer_phone || null,
    city: input.city,
    service_category: input.service_category,
    project_description: input.project_description,
    project_size: input.project_size || null,
    timeline: input.timeline || null,
    budget_range: input.budget_range || null
  });
}

// 6. Newsletter Signups
export interface NewsletterSignupInput {
  email: string;
  name?: string;
  city?: string;
  source?: string;
}

export async function saveNewsletterSignup(input: NewsletterSignupInput): Promise<PostgRestResponse> {
  return postToTable('newsletter_signups', {
    email: input.email.toLowerCase().trim(),
    name: input.name?.trim() || null,
    city: input.city?.trim() || null,
    source: input.source || 'website'
  });
}

// 7. Complaint Submissions
export interface ComplaintSubmissionInput {
  complainant_name: string;
  complainant_email: string;
  complainant_phone?: string;
  against_professional: string;
  professional_id?: string;
  booking_reference?: string;
  complaint_type: 'quality' | 'fraud' | 'no_show' | 'overcharge' | 'rude_behaviour' | 'other';
  description: string;
  resolution_sought?: string;
}

export async function saveComplaintSubmission(input: ComplaintSubmissionInput): Promise<PostgRestResponse> {
  return postToTable('complaint_submissions', {
    complainant_name: input.complainant_name,
    complainant_email: input.complainant_email.toLowerCase().trim(),
    complainant_phone: input.complainant_phone || null,
    against_professional: input.against_professional,
    professional_id: input.professional_id || null,
    booking_reference: input.booking_reference || null,
    complaint_type: input.complaint_type,
    description: input.description,
    resolution_sought: input.resolution_sought || null
  });
}
