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

    // Check if the old ENCARGADO enum value exists
    const enumCheck = await client.query(`
      SELECT 1
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'Role' AND e.enumlabel = 'ENCARGADO'
      LIMIT 1;
    `);

    if (enumCheck.rowCount === 0) {
      console.log('[migrate-roles] Nothing to migrate (ENCARGADO enum value not present)');
      return;
    }

    // Ensure ENCARGADO_TURNO value exists in the enum before updating rows
    try {
      await client.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ENCARGADO_TURNO';`);
    } catch (e) {
      // some Postgres versions don't allow inside a tx; try again outside
      console.log('[migrate-roles] ADD VALUE warning:', e.message);
    }
    try {
      await client.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ENCARGADO_SALUD';`);
    } catch (e) {
      console.log('[migrate-roles] ADD VALUE warning:', e.message);
    }

    // Update all users with the old role value
    const result = await client.query(`
      UPDATE users SET role = 'ENCARGADO_TURNO' WHERE role = 'ENCARGADO';
    `);
    console.log(`[migrate-roles] Migrated ${result.rowCount} users from ENCARGADO → ENCARGADO_TURNO`);

    // Also migrate shift_members
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
