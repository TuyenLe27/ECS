// Export data từ local MySQL (port 3306) -> database/seed.sql (với Sanitization cho GitHub Push Protection)
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function exportSeed() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.DB_PASSWORD || '12345678',
    database: 'ecs_db',
  });

  let sql = `-- ============================================================
-- ECS Database - Seed Data (Auto-updated from Local MySQL)
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

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;

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
          let v = row[c];
          if (v === null || v === undefined) return 'NULL';
          if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
          if (typeof v === 'number') return String(v);

          let str = String(v);

          // Sanitize secrets for GitHub Push Protection
          if (table === 'call_logs') {
            str = str.replace(/CallSid:\s*CA([a-f0-9]{32})/gi, 'CallSid: CS_$1');
            if (twilioSid) {
              str = str.replace(new RegExp(twilioSid, 'g'), 'AC_TWILIO_SID_PLACEHOLDER');
            }
          }

          return `'${str.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
        });
        return `(${vals.join(', ')})`;
      });

      sql += valueRows.join(',\n') + ';\n\n';
    } catch (err) {
      console.log(`⚠️ Skipping table ${table}: ${err.message}`);
    }
  }

  const outPath = path.join(__dirname, '../../database/seed.sql');
  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(`✅ Successfully updated & sanitized ${outPath}!`);

  await conn.end();
}

exportSeed().catch(err => {
  console.error('❌ Export failed:', err.message);
  process.exit(1);
});
