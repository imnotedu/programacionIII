
import { query } from '../src/config/database';
import { hashPassword } from '../src/utils/auth';
import { config } from '../src/config/env';

async function resetAdmin() {
    try {
        console.log('🔄 Reseteando superadmin...');

        // Hash new password
        const passwordHash = await hashPassword('1234567Ed!');

        // Check if admin exists
        const res = await query('SELECT * FROM users WHERE email = $1', ['admin@powerfit.com']);

        if (res.rows.length > 0) {
            console.log('✅ Admin encontrado, actualizando password...');
            await query(
                'UPDATE users SET passwordHash = $1, level = $2, name = $3 WHERE email = $4',
                [passwordHash, 'admin', 'Administrador del Sistema', 'admin@powerfit.com']
            );
        } else {
            console.log('⚠️ Admin no encontrado, creando uno nuevo...');
            const now = new Date().toISOString();
            await query(`
        INSERT INTO users (id, email, passwordHash, name, level, createdAt, updatedAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
                'superadmin-001',
                'admin@powerfit.com',
                passwordHash,
                'Administrador del Sistema',
                'admin',
                now,
                now
            ]);
        }

        console.log('✅ Superadmin reseteado exitosamente');
        console.log('   Email: admin@powerfit.com');
        console.log('   Contraseña: 1234567Ed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

resetAdmin();
