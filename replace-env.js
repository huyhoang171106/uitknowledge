const fs = require('fs');
const path = require('path');

// This script replaces environment variables in supabase.js during build
// It reads from process.env (Vercel) or a local .env file

const supabaseJsPath = path.join(__dirname, 'supabase.js');
const envPath = path.join(__dirname, '.env');

let envVars = { ...process.env };

// Simple .env parser to avoid dependencies
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.join('=').trim();
        }
    });
}

let content = fs.readFileSync(supabaseJsPath, 'utf8');

if (!envVars.SUPABASE_URL || !envVars.SUPABASE_ANON_KEY) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment.');
    process.exit(1);
}

const url = envVars.SUPABASE_URL;
const key = envVars.SUPABASE_ANON_KEY;

content = content.replace(/const SUPABASE_URL = '.*';/, `const SUPABASE_URL = '${url}';`);
content = content.replace(/const SUPABASE_ANON_KEY = '.*';/, `const SUPABASE_ANON_KEY = '${key}';`);

fs.writeFileSync(supabaseJsPath, content);
console.log('Successfully injected environment variables into supabase.js');
