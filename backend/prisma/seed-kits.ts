/**
 * Seed the WebsiteKit catalog and attach each kit's downloadable zip into
 * PRIVATE storage (never a public URL). Idempotent: upserts by slug and only
 * copies a zip if the kit has no stored file yet.
 *
 * Run:  DATABASE_URL="file:./dev.db" tsx prisma/seed-kits.ts
 *
 * Zips are expected at ../kit-content/zips/kit-<slug>.zip (relative to repo root).
 */
import { PrismaClient } from '@prisma/client';
import { copyFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { newStorageTarget } from '../src/lib/storage.js';

const prisma = new PrismaClient();

const DEFAULT_PRICE = Number(process.env.DEFAULT_KIT_PRICE_MMK || 10000);

const KITS = [
  { slug: 'portfolio-website', title: 'Personal Portfolio Website', titleMy: 'ကိုယ်ပိုင် Portfolio ဝဘ်ဆိုက်', summary: 'A fast, elegant site to showcase your projects, CV and contact.', summaryMy: 'project၊ CV နဲ့ ဆက်သွယ်ရန် အချက်အလက်တွေ ပြသဖို့ portfolio site။', price: 8000, order: 1 },
  { slug: 'business-landing-page', title: 'Business / Startup Landing Page', titleMy: 'စီးပွားရေး Landing Page', summary: 'A high-converting one-page site to explain a product and capture leads.', summaryMy: 'ကုန်ပစ္စည်းရှင်းပြပြီး lead ဖမ်းဖို့ one-page site။', price: 8000, order: 2 },
  { slug: 'ecommerce-store', title: 'E-Commerce Store', titleMy: 'အွန်လိုင်း အရောင်းဆိုင်', summary: 'An online store with catalog, cart and Stripe checkout.', summaryMy: 'ကုန်ပစ္စည်းစာရင်း၊ cart နဲ့ checkout ပါတဲ့ online ဆိုင်။', price: 15000, order: 3 },
  { slug: 'blog-cms', title: 'Blog / Content Website', titleMy: 'ဘလော့ဂ် / Content ဝဘ်ဆိုက်', summary: 'A content site or blog with articles, categories and SEO built in.', summaryMy: 'ဆောင်းပါး၊ category နဲ့ SEO ပါတဲ့ blog website။', price: 10000, order: 4 },
  { slug: 'admin-dashboard', title: 'Admin Dashboard / Analytics Panel', titleMy: 'Admin Dashboard', summary: 'A data dashboard with tables, charts, auth and CRUD.', summaryMy: 'table၊ chart၊ login နဲ့ CRUD ပါတဲ့ admin dashboard။', price: 15000, order: 5 },
  { slug: 'restaurant-website', title: 'Restaurant / Cafe Website', titleMy: 'စားသောက်ဆိုင် ဝဘ်ဆိုက်', summary: 'A menu-driven site with photos, hours and online reservations.', summaryMy: 'menu၊ ဓာတ်ပုံ၊ ဖွင့်ချိန် နဲ့ booking ပါတဲ့ ဆိုင် website။', price: 8000, order: 6 },
  { slug: 'saas-web-app', title: 'SaaS Web App (Auth + Subscriptions)', titleMy: 'SaaS Web App', summary: 'A subscription web app with accounts, a dashboard and billing.', summaryMy: 'account၊ dashboard နဲ့ subscription billing ပါတဲ့ SaaS app။', price: 20000, order: 7 },
  { slug: 'event-conference-website', title: 'Event / Conference Website', titleMy: 'Event / Conference ဝဘ်ဆိုက်', summary: 'A site for an event: schedule, speakers, tickets and venue info.', summaryMy: 'အစီအစဉ်၊ speaker၊ ticket နဲ့ venue ပါတဲ့ event website။', price: 10000, order: 8 },
];

async function main() {
  const zipsDir = resolve(process.cwd(), '../kit-content/zips');
  console.log('🌱 Seeding website kits...');

  for (const k of KITS) {
    const kit = await prisma.websiteKit.upsert({
      where: { slug: k.slug },
      update: {
        title: k.title, titleMy: k.titleMy, summary: k.summary, summaryMy: k.summaryMy,
        priceMmk: k.price || DEFAULT_PRICE, sortOrder: k.order, published: true,
      },
      create: {
        slug: k.slug, title: k.title, titleMy: k.titleMy, summary: k.summary, summaryMy: k.summaryMy,
        priceMmk: k.price || DEFAULT_PRICE, sortOrder: k.order, published: true,
      },
    });

    // Attach the zip into private storage if not already present.
    const src = resolve(zipsDir, `kit-${k.slug}.zip`);
    if (!kit.fileStorageKey && existsSync(src)) {
      const { key, absPath } = newStorageTarget(`${k.slug}.zip`);
      copyFileSync(src, absPath);
      const size = statSync(absPath).size;
      await prisma.websiteKit.update({
        where: { id: kit.id },
        data: { fileName: `${k.slug}.zip`, fileStorageKey: key, fileSizeBytes: size },
      });
      console.log(`   ✓ ${k.slug} — zip attached (${size} bytes)`);
    } else if (kit.fileStorageKey) {
      console.log(`   • ${k.slug} — already has a file, skipped`);
    } else {
      console.log(`   ! ${k.slug} — zip not found at ${src}`);
    }
  }
  console.log(`✅ ${KITS.length} website kits ensured.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
