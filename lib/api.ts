export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface FetchOptions extends RequestInit {
	requireAuth?: boolean;
}

/**
 * A wrapper around fetch that automatically attaches Zero Trust headers:
 * - Authorization/IAP token
 * - Device Posture claims (OS version, Secure status)
 * - Tunnel secret (if applicable for mock cloaking)
 */
export async function ztFetch(endpoint: string, options: FetchOptions = {}) {
	const headers = new Headers(options.headers || {});

	// Device Posture Mock implementation
	// In reality, this would be computed by an MDM agent or secure enclave plugin
	headers.set("X-Device-OS", "macOS-14.2.1");
	headers.set("X-Device-Secure", "true");
	headers.set("X-Device-Rooted", "false");

	// Mock Cloaking secret for bypassing tunnel restrictions during testing
	headers.set("X-Tunnel-Secret", "zT-tunnel-s3cr3t");

	// IAP / Auth Header
	if (options.requireAuth !== false) {
		const token =
			typeof window !== "undefined"
				? localStorage.getItem("accessToken")
				: null;
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
			headers.set("X-IAP-Token", `Bearer ${token}`);
		}
	}

	headers.set("Content-Type", "application/json");

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers,
	});

	return response;
}
