// Load environment variables from .env
try {
	require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
} catch (_) {
	// dotenv optional; ignore if not present
}
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Build a lightweight no-op client to avoid crashing in local/dev when envs are missing
function createNoopClient() {
	const noop = async () => ({ data: [], error: null });
	const inOp = () => ({ select: noop, in: noop });
	return {
		from: () => ({ select: noop, in: noop }),
		auth: { getUser: noop },
	};
}

let cachedClient;

function getSupabaseServiceRoleClient() {
	if (!cachedClient) {
		if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
			console.warn('[supabase] Missing SUPABASE_URL or key env vars. Using no-op client.');
			cachedClient = createNoopClient();
		} else {
			cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
				auth: {
					autoRefreshToken: false,
					persistSession: false,
				},
			});
		}
	}
	return cachedClient;
}

module.exports = { getSupabaseServiceRoleClient };
