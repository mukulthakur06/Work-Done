// Workdone Database Seeder — Clearly Labelled Demo Data
import * as crypto from 'node:crypto';
import { getDb, execute, runTransaction } from './database.ts';
import { hashPassword } from '../auth/auth.ts';

export function runSeed(): void {
  const db = getDb();
  console.log('[Seed] Seeding database with realistic development data...');

  runTransaction(() => {
    const now = new Date().toISOString();
    const defaultPasswordHash = hashPassword('WorkdoneDemo2026!');
    const adminPasswordHash = hashPassword('WorkdoneAdmin2026!');

    // 1. Service Categories (12 Categories from Requirements)
    const categories = [
      {
        slug: 'carpentry',
        name: 'Carpentry & Furniture',
        description: 'Custom furniture, cabinetry, modular kitchens, wooden repairs, doors & windows installation.',
        icon: 'hammer',
        order: 1
      },
      {
        slug: 'plumbing',
        name: 'Plumbing Services',
        description: 'Leak detection, pipe repairs, bathroom fitting, sanitary installations, water heater & pump repair.',
        icon: 'droplets',
        order: 2
      },
      {
        slug: 'electrical',
        name: 'Electrical Services',
        description: 'Wiring, circuit repairs, panel upgrades, lighting installations, EV charger setups & safety audits.',
        icon: 'zap',
        order: 3
      },
      {
        slug: 'tile-flooring',
        name: 'Tile & Flooring Installation',
        description: 'Ceramic & porcelain tiles, hardwood, vinyl planks, Italian marble polishing, grouting & waterproofing.',
        icon: 'grid',
        order: 4
      },
      {
        slug: 'painting',
        name: 'Painting & Wall Finishes',
        description: 'Interior & exterior painting, texture walls, stencil designs, waterproof coatings & wallpaper installation.',
        icon: 'paint-bucket',
        order: 5
      },
      {
        slug: 'interior-design',
        name: 'Interior Design & Decor',
        description: 'Full residential space planning, 3D renderings, material selection, lighting design & turnkey execution.',
        icon: 'layout',
        order: 6
      },
      {
        slug: 'masonry-civil',
        name: 'Masonry & Civil Work',
        description: 'Brickwork, plastering, structural repairs, concrete driveways, foundation waterproofing & boundary walls.',
        icon: 'brick-wall',
        order: 7
      },
      {
        slug: 'ac-repair',
        name: 'AC Installation & Repair',
        description: 'Split & central AC installation, gas refilling, duct cleaning, annual maintenance & inverter repairs.',
        icon: 'wind',
        order: 8
      },
      {
        slug: 'home-cleaning',
        name: 'Deep Cleaning & Sanitization',
        description: 'Post-construction deep cleaning, kitchen degreasing, sofa & carpet shampooing, bathroom descaling.',
        icon: 'sparkles',
        order: 9
      },
      {
        slug: 'welding-fabrication',
        name: 'Welding & Metal Fabrication',
        description: 'Iron safety gates, stainless steel railings, window grills, shed framing & custom metal structures.',
        icon: 'flame',
        order: 10
      },
      {
        slug: 'false-ceiling',
        name: 'False Ceiling & Gypsum Work',
        description: 'Designer POP ceilings, acoustic gypsum boards, cove lighting channels, grid ceilings & partition walls.',
        icon: 'layers',
        order: 11
      },
      {
        slug: 'general-renovation',
        name: 'General Home Renovation',
        description: 'Full house remodelling, kitchen & bathroom overhauls, room extensions & end-to-end contracting.',
        icon: 'home',
        order: 12
      }
    ];

    const categoryMap = new Map<string, string>();

    for (const cat of categories) {
      let existing = db.prepare('SELECT id FROM service_categories WHERE slug = ?').get(cat.slug) as any;
      if (!existing) {
        const catId = crypto.randomUUID();
        execute(
          `INSERT INTO service_categories (id, slug, name, description, icon_name, sort_order, is_active, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
          [catId, cat.slug, cat.name, cat.description, cat.icon, cat.order, now]
        );
        categoryMap.set(cat.slug, catId);
      } else {
        categoryMap.set(cat.slug, existing.id);
      }
    }

    // 2. Administrator User
    const adminEmail = 'admin@workdone.com';
    let admin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail) as any;
    let adminUserId: string;
    if (!admin) {
      adminUserId = crypto.randomUUID();
      execute(
        `INSERT INTO users (id, email, password_hash, role, name, phone, avatar_url, is_active, is_email_verified, is_phone_verified, created_at, updated_at)
         VALUES (?, ?, ?, 'ADMIN', 'System Administrator', '+1-555-0100', NULL, 1, 1, 1, ?, ?)`,
        [adminUserId, adminEmail, adminPasswordHash, now, now]
      );
    } else {
      adminUserId = admin.id;
    }

    // 3. Customer Users & Profiles
    const customersData = [
      {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        phone: '+1-555-0121',
        city: 'Austin',
        locality: 'Downtown',
        pinCode: '78701',
        address: '401 Colorado St, Austin, TX'
      },
      {
        name: 'Michael Chang',
        email: 'michael.chang@example.com',
        phone: '+1-555-0122',
        city: 'Austin',
        locality: 'South Congress',
        pinCode: '78704',
        address: '1200 S Congress Ave, Austin, TX'
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+1-555-0123',
        city: 'Seattle',
        locality: 'Capitol Hill',
        pinCode: '98102',
        address: '1520 11th Ave, Seattle, WA'
      }
    ];

    const customerIds: { userId: string; profileId: string; name: string }[] = [];

    for (const c of customersData) {
      let u = db.prepare('SELECT id FROM users WHERE email = ?').get(c.email) as any;
      let uId: string;
      let pId: string;
      if (!u) {
        uId = crypto.randomUUID();
        pId = crypto.randomUUID();
        execute(
          `INSERT INTO users (id, email, password_hash, role, name, phone, avatar_url, is_active, is_email_verified, is_phone_verified, created_at, updated_at)
           VALUES (?, ?, ?, 'CUSTOMER', ?, ?, NULL, 1, 1, 0, ?, ?)`,
          [uId, c.email, defaultPasswordHash, c.name, c.phone, now, now]
        );
        execute(
          `INSERT INTO customer_profiles (id, user_id, address, city, locality, pin_code, preferred_contact, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'IN_APP', ?, ?)`,
          [pId, uId, c.address, c.city, c.locality, c.pinCode, now, now]
        );
      } else {
        uId = u.id;
        let prof = db.prepare('SELECT id FROM customer_profiles WHERE user_id = ?').get(uId) as any;
        pId = prof.id;
      }
      customerIds.push({ userId: uId, profileId: pId, name: c.name });
    }

    // 4. Professional Users & Profiles
    const professionalsData = [
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        phone: '+1-555-0131',
        businessName: 'Vance Custom Woodcraft & Cabinetry',
        categorySlug: 'carpentry',
        yearsExperience: 14,
        city: 'Austin',
        locality: 'South Congress',
        pinCode: '78704',
        startingPrice: 85,
        rating: 4.9,
        reviewsCount: 38,
        completedJobs: 42,
        verificationStatus: 'FULLY_VERIFIED',
        bio: 'Specialist in custom kitchen cabinets, handcrafted dining furniture, hardwood staircases, and space-saving built-in wardrobes. Fully equipped mobile workshop with 14 years of professional experience.',
        portfolios: [
          {
            title: 'Modern Minimalist Kitchen Cabinetry',
            category: 'Carpentry & Furniture',
            cost: 4200,
            desc: 'Custom matte navy shaker cabinetry with soft-close Blum hardware and integrated quartz countertop overhang.',
            media: [
              'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80'
            ]
          },
          {
            title: 'Walnut Dining Table & Bench Set',
            category: 'Carpentry & Furniture',
            cost: 1850,
            desc: 'Solid American black walnut live-edge 8-seater dining table finished with durable satin polyurethane.',
            media: [
              'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80'
            ]
          }
        ]
      },
      {
        name: 'David Miller',
        email: 'david.miller@example.com',
        phone: '+1-555-0132',
        businessName: 'Apex Precision Plumbing & Gas',
        categorySlug: 'plumbing',
        yearsExperience: 12,
        city: 'Austin',
        locality: 'Downtown',
        pinCode: '78701',
        startingPrice: 75,
        rating: 4.8,
        reviewsCount: 44,
        completedJobs: 51,
        verificationStatus: 'FULLY_VERIFIED',
        bio: 'Licensed Master Plumber specializing in copper and PEX repiping, luxury bathroom fixtures, tankless water heater installations, and 24/7 non-invasive acoustic leak diagnostics.',
        portfolios: [
          {
            title: 'Luxury Master Bathroom Plumbing Overhaul',
            category: 'Plumbing Services',
            cost: 2900,
            desc: 'Concealed thermostatic rainfall shower system, dual floating vanities, and freestanding tub rough-in.',
            media: [
              'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
            ]
          }
        ]
      },
      {
        name: 'Carlos Rodriguez',
        email: 'carlos.rodriguez@example.com',
        phone: '+1-555-0133',
        businessName: 'SparkCraft Electrical & Smart Home',
        categorySlug: 'electrical',
        yearsExperience: 9,
        city: 'Austin',
        locality: 'East Austin',
        pinCode: '78702',
        startingPrice: 90,
        rating: 4.9,
        reviewsCount: 29,
        completedJobs: 34,
        verificationStatus: 'FULLY_VERIFIED',
        bio: 'Certified Electrical Contractor specializing in whole-home rewiring, 200A breaker panel upgrades, architectural recessed LED arrays, and EV Level-2 charger installations.',
        portfolios: [
          {
            title: 'Modern Smart Home Panel & Architectural Lighting',
            category: 'Electrical Services',
            cost: 3400,
            desc: 'Sub-panel distribution, smart dimmers throughout 3,000 sq ft home, and Level-2 Tesla wall connector installation.',
            media: [
              'https://images.unsplash.com/photo-1558441719-755f11e9f50e?auto=format&fit=crop&w=800&q=80'
            ]
          }
        ]
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        phone: '+1-555-0134',
        businessName: 'Atelier Rostova Interior Studio',
        categorySlug: 'interior-design',
        yearsExperience: 10,
        city: 'Austin',
        locality: 'West Lake Hills',
        pinCode: '78746',
        startingPrice: 120,
        rating: 5.0,
        reviewsCount: 22,
        completedJobs: 26,
        verificationStatus: 'FULLY_VERIFIED',
        bio: 'Award-nominated residential interior designer crafting serene, functional living environments with organic textures, custom lighting schemes, and bespoke millwork execution.',
        portfolios: [
          {
            title: 'Hill Country Modern Living Transformation',
            category: 'Interior Design & Decor',
            cost: 8500,
            desc: 'Turnkey interior architecture, custom limewash walls, acoustic slatted oak paneling, and curated Scandinavian furnishings.',
            media: [
              'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
            ]
          }
        ]
      },
      {
        name: 'James O’Connor',
        email: 'james.oconnor@example.com',
        phone: '+1-555-0135',
        businessName: 'O’Connor Artisan Tile & Stone',
        categorySlug: 'tile-flooring',
        yearsExperience: 16,
        city: 'Austin',
        locality: 'Zilker',
        pinCode: '78704',
        startingPrice: 65,
        rating: 4.8,
        reviewsCount: 31,
        completedJobs: 37,
        verificationStatus: 'IDENTITY_VERIFIED',
        bio: 'Specialist in large-format porcelain slabs, herringbone marble floors, custom curbless walk-in showers with Schluter-Kerdi waterproof containment membranes.',
        portfolios: [
          {
            title: 'Curbless Herringbone Marble Wetroom',
            category: 'Tile & Flooring Installation',
            cost: 3800,
            desc: 'Carrara marble herringbone shower surround with heated Schluter-Ditra subfloor and epoxy grout.',
            media: [
              'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'
            ]
          }
        ]
      },
      {
        name: 'Anita Sharma',
        email: 'anita.sharma@example.com',
        phone: '+1-555-0136',
        businessName: 'Pristine Coat Surface Specialists',
        categorySlug: 'painting',
        yearsExperience: 8,
        city: 'Seattle',
        locality: 'Capitol Hill',
        pinCode: '98102',
        startingPrice: 50,
        rating: 4.7,
        reviewsCount: 19,
        completedJobs: 24,
        verificationStatus: 'BUSINESS_VERIFIED',
        bio: 'Precision interior and exterior residential painting. Premium zero-VOC coatings, flawless spray finishes for cabinetry, thorough surface preparation, and drywall repair.',
        portfolios: [
          {
            title: 'Historic Craftsman Full Interior Repaint',
            category: 'Painting & Wall Finishes',
            cost: 2600,
            desc: 'Restoration of heritage crown moldings, smooth wall skim coating, and Benjamin Moore matte finish.',
            media: [
              'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80'
            ]
          }
        ]
      },
      {
        name: 'Samuel Chen',
        email: 'samuel.chen@example.com',
        phone: '+1-555-0137',
        businessName: 'BreezeAir Climate Systems',
        categorySlug: 'ac-repair',
        yearsExperience: 11,
        city: 'Austin',
        locality: 'North Loop',
        pinCode: '78751',
        startingPrice: 80,
        rating: 4.8,
        reviewsCount: 35,
        completedJobs: 40,
        verificationStatus: 'FULLY_VERIFIED',
        bio: 'EPA-certified HVAC technician specializing in high-efficiency heat pumps, mini-split ductless systems, precision duct balancing, and smart thermostat integration.',
        portfolios: [
          {
            title: 'Multi-Zone Inverter Heat Pump Retrofit',
            category: 'AC Installation & Repair',
            cost: 4900,
            desc: 'Installation of high-efficiency 4-zone Mitsubishi ductless system with discreet concealed line sets.',
            media: [
              'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
            ]
          }
        ]
      },
      {
        name: 'Robert Hayes',
        email: 'robert.hayes@example.com',
        phone: '+1-555-0138',
        businessName: 'Hayes Masonry & Structural Works',
        categorySlug: 'masonry-civil',
        yearsExperience: 18,
        city: 'Austin',
        locality: 'Barton Hills',
        pinCode: '78704',
        startingPrice: 95,
        rating: 4.9,
        reviewsCount: 27,
        completedJobs: 30,
        verificationStatus: 'FULLY_VERIFIED',
        bio: 'Master Mason handling limestone retaining walls, structural brick restoration, foundation underpinning, outdoor stone kitchens, and custom flagstone patios.',
        portfolios: [
          {
            title: 'Texas Limestone Terraced Retaining Wall',
            category: 'Masonry & Civil Work',
            cost: 5800,
            desc: 'Hand-chiselled dry-stack appearance Texas cream limestone wall with French drainage backfill.',
            media: [
              'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80'
            ]
          }
        ]
      }
    ];

    const proProfilesCreated: { profileId: string; userId: string; name: string }[] = [];

    for (const p of professionalsData) {
      let u = db.prepare('SELECT id FROM users WHERE email = ?').get(p.email) as any;
      let uId: string;
      let pId: string;
      if (!u) {
        uId = crypto.randomUUID();
        pId = crypto.randomUUID();
        execute(
          `INSERT INTO users (id, email, password_hash, role, name, phone, avatar_url, is_active, is_email_verified, is_phone_verified, created_at, updated_at)
           VALUES (?, ?, ?, 'PROFESSIONAL', ?, ?, NULL, 1, 1, 1, ?, ?)`,
          [uId, p.email, defaultPasswordHash, p.name, p.phone, now, now]
        );
        execute(
          `INSERT INTO professional_profiles (
             id, user_id, business_name, bio, years_experience, city, locality, pin_code,
             languages, working_hours, starting_price, pricing_notes, availability_status,
             availability_updated_at, verification_status, verification_notes, average_rating,
             total_reviews, completed_jobs_count, created_at, updated_at
           ) VALUES (
             ?, ?, ?, ?, ?, ?, ?, ?, 'English, Spanish', '8:00 AM - 6:00 PM, Mon-Sat',
             ?, 'Starting hourly rate or base estimate fee', 'AVAILABLE', ?, ?,
             'Verified government ID, trade license & background check completed.',
             ?, ?, ?, ?, ?
           )`,
          [
            pId,
            uId,
            p.businessName,
            p.bio,
            p.yearsExperience,
            p.city,
            p.locality,
            p.pinCode,
            p.startingPrice,
            now,
            p.verificationStatus,
            p.rating,
            p.reviewsCount,
            p.completedJobs,
            now,
            now
          ]
        );

        // Service Association
        const catId = categoryMap.get(p.categorySlug) || Array.from(categoryMap.values())[0];
        execute(
          `INSERT INTO professional_services (id, pro_profile_id, category_id, service_name, description, base_rate, rate_type, is_primary)
           VALUES (?, ?, ?, ?, ?, ?, 'PER_HOUR', 1)`,
          [crypto.randomUUID(), pId, catId, p.businessName, p.bio, p.startingPrice]
        );

        // Service Area
        execute(
          `INSERT INTO service_areas (id, pro_profile_id, city, locality, pin_code)
           VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), pId, p.city, p.locality, p.pinCode]
        );

        // Availability schedule
        for (let day = 1; day <= 6; day++) {
          execute(
            `INSERT INTO availability_schedules (id, pro_profile_id, day_of_week, start_time, end_time, is_working_day)
             VALUES (?, ?, ?, '08:00', '18:00', 1)`,
            [crypto.randomUUID(), pId, day]
          );
        }
        execute(
          `INSERT INTO availability_schedules (id, pro_profile_id, day_of_week, start_time, end_time, is_working_day)
           VALUES (?, ?, 0, '08:00', '18:00', 0)`,
          [crypto.randomUUID(), pId]
        );

        // Portfolios
        for (const port of p.portfolios) {
          const projId = crypto.randomUUID();
          execute(
            `INSERT INTO portfolio_projects (id, pro_profile_id, title, description, category_name, project_cost, completion_date, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [projId, pId, port.title, port.desc, port.category, port.cost, '2026-03-15', now, now]
          );

          port.media.forEach((url, idx) => {
            execute(
              `INSERT INTO portfolio_media (id, project_id, media_url, caption, is_cover, sort_order)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [crypto.randomUUID(), projId, url, port.title, idx === 0 ? 1 : 0, idx]
            );
          });
        }

        // Verification records
        execute(
          `INSERT INTO verification_records (id, pro_profile_id, stage, document_type, document_number, status, verified_by, verified_at, notes, created_at)
           VALUES (?, ?, 'IDENTITY', 'DRIVERS_LICENSE', 'DL-TX-98442', 'APPROVED', ?, ?, 'Verified by Admin', ?)`,
          [crypto.randomUUID(), pId, adminUserId, now, now]
        );
        execute(
          `INSERT INTO verification_records (id, pro_profile_id, stage, document_type, document_number, status, verified_by, verified_at, notes, created_at)
           VALUES (?, ?, 'BUSINESS', 'STATE_REGISTRATION', 'REG-2022-771', 'APPROVED', ?, ?, 'Active business registration verified', ?)`,
          [crypto.randomUUID(), pId, adminUserId, now, now]
        );
      } else {
        uId = u.id;
        let prof = db.prepare('SELECT id FROM professional_profiles WHERE user_id = ?').get(uId) as any;
        pId = prof.id;
      }
      proProfilesCreated.push({ profileId: pId, userId: uId, name: p.name });
    }

    // 5. Sample Bookings, Estimates & Reviews
    if (customerIds.length >= 2 && proProfilesCreated.length >= 3) {
      const cust1 = customerIds[0];
      const cust2 = customerIds[1];
      const pro1 = proProfilesCreated[0]; // Marcus Vance (Carpentry)
      const pro2 = proProfilesCreated[1]; // David Miller (Plumbing)
      const pro3 = proProfilesCreated[2]; // Carlos Rodriguez (Electrical)

      // Booking 1: Completed with estimate and review
      const catCarpentry = categoryMap.get('carpentry') || '';
      let existingB1 = db.prepare('SELECT id FROM bookings WHERE booking_number = ?').get('WD-2026-10492') as any;
      let b1Id: string;
      if (!existingB1) {
        b1Id = crypto.randomUUID();
        execute(
          `INSERT INTO bookings (
             id, booking_number, customer_id, pro_profile_id, category_id,
             service_title, description, approximate_location, city, locality, pin_code,
             requested_date, confirmed_date, final_amount, status, created_at, updated_at
           ) VALUES (?, 'WD-2026-10492', ?, ?, ?, 'Custom Kitchen Island with Butcher Block',
             'Looking to build a freestanding 7x4 ft kitchen island with solid maple butcher block top, deep pot drawers, and integrated trash pullout.',
             'Downtown, Austin', 'Austin', 'Downtown', '78701',
             '2026-03-10', '2026-03-10', 3200, 'COMPLETED', ?, ?)`,
          [b1Id, cust1.profileId, pro1.profileId, catCarpentry, now, now]
        );

        // Estimate 1
        const est1Id = crypto.randomUUID();
        execute(
          `INSERT INTO estimates (
             id, booking_id, estimate_number, labour_cost, material_cost, additional_charges,
             total_cost, estimated_duration, work_included, work_excluded, payment_terms,
             expires_at, status, customer_accepted_at, notes, created_at, updated_at
           ) VALUES (?, ?, 'EST-2026-8812', 1800, 1200, 200, 3200, '5 working days',
             'Design drafting, solid maple butcher block fabrication, base cabinets with soft-close Blum slides, delivery and precision leveling.',
             'Plumbing/sink hookup not included.', '50% deposit, 50% upon final inspection',
             '2026-04-01', 'ACCEPTED', ?, 'Custom specification agreed upon visit.', ?, ?)`,
          [est1Id, b1Id, now, now, now]
        );

        // Review 1
        execute(
          `INSERT INTO reviews (
             id, booking_id, customer_id, pro_profile_id, overall_rating,
             punctuality_rating, workmanship_rating, communication_rating, value_rating,
             comment, photos, pro_response, pro_response_date, is_verified_booking,
             is_moderated, is_flagged, created_at, updated_at
           ) VALUES (?, ?, ?, ?, 5, 5, 5, 5, 5,
             'Marcus is a true master of his craft. The butcher block island exceeded every expectation—the grain matching, dovetail joinery, and satin finish are breathtaking. Completed on schedule with clean daily cleanup.',
             NULL, 'Thank you so much Sarah! It was an absolute pleasure building this piece for your kitchen.',
             ?, 1, 0, 0, ?, ?)`,
          [crypto.randomUUID(), b1Id, cust1.profileId, pro1.profileId, now, now, now]
        );
      } else {
        b1Id = existingB1.id;
      }

      // Booking 2: In Progress with estimate
      const catPlumbing = categoryMap.get('plumbing') || '';
      let existingB2 = db.prepare('SELECT id FROM bookings WHERE booking_number = ?').get('WD-2026-10550') as any;
      if (!existingB2) {
        const b2Id = crypto.randomUUID();
        execute(
          `INSERT INTO bookings (
             id, booking_number, customer_id, pro_profile_id, category_id,
             service_title, description, approximate_location, city, locality, pin_code,
             requested_date, confirmed_date, final_amount, status, created_at, updated_at
           ) VALUES (?, 'WD-2026-10550', ?, ?, ?, 'Whole House Water Filtration & Pressure Valve',
             'Need a 3-stage carbon sediment water filtration system installed at the main line plus replace the failing pressure reducing valve.',
             'South Congress, Austin', 'Austin', 'South Congress', '78704',
             '2026-04-12', '2026-04-12', 1450, 'IN_PROGRESS', ?, ?)`,
          [b2Id, cust2.profileId, pro2.profileId, catPlumbing, now, now]
        );

        execute(
          `INSERT INTO estimates (
             id, booking_id, estimate_number, labour_cost, material_cost, additional_charges,
             total_cost, estimated_duration, work_included, work_excluded, payment_terms,
             expires_at, status, customer_accepted_at, notes, created_at, updated_at
           ) VALUES (?, ?, 'EST-2026-8904', 650, 750, 50, 1450, '1 day (6 hours)',
             'Supply and install Watts pressure reducing valve, Aquasana whole-home filtration unit with bypass loop, pressure testing.',
             'Drywall patching if needed behind main line.', 'Payment on completion',
             '2026-05-01', 'ACCEPTED', ?, 'Approved by customer', ?, ?)`,
          [crypto.randomUUID(), b2Id, now, now, now]
        );
      }

      // Booking 3: Requested (Pending Pro Review)
      const catElectrical = categoryMap.get('electrical') || '';
      let existingB3 = db.prepare('SELECT id FROM bookings WHERE booking_number = ?').get('WD-2026-10618') as any;
      if (!existingB3) {
        const b3Id = crypto.randomUUID();
        execute(
          `INSERT INTO bookings (
             id, booking_number, customer_id, pro_profile_id, category_id,
             service_title, description, approximate_location, city, locality, pin_code,
             requested_date, budget_range_min, budget_range_max, status, created_at, updated_at
           ) VALUES (?, 'WD-2026-10618', ?, ?, ?, 'Electric Vehicle (EV) Charger Installation',
             'Need dedicated 240V 50A breaker installed in garage panel and Wall Connector mounted with 15ft conduit run.',
             'Downtown, Austin', 'Austin', 'Downtown', '78701',
             '2026-05-05', 800, 1500, 'REQUESTED', ?, ?)`,
          [b3Id, cust1.profileId, pro3.profileId, catElectrical, now, now]
        );
      }

      // Initial Notifications for demo accounts
      execute(
        `INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, link_url, is_read, created_at)
         VALUES (?, ?, 'Welcome to Workdone!', 'Your account has been set up. Start discovering top-rated local professionals.', 'SYSTEM', '/professionals', 0, ?)`,
        [crypto.randomUUID(), cust1.userId, now]
      );
      execute(
        `INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, link_url, is_read, created_at)
         VALUES (?, ?, 'New Booking Request', 'You have a new booking request #WD-2026-10618 from Sarah Jenkins.', 'BOOKING', '/dashboard/pro?tab=requests', 0, ?)`,
        [crypto.randomUUID(), pro3.userId, now]
      );
    }

    console.log('[Seed] Database seeding completed successfully.');
  });
}

// Auto-run if executed directly via command line
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed();
  process.exit(0);
}
