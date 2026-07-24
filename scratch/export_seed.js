// Export toàn bộ data từ local MySQL → tạo seed.sql mới
require('dotenv').config({ path: './.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function exportSeed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'ecs_db',
  });

  let sql = `-- ============================================================
-- ECS Database - Seed Data (Auto-exported from local DB)
-- Generated: ${new Date().toISOString()}
-- ============================================================
USE ecs_db;\n\n`;

  const tables = [
    'services',
    'departments', 
    'employees',
    'clients',
    'client_services',
    'client_products',
    'client_procedures',
    'payments',
    'call_logs',
    'users',
  ];

  for (const table of tables) {
    try {
      const [rows] = await conn.query(`SELECT * FROM ${table}`);
      if (rows.length === 0) continue;

      const cols = Object.keys(rows[0]).filter(c => c !== 'created_at' && c !== 'updated_at' && c !== 'createdAt' && c !== 'updatedAt');
      
      sql += `-- ============================================================\n`;
      sql += `-- ${table.toUpperCase()} (${rows.length} records)\n`;
      sql += `-- ============================================================\n`;
      sql += `INSERT INTO ${table} (${cols.join(', ')}) VALUES\n`;

      const valueRows = rows.map(row => {
        const vals = cols.map(c => {
          const v = row[c];
          if (v === null || v === undefined) return 'NULL';
          if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
          if (typeof v === 'number') return String(v);
          // Escape single quotes
          return `'${String(v).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
        });
        return `(${vals.join(', ')})`;
      });

      sql += valueRows.join(',\n') + ';\n\n';
    } catch (err) {
      console.log(`⚠️ Skipping table ${table}: ${err.message}`);
    }
  }

  const outPath = path.join(__dirname, '../database/seed.sql');
  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(`✅ Exported seed.sql with data from local DB → ${outPath}`);

  await conn.end();
}

exportSeed().catch(err => {
  console.error('❌ Export failed:', err.message);
  process.exit(1);
});
