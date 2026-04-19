// One-time migration: rename old ENCARGADO role to ENCARGADO_TURNO
// Runs BEFORE prisma db push so the schema update can apply cleanly.
// Uses raw SQL via pg because at this point the Prisma client enum may not match.
const { Client } = require('pg');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('[migrate-roles] No DATABASE_URL, skipping');
    return;
  }

  const client = new Client({ connectionString: url });
  try {
    await client.connect();

    // ---- Triage default (always runs) ----
    try {
      const r = await client.query(`UPDATE patients SET "triageColor" = 'BLUE' WHERE "triageColor" IS NULL;`);
      if (r.rowCount > 0) console.log(`[migrate-roles] Set ${r.rowCount} patients to BLUE triage default`);
    } catch (e) {
      console.log('[migrate-roles] triage default skipped:', e.message);
    }

    // ---- Legacy ENCARGADO role migration (runs only if legacy values exist) ----
    const enumCheck = await client.query(`
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'Role' AND e.enumlabel = 'ENCARGADO'
      LIMIT 1;
    `);

    if (enumCheck.rowCount === 0) {
      console.log('[migrate-roles] Role migration not needed (ENCARGADO enum value not present)');
      return;
    }

    try { await client.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ENCARGADO_TURNO';`); } catch (e) { console.log('[migrate-roles] ADD VALUE warning:', e.message); }
    try { await client.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ENCARGADO_SALUD';`); } catch (e) { console.log('[migrate-roles] ADD VALUE warning:', e.message); }

    const result = await client.query(`UPDATE users SET role = 'ENCARGADO_TURNO' WHERE role = 'ENCARGADO';`);
    console.log(`[migrate-roles] Migrated ${result.rowCount} users from ENCARGADO → ENCARGADO_TURNO`);

    try {
      await client.query(`UPDATE shift_members SET role = 'ENCARGADO_TURNO' WHERE role = 'ENCARGADO';`);
    } catch (e) {
      console.log('[migrate-roles] shift_members migration skipped:', e.message);
    }
  } catch (err) {
    console.error('[migrate-roles] Error:', err.message);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('[migrate-roles] Fatal:', e);
  process.exit(0); // Don't fail startup
});
