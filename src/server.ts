// Workdone Main Application Server
import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getDb } from './db/database.ts';
import { parseCookies, verifySessionToken } from './auth/auth.ts';
import { handleApiRoute } from './routes/apiRoutes.ts';
import { getServiceCategories, getAdminMetrics, getAllUsers, getReportedReviews, getAuditLogs } from './services/adminService.ts';
import { getFeaturedProfessionals, searchProfessionals, getProfessionalById, getProfessionalByUserId, getSavedProfessionals, isProfessionalSaved } from './services/proService.ts';
import { getCustomerBookings, getProBookings } from './services/bookingService.ts';
import { getUserById, getCustomerProfileByUserId } from './services/userService.ts';
import { getUserNotifications } from './services/notificationService.ts';
import { getAllComplaints } from './services/complaintService.ts';
import { getPendingVerifications } from './services/verificationService.ts';

// View Renderers
import { renderLayout } from './views/layout.ts';
import { renderHomeView } from './views/homeView.ts';
import { renderSearchView } from './views/searchView.ts';
import { renderProProfileView } from './views/proProfileView.ts';
import { renderCompareView } from './views/compareView.ts';
import { renderCustomerDashView } from './views/customerDashView.ts';
import { renderProDashView } from './views/proDashView.ts';
import { renderAdminDashView } from './views/adminDashView.ts';
import { renderCustomerRegisterView, renderProRegisterView } from './views/authViews.ts';
import { renderContactView } from './views/contactView.ts';
import {
  renderCategoriesView,
  renderHowItWorksView,
  renderForProfessionalsView,
  renderPrivacyPolicyView,
  renderTermsView,
  renderGuidelinesView,
  renderProblemReportView
} from './views/staticPages.ts';

const PORT = Number(process.env.PORT) || 3000;

// Initialize database schema on startup
getDb();

