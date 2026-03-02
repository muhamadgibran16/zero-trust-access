"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function CallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const accessToken = searchParams.get("access_token");
		const refreshToken = searchParams.get("refresh_token");
		const errParam = searchParams.get("error");

		if (errParam) {
			setError(errParam);
			setTimeout(() => {
				router.push("/login"); // return to login after showing error
			}, 3000);
			return;
		}

		// Provision device token before redirecting
		const provisionDeviceToken = async () => {
			const mac = localStorage.getItem("deviceMac");
			if (mac) {
				try {
					// Import ztFetch dynamically or handle manually.
					// For simplicity since we don't have ztFetch imported here, we'll fetch manually
					const headers = new Headers({
						"Content-Type": "application/json",
						"X-Device-MAC": mac,
					});
					// The backend cookies are included automatically
					await fetch("/api/v1/users/devices", {
						method: "POST",
						headers,
						body: JSON.stringify({ macAddress: mac, name: "Web Browser SSO" }),
						credentials: "include",
					});
					const tRes = await fetch("/api/v1/users/devices/token", {
						method: "POST",
						headers,
						body: JSON.stringify({ macAddress: mac }),
						credentials: "include",
					});
					if (tRes.ok) {
						const tData = await tRes.json();
						localStorage.setItem("deviceToken", tData.data.deviceToken);
					}
				} catch (e) {
					console.error("Device token provisioning failed", e);
				}
			}
			router.push("/dashboard");
		};

		// Since we now use HttpOnly cookies, the backend sets them during redirect
		// We securely provision device then proceed to dashboard.
		setTimeout(() => {
			provisionDeviceToken();
		}, 1000); // brief delay to show parsing standard UI
	}, [searchParams, router]);

	return (
		<div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-300">
			{error ? (
				<div className="bg-red-500/10 border border-red-500/50 text-red-500 px-6 py-4 rounded-xl text-center shadow-lg">
					<h3 className="font-bold text-lg mb-1">SSO Authentication Failed</h3>
					<p>{error}</p>
					<p className="text-xs mt-4 text-slate-400">Redirecting to login...</p>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center space-y-4">
					<div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
						<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
					</div>
					<h2 className="text-xl font-semibold text-white">
						Authenticating Secure Session
					</h2>
					<p className="text-sm text-slate-400">
						Please wait while we verify your identity...
					</p>
				</div>
			)}
		</div>
	);
}

// This page acts as a receiver for the JWT tokens returned by the GO backend
// after a successful Google SSO OAuth flow.
export default function AuthCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-300">
					<div className="flex flex-col items-center justify-center space-y-4">
						<div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
							<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
						</div>
						<h2 className="text-xl font-semibold text-white">Loading...</h2>
					</div>
				</div>
			}>
			<CallbackContent />
		</Suspense>
	);
}
