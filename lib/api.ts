export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

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
		const refreshToken = localStorage.getItem("refreshToken");
		if (refreshToken) {
			try {
				const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-Tunnel-Secret": "zT-tunnel-s3cr3t",
					},
					body: JSON.stringify({ refresh_token: refreshToken }),
				});

				if (refreshRes.ok) {
					const data = await refreshRes.json();
					if (data.data?.accessToken) {
						// Save new tokens
						localStorage.setItem("accessToken", data.data.accessToken);
						localStorage.setItem("refreshToken", data.data.refreshToken);

						// Retry original request with new token
						headers.set("Authorization", `Bearer ${data.data.accessToken}`);
						headers.set("X-IAP-Token", `Bearer ${data.data.accessToken}`);

						response = await fetch(`${API_BASE_URL}${endpoint}`, {
							...options,
							headers,
						});
					}
				} else {
					// Refresh failed, clear everything
					localStorage.removeItem("accessToken");
					localStorage.removeItem("refreshToken");
					window.location.href = "/login";
				}
			} catch (e) {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				window.location.href = "/login";
			}
		} else {
			// No refresh token, force logout
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			window.location.href = "/login";
		}
	}

	return response;
}
