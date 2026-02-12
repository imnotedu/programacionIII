
import { query } from '../src/config/database';
import { config } from '../src/config/env';

async function checkUsers() {
    try {
        console.log('🔍 Checking users in DB...');
        const res = await query('SELECT * FROM users');
        console.log('Users found:', res.rows);
    } catch (error) {
        console.error('❌ Error checking users:', error);
    } finally {
        process.exit(0);
    }
}

checkUsers();
