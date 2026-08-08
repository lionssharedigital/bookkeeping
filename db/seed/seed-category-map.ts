import fs from "node:fs";
import path from "node:path";
import { parse } from "papaparse";
import { db, sqlite } from "../client";
import { accounts, categories, categoryMapRules, CategoryType } from "../schema";

const KNOWN_ACCOUNTS: { name: string; institution: string }[] = [
  { name: "Income", institution: "Relay" },
  { name: "Marketing", institution: "Relay" },
  { name: "Taxes", institution: "Relay" },
  { name: "Operating Expenses", institution: "Relay" },
  { name: "Owner's Comp", institution: "Relay" },
  { name: "Payroll", institution: "Relay" },
  { name: "Unrealized Income", institution: "Relay" },
  { name: "Profit", institution: "Relay" },
  { name: "Chase Checking", institution: "Chase" },
  { name: "Chase Savings", institution: "Chase" },
];

function seedAccounts() {
  const today = new Date().toISOString().slice(0, 10);
  for (const [i, acct] of KNOWN_ACCOUNTS.entries()) {
    const existing = db.select().from(accounts).all().find((a) => a.name === acct.name);
    if (existing) continue;
    db.insert(accounts)
      .values({
        name: acct.name,
        institution: acct.institution,
        accountType: "bank",
        openingBalanceCents: 0,
        openingBalanceDate: today,
        sortOrder: i,
      })
      .run();
  }
  console.log(`Accounts seeded: ${KNOWN_ACCOUNTS.length} known accounts ensured.`);
}

function getOrCreateCategory(name: string, type: CategoryType): number {
  const existing = db
    .select()
    .from(categories)
    .all()
    .find((c) => c.name === name && c.type === type);
  if (existing) return existing.id;
  const [inserted] = db.insert(categories).values({ name, type }).returning().all();
  return inserted.id;
}

function seedCategoryMap() {
  const csvPath = path.join(__dirname, "category-map-export.csv");
  const raw = fs.readFileSync(csvPath, "utf-8");
  const { data } = parse<{ keyword: string; category: string; type: string }>(raw, {
    header: true,
    skipEmptyLines: true,
  });

  let inserted = 0;
  let skipped = 0;
  for (const [priority, row] of data.entries()) {
    const keyword = row.keyword?.trim();
    const categoryName = row.category?.trim();
    const type = row.type?.trim() as CategoryType;
    if (!keyword || !categoryName || !type) continue;

    const existingRule = db
      .select()
      .from(categoryMapRules)
      .all()
      .find((r) => r.keyword === keyword);
    if (existingRule) {
      skipped++;
      continue;
    }

    const categoryId = getOrCreateCategory(categoryName, type);
    // Earlier rows in the sheet take precedence when keywords overlap, so
    // give earlier rows a higher priority value.
    db.insert(categoryMapRules)
      .values({ keyword, categoryId, priority: data.length - priority })
      .run();
    inserted++;
  }
  console.log(`Category map rules: ${inserted} inserted, ${skipped} already present.`);
}

seedAccounts();
seedCategoryMap();
sqlite.close();
