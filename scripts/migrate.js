/**
 * Database Migration Script
 *
 * Applies two schema changes:
 *   1. Creates the `feedbacks` table (if it doesn't already exist).
 *   2. Removes the `emoji` column from the `menu_items` table.
 *
 * SQLite does NOT support DROP COLUMN directly (before SQLite 3.35).
 * This script uses the "rename → recreate → copy → drop" technique for
 * the emoji removal to remain compatible with older sqlite3 builds.
 *
 * Usage:
 *   node scripts/migrate.js
 */

require('dotenv').config();
const sequelize = require('../config/dbConfig');

const run = async () => {
  try {
    console.log('🔄  Starting migration...\n');

    // ─── 1. Create feedbacks table ────────────────────────────────────────────
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150) NOT NULL,
        rating      INTEGER      NOT NULL CHECK(rating >= 1 AND rating <= 5),
        message     TEXT,
        location_id INTEGER,
        order_id    INTEGER,
        status      VARCHAR(20)  NOT NULL DEFAULT 'active',
        created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅  feedbacks table created (or already exists)\n');

    // ─── 2. Remove emoji column from menu_items ───────────────────────────────
    // Check if emoji column still exists
    const [tableInfo] = await sequelize.query(`PRAGMA table_info(menu_items);`);
    const hasEmoji = tableInfo.some((col) => col.name === 'emoji');

    if (!hasEmoji) {
      console.log('ℹ️   emoji column already removed from menu_items — skipping\n');
    } else {
      console.log('🔄  Removing emoji column from menu_items...');

      // Disable FK enforcement while we rebuild the table
      await sequelize.query(`PRAGMA foreign_keys = OFF;`);

      // Step 1: rename existing table
      await sequelize.query(`ALTER TABLE menu_items RENAME TO menu_items_old;`);

      // Step 2: create new table without emoji
      await sequelize.query(`
        CREATE TABLE menu_items (
          id                 INTEGER PRIMARY KEY AUTOINCREMENT,
          name               VARCHAR(255) NOT NULL UNIQUE,
          category_id        INTEGER      NOT NULL,
          description        TEXT,
          price              DECIMAL(10,2) NOT NULL,
          quantity_available INTEGER      DEFAULT 0,
          is_popular         BOOLEAN      DEFAULT 0,
          order_time         VARCHAR(255),
          display_order      INTEGER,
          is_available       BOOLEAN      DEFAULT 1,
          created_on         DATETIME     DEFAULT CURRENT_TIMESTAMP,
          updated_on         DATETIME     DEFAULT CURRENT_TIMESTAMP,
          created_by         INTEGER,
          updated_by         INTEGER,
          inactive           BOOLEAN      DEFAULT 0
        );
      `);

      // Step 3: copy data (excluding emoji)
      await sequelize.query(`
        INSERT INTO menu_items
          (id, name, category_id, description, price, quantity_available,
           is_popular, order_time, display_order, is_available,
           created_on, updated_on, created_by, updated_by, inactive)
        SELECT
          id, name, category_id, description, price, quantity_available,
          is_popular, order_time, display_order, is_available,
          created_on, updated_on, created_by, updated_by, inactive
        FROM menu_items_old;
      `);

      // Step 4: drop old table
      await sequelize.query(`DROP TABLE menu_items_old;`);

      // Re-enable FK enforcement
      await sequelize.query(`PRAGMA foreign_keys = ON;`);

      console.log('✅  emoji column removed from menu_items\n');
    }

    // ─── 3. Ensure order status references include 'cancelled' ────────────────
    const [statusTypes] = await sequelize.query(
      `SELECT id FROM \`reference_types\` WHERE name = 'order_status' LIMIT 1;`
    );

    if (statusTypes.length > 0) {
      const orderStatusTypeId = statusTypes[0].id;
      const missingStatuses = ['pending', 'confirmed', 'preparing', 'processing', 'served', 'completed', 'cancelled'];

      for (const code of missingStatuses) {
        const [existing] = await sequelize.query(
          `SELECT id FROM \`references\` WHERE name = ? AND reference_type_id = ? LIMIT 1;`,
          { replacements: [code, orderStatusTypeId] }
        );
        if (!existing.length) {
          await sequelize.query(
            `INSERT INTO \`references\` (name, code, reference_type_id) VALUES (?, ?, ?);`,
            { replacements: [code, code, orderStatusTypeId] }
          );
          console.log(`✅  Added order status reference: ${code}`);
        }
      }
      console.log('\n✅  Order status references verified\n');
    } else {
      console.log('⚠️   order_status reference type not found — run seed script first\n');
    }

    console.log('══════════════════════════════════════════');
    console.log('✅  MIGRATION COMPLETED SUCCESSFULLY');
    console.log('══════════════════════════════════════════');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌  Migration failed:', error.message);
    console.error(error);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
};

run();
