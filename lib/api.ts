export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

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

	// Hardware identifier for MDM Posture Check
	let deviceMac =
		typeof window !== "undefined" ? localStorage.getItem("deviceMac") : null;
	if (!deviceMac && typeof window !== "undefined") {
		// Generate a random mock MAC for this browser instance to test the flow
		const genHex = () =>
			Math.floor(Math.random() * 255)
				.toString(16)
				.padStart(2, "0")
				.toUpperCase();
		deviceMac = `00:1A:2B:${genHex()}:${genHex()}:${genHex()}`;
		localStorage.setItem("deviceMac", deviceMac);
	}
	if (deviceMac) {
		headers.set("X-Device-MAC", deviceMac);
	}

	// Cryptographic Device Identity Header
	const deviceToken =
		typeof window !== "undefined" ? localStorage.getItem("deviceToken") : null;
	if (deviceToken) {
		headers.set("X-Device-Token", deviceToken);
	}

	// Mock Cloaking secret for bypassing tunnel restrictions during testing
	headers.set("X-Tunnel-Secret", "zT-tunnel-s3cr3t");

	// IAP / Auth Header
	options.credentials = "include";

	headers.set("Content-Type", "application/json");

	let response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers,
	});

	// Token Refresh Interceptor
	if (
		response.status === 401 &&
		options.requireAuth !== false &&
		typeof window !== "undefined"
	) {
		try {
			const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Tunnel-Secret": "zT-tunnel-s3cr3t",
				},
				credentials: "include", // this will send the refresh_token cookie
			});

			if (refreshRes.ok) {
				// Retry original request since the backend set new cookies
				response = await fetch(`${API_BASE_URL}${endpoint}`, {
					...options,
					headers,
				});
			} else {
				// Refresh failed, navigate to login
				window.location.href = "/login";
			}
		} catch (e) {
			window.location.href = "/login";
		}
	}

	return response;
}
