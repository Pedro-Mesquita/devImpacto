// Load environment variables from .env
try {
	require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
} catch (_) {
	// dotenv optional; ignore if not present
}
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

let cachedClient;

function getSupabaseServiceRoleClient() {
	if (!cachedClient) {
		cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});
	}
	return cachedClient;
}

module.exports = { getSupabaseServiceRoleClient };
