
import { query, closeDatabase } from '../src/config/database';
import bcrypt from 'bcryptjs';

async function resetAdmin() {
    try {
        console.error('🔄 Resetting admin password...');

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('1234567', salt);

        // Check if exists
        const check = await query('SELECT id FROM users WHERE email = $1', ['admin@powerfit.com']);

        if (check.rows.length > 0) {
            // Update
            await query('UPDATE users SET passwordHash = $1, level = $2 WHERE email = $3', [passwordHash, 'admin', 'admin@powerfit.com']);
            console.error('✅ Admin password updated successfully.');
        } else {
            // Create
            const now = new Date().toISOString();
            await query(`
        INSERT INTO users (id, email, passwordHash, name, level, createdAt, updatedAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['superadmin-001-' + Date.now(), 'admin@powerfit.com', passwordHash, 'System Admin', 'admin', now, now]);
            console.error('✅ Admin user created successfully.');
        }

    } catch (error) {
        console.error('❌ Error resetting admin:', error);
    } finally {
        setTimeout(async () => {
            await closeDatabase();
            console.error('Database connection closed.');
        }, 1000);
    }
}

resetAdmin();