// Helper to parse request body safely
async function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        // 5MB limit
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({});
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(data);
        const obj: Record<string, any> = {};
        for (const [k, v] of params.entries()) {
          obj[k] = v;
        }
        resolve(obj);
      } else {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // Cookie & session parsing
    const cookies = parseCookies(req.headers.cookie);
    let session = cookies.wd_session ? verifySessionToken(cookies.wd_session) : null;
    // Fallback if session cookie stored plain JSON in dev
    if (!session && cookies.wd_session) {
      try {
        session = JSON.parse(cookies.wd_session);
      } catch {
        session = null;
      }
    }

    const unreadCount = session ? getUserNotifications(session.userId).unreadCount : 0;

    // Helper HTML sender
    const sendHtml = (html: string, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    };

    // Helper redirect
    const redirect = (target: string) => {
      res.writeHead(302, { Location: target });
      res.end();
    };

    // 1. Static Asset Serving
    if (pathname === '/css/app.css') {
      const cssPath = path.join(process.cwd(), 'public', 'css', 'app.css');
      const fallbackPath = path.join(process.cwd(), 'src', 'public', 'css', 'app.css');
      const targetPath = fs.existsSync(cssPath) ? cssPath : fallbackPath;
      if (fs.existsSync(targetPath)) {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        return res.end(fs.readFileSync(targetPath));
      }
    }

    if (pathname === '/js/app.js') {
      const jsPath = path.join(process.cwd(), 'public', 'js', 'app.js');
      const fallbackPath = path.join(process.cwd(), 'src', 'public', 'js', 'app.js');
      const targetPath = fs.existsSync(jsPath) ? jsPath : fallbackPath;
      if (fs.existsSync(targetPath)) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        return res.end(fs.readFileSync(targetPath));
      }
    }

    // 2. Parse request body for POST/PUT/DELETE
    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '') ? await parseBody(req) : {};

    // 3. API Endpoints
    if (pathname.startsWith('/api/')) {
      const handled = await handleApiRoute(req, res, pathname, session, body);
      if (handled) return;
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'API route not found' }));
    }

    // 4. Web Page Routes

    // Homepage
    if (pathname === '/') {
      const categories = getServiceCategories();
      const featuredPros = getFeaturedProfessionals(6);
      const content = renderHomeView(categories, featuredPros);
      return sendHtml(renderLayout(content, { currentPath: '/', session, unreadNotificationsCount: unreadCount }));
    }

    // Find Professionals (Search & Filters)
    if (pathname === '/professionals') {
      const categories = getServiceCategories();
      const keyword = url.searchParams.get('keyword') || undefined;
      const categorySlug = url.searchParams.get('category') || undefined;
      const city = url.searchParams.get('city') || undefined;
      const minRating = url.searchParams.get('minRating') ? Number(url.searchParams.get('minRating')) : undefined;
      const experience = url.searchParams.get('experience') || undefined;
      const verification = url.searchParams.get('verification') || undefined;
      const availability = url.searchParams.get('availability') || undefined;
      const sortBy = url.searchParams.get('sortBy') || 'rating';
      const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;

      const searchResult = searchProfessionals({
        keyword,
        categorySlug,
        city,
        minRating,
        experience,
        verification,
        availability,
        sortBy: sortBy as any,
        page,
        pageSize: 12
      });

      const content = renderSearchView({
        categories,
        professionals: searchResult.professionals,
        total: searchResult.total,
        page: searchResult.page,
        totalPages: searchResult.totalPages,
        filters: { keyword, categorySlug, city, minRating, experience, verification, availability, sortBy }
      });

      return sendHtml(
        renderLayout(content, {
          title: 'Find Professionals',
          currentPath: '/professionals',
          session,
          unreadNotificationsCount: unreadCount
        })
      );
    }

    // Compare Professionals View
    if (pathname === '/professionals/compare') {
      const idsParam = url.searchParams.get('ids') || '';
      const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
      const pros = ids.map((id) => getProfessionalById(id)).filter((p): p is any => p !== null);
      const content = renderCompareView(pros);
      return sendHtml(
        renderLayout(content, {
          title: 'Compare Professionals',
          currentPath: '/professionals/compare',
          session,
          unreadNotificationsCount: unreadCount
        })
      );
    }

    // Public Professional Profile Page
    if (pathname.startsWith('/professionals/') && !pathname.includes('/compare')) {
      const proId = pathname.replace('/professionals/', '');
      const pro = getProfessionalById(proId);
      if (!pro) {
        return sendHtml(
          renderLayout('<div class="container" style="padding: 4rem 1.25rem;"><h2>Professional Profile Not Found</h2></div>', {
            title: 'Not Found',
            session
          }),
          404
        );
      }
      const isSaved = session?.customerProfileId ? isProfessionalSaved(session.customerProfileId, pro.id) : false;
      const content = renderProProfileView(pro, isSaved);
      return sendHtml(
        renderLayout(content, {
          title: `${pro.user?.name || 'Professional'} (${pro.businessName || 'Specialist'})`,
          currentPath: pathname,
          session,
          unreadNotificationsCount: unreadCount
        })
      );
    }

    // Categories Catalog
    if (pathname === '/categories') {
      const categories = getServiceCategories();
      const content = renderCategoriesView(categories);
      return sendHtml(
        renderLayout(content, {
          title: 'Service Categories',
          currentPath: '/categories',
          session,
          unreadNotificationsCount: unreadCount
        })
      );
    }

    // How It Works
    if (pathname === '/how-it-works') {
      const content = renderHowItWorksView();
      return sendHtml(
        renderLayout(content, {
          title: 'How It Works',
          currentPath: '/how-it-works',
          session,
          unreadNotificationsCount: unreadCount
        })
      );
    }

    // For Professionals
    if (pathname === '/for-professionals') {
      const content = renderForProfessionalsView();
      return sendHtml(
        renderLayout(content, {
          title: 'For Professionals & Contractors',
          currentPath: '/for-professionals',
          session,
          unreadNotificationsCount: unreadCount
        })
      );
    }

    // Customer Registration
    if (pathname === '/register/customer') {
      if (session) return redirect('/dashboard/customer');
      const content = renderCustomerRegisterView();
      return sendHtml(renderLayout(content, { title: 'Join as a Customer', currentPath: '/register/customer' }));
    }

    // Professional Registration
    if (pathname === '/register/pro') {
      if (session) return redirect('/dashboard/pro');
      const categories = getServiceCategories();
      const content = renderProRegisterView(categories);
      return sendHtml(renderLayout(content, { title: 'Join as a Professional', currentPath: '/register/pro' }));
    }

    // Protected Customer Dashboard
    if (pathname === '/dashboard/customer') {
      if (!session) return redirect('/?login=required');
      if (session.role === 'PROFESSIONAL') return redirect('/dashboard/pro');

      const user = getUserById(session.userId);
      const custProfile = getCustomerProfileByUserId(session.userId);
      if (!user) return redirect('/?login=invalid');

      const customerProfileId = custProfile?.id || session.customerProfileId || '';
      const bookings = customerProfileId ? getCustomerBookings(customerProfileId) : [];
      const savedPros = customerProfileId ? getSavedProfessionals(customerProfileId) : [];
      const notifData = getUserNotifications(session.userId);

      const activeTab = url.searchParams.get('tab') || 'requests';
      const content = renderCustomerDashView({
        user,
        profile: custProfile,
        bookings,
        savedPros,
        notifications: notifData.notifications,
        activeTab
      });

      return sendHtml(
        renderLayout(content, {
          title: 'Customer Dashboard',
          currentPath: '/dashboard/customer',
          session,
          unreadNotificationsCount: notifData.unreadCount
        })
      );
    }

    // Protected Professional Dashboard
    if (pathname === '/dashboard/pro') {
      if (!session) return redirect('/?login=required');
      if (session.role === 'CUSTOMER') return redirect('/dashboard/customer');

      const user = getUserById(session.userId);
      const proProfile = getProfessionalByUserId(session.userId);
      if (!user || !proProfile) return redirect('/?login=invalid');

      const bookings = getProBookings(proProfile.id);
      const notifData = getUserNotifications(session.userId);
      const activeTab = url.searchParams.get('tab') || 'requests';

      const content = renderProDashView({
        user,
        proProfile,
        bookings,
        notifications: notifData.notifications,
        activeTab
      });

      return sendHtml(
        renderLayout(content, {
          title: 'Professional Dashboard',
          currentPath: '/dashboard/pro',
          session,
          unreadNotificationsCount: notifData.unreadCount
        })
      );
    }

    // Protected Admin Dashboard
    if (pathname === '/admin') {
      if (!session || session.role !== 'ADMIN') {
        return sendHtml(
          renderLayout(
            `<div class="container" style="padding: 4rem 1.25rem; text-align: center;">
              <h2 style="color: #dc2626;">Access Denied</h2>
              <p style="margin: 1rem 0;">You must be signed in with an Administrator account to view this portal.</p>
              <button onclick="WorkdoneApp.openModal('signin-modal')" class="btn btn-primary">Sign In as Admin</button>
            </div>`,
            { title: 'Admin Restricted', session }
          ),
          403
        );
      }

      const metrics = getAdminMetrics();
      const pendingVerifications = getPendingVerifications();
      const users = getAllUsers();
      const reportedReviews = getReportedReviews();
      const complaints = getAllComplaints();
      const auditLogs = getAuditLogs(50);
      const activeTab = url.searchParams.get('tab') || 'overview';

      const content = renderAdminDashView({
        metrics,
        pendingVerifications,
        users,
        reportedReviews,
        complaints,
        auditLogs,
        activeTab
      });

      return sendHtml(
        renderLayout(content, {
          title: 'Administrator Dashboard',
          currentPath: '/admin',
          session,
          unreadNotificationsCount: 0
        })
      );
    }

    // Informational Static Pages
    if (pathname === '/privacy-policy') {
      return sendHtml(renderLayout(renderPrivacyPolicyView(), { title: 'Privacy Policy', session }));
    }
    if (pathname === '/terms-conditions') {
      return sendHtml(renderLayout(renderTermsView(), { title: 'Terms & Conditions', session }));
    }
    if (pathname === '/community-guidelines') {
      return sendHtml(renderLayout(renderGuidelinesView(), { title: 'Community Standards', session }));
    }
    if (pathname === '/contact') {
      return sendHtml(renderLayout(renderContactView(session), { title: 'Contact Support & Inquiries', session }));
    }
    if (pathname === '/report-a-problem') {
      return sendHtml(renderLayout(renderProblemReportView(session), { title: 'Report a Problem - Workdone', session }));
    }

    // 404 Catch-All
    sendHtml(
      renderLayout(
        `<div class="container" style="text-align: center; padding: 5rem 1.25rem;">
          <h1 style="font-size: 3rem; color: var(--primary); margin-bottom: 0.5rem;">404</h1>
          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Page Not Found</h2>
          <p style="color: var(--text-muted); margin-bottom: 2rem;">The page you are looking for does not exist or has been moved.</p>
          <a href="/" class="btn btn-primary">Return Home</a>
        </div>`,
        { title: 'Page Not Found', session }
      ),
      404
    );
  } catch (err) {
    console.error('Unhandled server error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>500 - Internal Server Error</h1><p>An unexpected error occurred. Please try again.</p>');
    }
  }
}

const server = http.createServer(handleRequest);

// Start the server if executed directly
if (process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'))) {
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
  server.listen(PORT, host, () => {
    console.log(`[Workdone] Server running at http://${host}:${PORT}`);
    console.log(`[Workdone] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export { server, handleRequest };
export default handleRequest;
