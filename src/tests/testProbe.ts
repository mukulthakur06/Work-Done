// End-to-end HTTP integration test probe using node:http
import * as http from 'node:http';
import { server } from '../server.ts';

function httpGet(url: string, headers: Record<string, string> = {}): Promise<{ status: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: 'GET',
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body: data }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function httpPost(url: string, jsonBody: any, headers: Record<string, string> = {}): Promise<{ status: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(jsonBody);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...headers
        }
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body: data }));
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runProbe() {
  const PORT = 3099;
  const baseUrl = `http://127.0.0.1:${PORT}`;

  await new Promise<void>((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[Test Probe] Test server listening on ${baseUrl}`);
      resolve();
    });
  });

  try {
    // 1. GET /
    console.log('Testing GET / ...');
    const resHome = await httpGet(`${baseUrl}/`);
    console.log(`  Status: ${resHome.status}`);
    if (!resHome.body.includes('Find Skilled Professionals You Can Trust')) {
      throw new Error('Homepage missing hero title');
    }
    console.log('  ✓ Hero title verified on Homepage');

    // 2. GET /professionals
    console.log('Testing GET /professionals ...');
    const resPros = await httpGet(`${baseUrl}/professionals`);
    console.log(`  Status: ${resPros.status}`);
    if (!resPros.body.includes('Find Skilled Professionals')) {
      throw new Error('Search page missing title');
    }
    console.log('  ✓ Search page verified');

    // 3. GET /api/professionals
    console.log('Testing GET /api/professionals ...');
    const resApiPros = await httpGet(`${baseUrl}/api/professionals`);
    const prosJson = JSON.parse(resApiPros.body);
    console.log(`  Status: ${resApiPros.status}, Returned ${prosJson.professionals.length} professionals, Total: ${prosJson.total}`);
    if (prosJson.total < 5) throw new Error('Expected at least 5 professionals in database');
    console.log('  ✓ API Professionals endpoint verified');

    // 4. POST /api/auth/login (Customer)
    console.log('Testing POST /api/auth/login (Customer)...');
    const resLogin = await httpPost(`${baseUrl}/api/auth/login`, {
      email: 'sarah.jenkins@example.com',
      password: 'WorkdoneDemo2026!'
    });
    const loginJson = JSON.parse(resLogin.body);
    console.log(`  Status: ${resLogin.status}, Success: ${loginJson.success}, Role: ${loginJson.user?.role}`);
    const setCookie = resLogin.headers['set-cookie'];
    const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    if (!cookie) throw new Error('Missing session cookie on login');
    console.log('  ✓ Customer login & session cookie verified');

    // 5. GET /dashboard/customer with session cookie
    console.log('Testing GET /dashboard/customer with cookie ...');
    const resDash = await httpGet(`${baseUrl}/dashboard/customer`, { Cookie: cookie });
    console.log(`  Status: ${resDash.status}`);
    if (!resDash.body.includes('Customer Dashboard')) {
      throw new Error('Dashboard page failed to render');
    }
    console.log('  ✓ Customer dashboard rendered with active session');

    // 6. GET /admin without admin session (Should return 403)
    console.log('Testing GET /admin unauthorized protection ...');
    const resAdminForbidden = await httpGet(`${baseUrl}/admin`);
    console.log(`  Status: ${resAdminForbidden.status} (Expected 403)`);
    if (resAdminForbidden.status !== 403) {
      throw new Error(`Expected 403 on protected admin route, got ${resAdminForbidden.status}`);
    }
    console.log('  ✓ Server-side admin route protection verified');

    // 7. Login as ADMIN and access /admin
    console.log('Testing Admin login & dashboard access ...');
    const resAdminLogin = await httpPost(`${baseUrl}/api/auth/login`, {
      email: 'admin@workdone.com',
      password: 'WorkdoneAdmin2026!'
    });
    const adminSetCookie = resAdminLogin.headers['set-cookie'];
    const adminCookie = Array.isArray(adminSetCookie) ? adminSetCookie[0] : adminSetCookie;
    const resAdminDash = await httpGet(`${baseUrl}/admin`, { Cookie: adminCookie! });
    console.log(`  Admin Dashboard Status: ${resAdminDash.status}`);
    if (!resAdminDash.body.includes('Platform Administration')) {
      throw new Error('Admin dashboard failed to render for admin user');
    }
    console.log('  ✓ Super Admin access verified');

    console.log('\n============================================================');
    console.log('  ALL END-TO-END HTTP PROBES & ROUTES VERIFIED SUCCESSFULLY ');
    console.log('============================================================\n');
    server.close();
  } catch (err) {
    server.close();
    console.error('[PROBE ERROR DETAILS]:', err);
    process.exit(1);
  }
}

runProbe();
