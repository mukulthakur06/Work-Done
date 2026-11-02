// Workdone Comprehensive Automated Test Suite
import * as assert from 'node:assert';
import { getDb } from '../db/database.ts';
import { runSeed } from '../db/seed.ts';
import {
  authenticateUser,
  registerCustomer,
  registerProfessional,
  updateCustomerProfile,
  getUserById
} from '../services/userService.ts';
import {
  searchProfessionals,
  getProfessionalById,
  addPortfolioProject,
  deletePortfolioProject,
  updateAvailability,
  toggleSavedProfessional,
  isProfessionalSaved
} from '../services/proService.ts';
import {
  createBooking,
  updateBookingStatus,
  getBookingById
} from '../services/bookingService.ts';
import { createEstimate, acceptEstimate, getEstimateById } from '../services/estimateService.ts';
import { submitReview, recalculateProRating } from '../services/reviewService.ts';
import { submitVerification, reviewVerificationRecord } from '../services/verificationService.ts';
import { submitComplaint, updateComplaintStatus, getAllComplaints } from '../services/complaintService.ts';
import { getAdminMetrics, toggleUserActiveStatus, moderateReview } from '../services/adminService.ts';

let passed = 0;
let failed = 0;

function it(description: string, fn: () => void | Promise<void>) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n============================================================');
  console.log('       WORKDONE AUTOMATED VERIFICATION & TEST SUITE         ');
  console.log('============================================================\n');

  // Ensure DB and seed data
  getDb();
  runSeed();

  console.log('\n[1. Authentication & Role-Based Access Control]');
  
  it('Should successfully register a new customer account', () => {
    const email = `test.customer.${Date.now()}@example.com`;
    const res = registerCustomer({
      name: 'Alice Cooper',
      email,
      password: 'SecurePassword2026!',
      city: 'Austin'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user?.role, 'CUSTOMER');
    assert.strictEqual(res.user?.email, email);
  });

  it('Should reject registration with invalid email or short password', () => {
    const res1 = registerCustomer({ name: 'Bob', email: 'invalid-email', password: 'ValidPass123!' });
    assert.strictEqual(res1.success, false);

    const res2 = registerCustomer({ name: 'Bob', email: 'bob@example.com', password: 'short' });
    assert.strictEqual(res2.success, false);
  });

  it('Should successfully register a professional with initial pending verification', () => {
    const email = `test.pro.${Date.now()}@example.com`;
    const res = registerProfessional({
      name: 'Tom Miller',
      businessName: 'Miller Custom Cabinetry',
      email,
      password: 'ProPassword2026!',
      primaryServiceSlug: 'carpentry',
      yearsExperience: 8,
      city: 'Austin',
      bio: 'Master woodworker with 8 years of custom furniture and kitchen remodel experience.'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.user?.role, 'PROFESSIONAL');
    assert.ok(res.proProfileId);

    const pro = getProfessionalById(res.proProfileId!);
    assert.strictEqual(pro?.verificationStatus, 'PENDING_REVIEW');
  });

  it('Should authenticate existing seeded customer and pro accounts', () => {
    const custAuth = authenticateUser('sarah.jenkins@example.com', 'WorkdoneDemo2026!');
    assert.strictEqual(custAuth.success, true);
    assert.strictEqual(custAuth.session?.role, 'CUSTOMER');

    const proAuth = authenticateUser('marcus.vance@example.com', 'WorkdoneDemo2026!');
    assert.strictEqual(proAuth.success, true);
    assert.strictEqual(proAuth.session?.role, 'PROFESSIONAL');

    const adminAuth = authenticateUser('admin@workdone.com', 'WorkdoneAdmin2026!');
    assert.strictEqual(adminAuth.success, true);
    assert.strictEqual(adminAuth.session?.role, 'ADMIN');
  });

  it('Should reject incorrect passwords', () => {
    const badAuth = authenticateUser('sarah.jenkins@example.com', 'WrongPassword!');
    assert.strictEqual(badAuth.success, false);
  });

  console.log('\n[2. Search, Multi-Faceted Filters & Comparison]');

  it('Should find professionals by trade category', () => {
    const result = searchProfessionals({ categorySlug: 'carpentry' });
    assert.ok(result.professionals.length >= 1);
    assert.ok(result.professionals.some((p) => p.user?.name === 'Marcus Vance'));
  });

  it('Should filter professionals by city locality', () => {
    const result = searchProfessionals({ city: 'Austin' });
    assert.ok(result.professionals.length >= 2);
  });

  it('Should filter professionals by minimum rating', () => {
    const result = searchProfessionals({ minRating: 4.8 });
    assert.ok(result.professionals.every((p) => p.averageRating >= 4.8));
  });

  it('Should sort professionals by experience descending', () => {
    const result = searchProfessionals({ sortBy: 'experience' });
    for (let i = 0; i < result.professionals.length - 1; i++) {
      assert.ok(result.professionals[i].yearsExperience >= result.professionals[i + 1].yearsExperience);
    }
  });

  console.log('\n[3. Professional Portfolio & Availability Management]');

  it('Should allow a professional to add and delete portfolio projects', () => {
    const proAuth = authenticateUser('marcus.vance@example.com', 'WorkdoneDemo2026!');
    const proProfileId = proAuth.session?.proProfileId!;

    const addRes = addPortfolioProject(proProfileId, {
      title: 'Handcrafted Oak Library Bookshelves',
      categoryName: 'Carpentry & Furniture',
      description: 'Floor-to-ceiling white oak library shelving with rolling brass ladder track.',
      projectCost: 6500,
      mediaUrls: ['https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7']
    });
    assert.strictEqual(addRes.success, true);
    assert.ok(addRes.projectId);

    // Verify addition
    const pro = getProfessionalById(proProfileId);
    assert.ok(pro?.portfolios?.some((p) => p.id === addRes.projectId));

    // Delete
    const delRes = deletePortfolioProject(proProfileId, addRes.projectId!);
    assert.strictEqual(delRes.success, true);
  });

  it('Should reject portfolio deletion from an unauthorized pro', () => {
    const pro1 = authenticateUser('marcus.vance@example.com', 'WorkdoneDemo2026!');
    const pro2 = authenticateUser('david.miller@example.com', 'WorkdoneDemo2026!');

    const addRes = addPortfolioProject(pro1.session?.proProfileId!, {
      title: 'Unauthorized Test Project',
      categoryName: 'Carpentry',
      description: 'Testing permissions.'
    });

    const badDel = deletePortfolioProject(pro2.session?.proProfileId!, addRes.projectId!);
    assert.strictEqual(badDel.success, false);
  });

  it('Should update professional availability status and working hours', () => {
    const proAuth = authenticateUser('marcus.vance@example.com', 'WorkdoneDemo2026!');
    const proProfileId = proAuth.session?.proProfileId!;

    updateAvailability(proProfileId, 'BUSY', '10:00 AM - 4:00 PM, Mon-Fri');
    const pro = getProfessionalById(proProfileId);
    assert.strictEqual(pro?.availabilityStatus, 'BUSY');
    assert.strictEqual(pro?.workingHours, '10:00 AM - 4:00 PM, Mon-Fri');

    // Revert to AVAILABLE
    updateAvailability(proProfileId, 'AVAILABLE', '8:00 AM - 6:00 PM, Mon-Sat');
  });

  console.log('\n[4. Bookings Lifecycle & State Machine Transitions]');

  let testBookingId: string;
  const custAuth = authenticateUser('sarah.jenkins@example.com', 'WorkdoneDemo2026!');
  const proAuth = authenticateUser('marcus.vance@example.com', 'WorkdoneDemo2026!');

  it('Should allow a customer to create a booking request', () => {
    const pro = getProfessionalById(proAuth.session?.proProfileId!)!;
    const res = createBooking({
      customerId: custAuth.session?.customerProfileId!,
      proProfileId: pro.id,
      categoryId: pro.services![0].categoryId,
      serviceTitle: 'Living Room Floating Shelves',
      description: 'Installation of 4 solid walnut floating shelves with concealed heavy-duty steel brackets.',
      approximateLocation: 'Downtown Austin',
      city: 'Austin',
      requestedDate: '2026-06-15',
      budgetRangeMax: 800
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.booking?.id);
    assert.strictEqual(res.booking?.status, 'REQUESTED');
    testBookingId = res.booking!.id;
  });

  it('Should enforce state machine transitions: Pro accepts booking', () => {
    const res = updateBookingStatus(testBookingId, proAuth.session?.userId!, 'PROFESSIONAL', 'ACCEPTED', {
      note: 'Accepted. Will arrive on requested date.'
    });
    assert.strictEqual(res.success, true);

    const b = getBookingById(testBookingId);
    assert.strictEqual(b?.status, 'ACCEPTED');
  });

  it('Should transition booking to IN_PROGRESS and then to COMPLETED', () => {
    const res1 = updateBookingStatus(testBookingId, proAuth.session?.userId!, 'PROFESSIONAL', 'IN_PROGRESS');
    assert.strictEqual(res1.success, true);

    const res2 = updateBookingStatus(testBookingId, proAuth.session?.userId!, 'PROFESSIONAL', 'COMPLETED', {
      note: 'Shelves anchored and leveled.'
    });
    assert.strictEqual(res2.success, true);

    const b = getBookingById(testBookingId);
    assert.strictEqual(b?.status, 'COMPLETED');
  });

  console.log('\n[5. Estimates & Price Transparency]');

  it('Should allow professional to create itemized estimate and customer to accept it', () => {
    // Create new booking for estimate flow
    const pro = getProfessionalById(proAuth.session?.proProfileId!)!;
    const bRes = createBooking({
      customerId: custAuth.session?.customerProfileId!,
      proProfileId: pro.id,
      categoryId: pro.services![0].categoryId,
      serviceTitle: 'Alcove Bookcase Estimate Test',
      description: 'Custom cabinetry estimate test.',
      approximateLocation: 'Austin',
      city: 'Austin',
      requestedDate: '2026-07-01'
    });
    const bId = bRes.booking!.id;

    const estRes = createEstimate({
      bookingId: bId,
      proUserId: proAuth.session?.userId!,
      labourCost: 900,
      materialCost: 500,
      additionalCharges: 100,
      estimatedDuration: '3 days',
      workIncluded: 'Design, fabrication, installation, primed finish',
      workExcluded: 'Painting / topcoat'
    });

    assert.strictEqual(estRes.success, true);
    assert.strictEqual(estRes.estimate?.totalCost, 1500);

    // Customer accepts estimate
    const accRes = acceptEstimate(estRes.estimate!.id, custAuth.session?.userId!);
    assert.strictEqual(accRes.success, true);

    const est = getEstimateById(estRes.estimate!.id);
    assert.strictEqual(est?.status, 'ACCEPTED');

    const updatedBooking = getBookingById(bId);
    assert.strictEqual(updatedBooking?.finalAmount, 1500);
  });

  console.log('\n[6. Verified Reviews & Rating Enforcement]');

  it('Should allow eligible customer to submit review on COMPLETED booking', () => {
    const res = submitReview({
      bookingId: testBookingId,
      customerUserId: custAuth.session?.userId!,
      overallRating: 5,
      punctualityRating: 5,
      workmanshipRating: 5,
      communicationRating: 5,
      valueRating: 5,
      comment: 'Superb floating shelves! Extremely sturdy and seamless alignment.'
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.review?.overallRating, 5);
  });

  it('Should prevent duplicate review for the same booking', () => {
    const dupRes = submitReview({
      bookingId: testBookingId,
      customerUserId: custAuth.session?.userId!,
      overallRating: 4,
      punctualityRating: 4,
      workmanshipRating: 4,
      communicationRating: 4,
      valueRating: 4,
      comment: 'Trying to post second review.'
    });

    assert.strictEqual(dupRes.success, false);
    assert.ok(dupRes.error?.includes('already been submitted'));
  });

  console.log('\n[7. Customer Complaints & Disputes]');

  it('Should allow customer to submit a formal complaint against a booking', () => {
    const res = submitComplaint({
      bookingId: testBookingId,
      customerUserId: custAuth.session?.userId!,
      category: 'SCOPE_DISPUTE',
      description: 'Minor dispute regarding touch-up paint coverage.'
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.complaint?.complaintNumber);

    const all = getAllComplaints();
    assert.ok(all.some((c) => c.id === res.complaint?.id));
  });

  console.log('\n[8. Administrator Controls, Verifications & Moderation]');

  it('Should return comprehensive admin metrics', () => {
    const metrics = getAdminMetrics();
    assert.ok(metrics.totalCustomers >= 2);
    assert.ok(metrics.totalProfessionals >= 5);
    assert.ok(metrics.totalBookings >= 3);
  });

  it('Should allow admin to review and approve verification records', () => {
    const adminAuth = authenticateUser('admin@workdone.com', 'WorkdoneAdmin2026!');
    const pro = getProfessionalById(proAuth.session?.proProfileId!)!;

    const sub = submitVerification({
      proProfileId: pro.id,
      stage: 'QUALIFICATIONS',
      documentType: 'CERTIFICATION',
      documentNumber: 'CERT-WOOD-991'
    });

    const rev = reviewVerificationRecord(sub.recordId!, adminAuth.session?.userId!, true);
    assert.strictEqual(rev.success, true);
  });

  it('Should allow admin to toggle user active/suspended status', () => {
    const adminAuth = authenticateUser('admin@workdone.com', 'WorkdoneAdmin2026!');
    const testCust = authenticateUser('michael.chang@example.com', 'WorkdoneDemo2026!');

    // Suspend
    const suspendRes = toggleUserActiveStatus(testCust.session?.userId!, adminAuth.session?.userId!, false, 'Policy violation');
    assert.strictEqual(suspendRes.success, true);

    const suspendedUser = getUserById(testCust.session?.userId!);
    assert.strictEqual(suspendedUser?.isActive, false);

    // Reactivate
    const reactivateRes = toggleUserActiveStatus(testCust.session?.userId!, adminAuth.session?.userId!, true);
    assert.strictEqual(reactivateRes.success, true);
  });

  console.log('\n[9. Frontend Views & UI Component Rendering]');

  it('Should render Homepage with all required sections', async () => {
    const { renderHomeView } = await import('../views/homeView.ts');
    const { getServiceCategories, getFeaturedProfessionals } = await import('../services/adminService.ts').then(async (m) => {
      const p = await import('../services/proService.ts');
      return { getServiceCategories: m.getServiceCategories, getFeaturedProfessionals: p.getFeaturedProfessionals };
    });
    const categories = getServiceCategories();
    const featured = getFeaturedProfessionals(4);
    const html = renderHomeView(categories, featured);

    assert.ok(html.includes('Find Skilled Professionals You Can Trust'));
    assert.ok(html.includes('From tiles and furniture to plumbing'));
    assert.ok(html.includes('Popular Service Categories'));
    assert.ok(html.includes('How Workdone Works'));
    assert.ok(html.includes('Built For Transparency'));
    assert.ok(html.includes('Your Skills Deserve More Opportunities'));
  });

  it('Should render Find Professionals Search view with active filters and cards', async () => {
    const { renderSearchView } = await import('../views/searchView.ts');
    const { getServiceCategories } = await import('../services/adminService.ts');
    const { searchProfessionals } = await import('../services/proService.ts');

    const search = searchProfessionals({});
    const html = renderSearchView({
      categories: getServiceCategories(),
      professionals: search.professionals,
      total: search.total,
      page: search.page,
      totalPages: search.totalPages,
      filters: {}
    });

    assert.ok(html.includes('Find Skilled Professionals'));
    assert.ok(html.includes('Filters'));
    assert.ok(html.includes('Sort By'));
  });

  it('Should render Public Professional Profile with portfolio and reviews', async () => {
    const { renderProProfileView } = await import('../views/proProfileView.ts');
    const pro = getProfessionalById(proAuth.session?.proProfileId!)!;
    const html = renderProProfileView(pro, false);

    assert.ok(html.includes(pro.user?.name!));
    assert.ok(html.includes('About &amp; Experience'));
    assert.ok(html.includes('Work Portfolio'));
    assert.ok(html.includes('Verified Customer Reviews'));
    assert.ok(html.includes('Request a Booking'));
  });

  it('Should render Side-by-Side Professional Comparison Matrix', async () => {
    const { renderCompareView } = await import('../views/compareView.ts');
    const pros = searchProfessionals({ pageSize: 3 }).professionals;
    const html = renderCompareView(pros);

    assert.ok(html.includes('Side-by-Side Professional Comparison'));
    assert.ok(html.includes('Verified Credentials'));
    assert.ok(html.includes('Trade Experience'));
    assert.ok(html.includes('Starting Price Guidance'));
  });

  it('Should render Customer Dashboard tabs and booking records', async () => {
    const { renderCustomerDashView } = await import('../views/customerDashView.ts');
    const { getCustomerBookings } = await import('../services/bookingService.ts');
    const { getCustomerProfileByUserId } = await import('../services/userService.ts');

    const cust = getUserById(custAuth.session?.userId!)!;
    const prof = getCustomerProfileByUserId(cust.id);
    const bookings = getCustomerBookings(prof?.id!);

    const html = renderCustomerDashView({
      user: cust,
      profile: prof,
      bookings,
      savedPros: [],
      notifications: [],
      activeTab: 'requests'
    });

    assert.ok(html.includes('Customer Dashboard'));
    assert.ok(html.includes('Booking Requests'));
  });

  it('Should render Professional Dashboard with completion checklist and jobs', async () => {
    const { renderProDashView } = await import('../views/proDashView.ts');
    const { getProBookings } = await import('../services/bookingService.ts');

    const proUser = getUserById(proAuth.session?.userId!)!;
    const proProfile = getProfessionalById(proAuth.session?.proProfileId!)!;
    const bookings = getProBookings(proProfile.id);

    const html = renderProDashView({
      user: proUser,
      proProfile,
      bookings,
      notifications: [],
      activeTab: 'requests'
    });

    assert.ok(html.includes('Professional Workspace'));
    assert.ok(html.includes('Profile Completion'));
    assert.ok(html.includes('Active Jobs'));
  });

  it('Should render Super Admin Dashboard with metrics and moderation queue', async () => {
    const { renderAdminDashView } = await import('../views/adminDashView.ts');
    const { getAdminMetrics, getAllUsers, getReportedReviews, getAuditLogs } = await import('../services/adminService.ts');
    const { getPendingVerifications } = await import('../services/verificationService.ts');
    const { getAllComplaints } = await import('../services/complaintService.ts');

    const html = renderAdminDashView({
      metrics: getAdminMetrics(),
      pendingVerifications: getPendingVerifications(),
      users: getAllUsers(),
      reportedReviews: getReportedReviews(),
      complaints: getAllComplaints(),
      auditLogs: getAuditLogs(10),
      activeTab: 'overview'
    });

    assert.ok(html.includes('Platform Administration'));
    assert.ok(html.includes('Registered Customers'));
    assert.ok(html.includes('Pending Verifications'));
    assert.ok(html.includes('Booking Completion Rate'));
  });

  console.log('\n============================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
