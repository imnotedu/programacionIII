
import axios from 'axios';

async function test() {
    try {
        console.log('1. Login...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@powerfit.com',
            password: '1234567Ed!'
        });

        console.log('Login Status:', loginRes.status);

        if (!loginRes.data.success) {
            console.error('Login failed:', loginRes.data);
            return;
        }

        const token = loginRes.data.data.token;
        console.log('Token received.');

        console.log('2. Create Product...');
        const productData = {
            name: "Producto Test Node",
            code: `TEST-${Date.now()}`,
            price: 50.00,
            description: "Descripción de prueba",
            category: "Proteínas",
            stock: 20
        };

        const createRes = await axios.post('http://localhost:3000/api/products', productData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Create Status:', createRes.status);
        console.log('Create Data:', createRes.data);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

test();
