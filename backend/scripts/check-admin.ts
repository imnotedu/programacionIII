
import { query, closeDatabase } from '../src/config/database';

async function checkAdmin() {
    try {
        console.error('🔍 Checking for admin user...');
        const result = await query('SELECT id, email, name, level, passwordHash FROM users WHERE email = $1', ['admin@powerfit.com']);

        if (result.rows.length === 0) {
            console.error('❌ Admin user NOT found in database.');
        } else {
            console.error('✅ Admin user FOUND:');
            console.error(JSON.stringify(result.rows[0], null, 2));
        }
    } catch (error) {
        console.error('❌ Error querying database:', error);
    } finally {
        setTimeout(async () => {
            await closeDatabase();
            console.error('Database connection closed.');
        }, 1000);
    }
}

checkAdmin();
