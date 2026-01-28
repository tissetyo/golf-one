import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    console.log('🧪 Attempting to list models with key:', apiKey?.substring(0, 10) + '...');

    try {
        // Note: The @google/generative-ai SDK doesn't have a direct listModels on the main class
        // in older versions, but we can try to hit the endpoint or use the management client.
        // However, for simplicity, let's try gemini-1.5-flash with a different version or check for auth error.

        // Let's try the simplest possible request to check validity
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('hi');
        const response = await result.response;
        console.log('✅ Success:', response.text());
    } catch (error: any) {
        console.error('\n❌ ERROR DETAILS:');
        console.error('Status:', error.status);
        console.error('Message:', error.message);

        if (error.message?.includes('API_KEY_INVALID')) {
            console.log('\n👉 YOUR API KEY IS INVALID.');
        } else if (error.message?.includes('Not Found')) {
            console.log('\n👉 The API Key works but cannot find the models. This often happens if the key is a standard Google Cloud key instead of a Gemini AI Studio key.');
        }
    }
}

listModels();
