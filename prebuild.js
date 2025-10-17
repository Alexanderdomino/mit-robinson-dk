const fs = require('fs');
const dotenv = require('dotenv');

console.log('Generating environment file...');

dotenv.config({ path: "./src/.env" });

const envConfig = {
    production: process.env['NODE_ENV'] === 'production',
    serviceWorker: true,
    adminEmail: process.env['NG_APP_ADMIN_EMAIL'],
    firebaseConfig: {
        apiKey: process.env['NG_APP_FIREBASE_API_KEY'] || '',
        authDomain: process.env['NG_APP_FIREBASE_AUTH_DOMAIN'] || '',
        projectId: process.env['NG_APP_FIREBASE_PROJECT_ID'] || '',
        storageBucket: process.env['NG_APP_FIREBASE_STORAGE_BUCKET'] || '',
        messagingSenderId: process.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'] || '',
        appId: process.env['NG_APP_FIREBASE_APP_ID'] || '',
        measurementId: process.env['NG_APP_FIREBASE_MEASUREMENT_ID'] || ''
    },
    cloudinary: {
        cloudName: process.env['NG_APP_CLOUDINARY_NAME'] || '',
        uploadPreset: process.env['NG_APP_CLOUDINARY_PRESET'] || ''
    }
};

const envConfigFile = `export const environment = ${JSON.stringify(envConfig, null, 2).replace(/"([^\"]+)":/g, '$1:')};`;

const outputFilePath = envConfig.production
    ? './src/environments/environment.ts'
    : './src/environments/environment.development.ts';

fs.writeFileSync(outputFilePath, envConfigFile);
console.log(`Wrote ${outputFilePath}`);
