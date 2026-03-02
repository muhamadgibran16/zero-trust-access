"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ztFetch, API_BASE_URL } from "../../lib/api";
import Link from "next/link";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [needsMfa, setNeedsMfa] = useState(false);
	const [mfaCode, setMfaCode] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await ztFetch("/auth/login", {
				method: "POST",
				body: JSON.stringify({ email, password }),
				requireAuth: false,
			});
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "Login failed");

			if (data.data.needsMfa) {
				setNeedsMfa(true);
			} else {
				localStorage.setItem("accessToken", data.data.accessToken);
				if (data.data.refreshToken)
					localStorage.setItem("refreshToken", data.data.refreshToken);
				router.push("/dashboard");
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleMfaVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await ztFetch("/auth/verify-mfa", {
				method: "POST",
				body: JSON.stringify({ email, mfaCode }),
				requireAuth: false,
			});
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "MFA Verification failed");

			localStorage.setItem("accessToken", data.data.accessToken);
			if (data.data.refreshToken)
				localStorage.setItem("refreshToken", data.data.refreshToken);
			router.push("/dashboard");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSsoClick = (provider: string) => {
		if (provider === "google") {
			// Redirect the browser entirely to the Go backend to start the OAuth2 flow
			window.location.href = `${API_BASE_URL}/auth/google`;
		} else {
			alert(`SSO Provider ${provider} is not configured yet.`);
		}
	};

	return (
		<div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
			<div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-white tracking-tight">
						Zero Trust Access
					</h1>
					<p className="text-slate-400 mt-2">
						Secure identity & device verification
					</p>
				</div>

				{error && (
					<div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				)}

				{!needsMfa ? (
					<form onSubmit={handleLogin} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-1">
								Work Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-1">
								Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
								required
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50">
							{loading ? "Authenticating..." : "Sign In securely"}
						</button>

						<div className="text-right">
							<a
								href="/forgot-password"
								className="text-xs text-slate-400 hover:text-blue-400 transition-colors">
								Forgot Password?
							</a>
						</div>

						<div className="pt-4 border-t border-slate-800 flex flex-col space-y-3">
							<p className="text-xs text-center text-slate-500 uppercase tracking-wider font-semibold">
								Or continue with SSO
							</p>
							<button
								type="button"
								onClick={() => handleSsoClick("google")}
								className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-medium py-3 rounded-lg transition-colors">
								<svg className="w-5 h-5" viewBox="0 0 24 24">
									<path
										fill="currentColor"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="currentColor"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="currentColor"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="currentColor"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								<span>Google Workspace</span>
							</button>
						</div>
					</form>
				) : (
					<form
						onSubmit={handleMfaVerify}
						className="space-y-4 animate-in fade-in zoom-in duration-300">
						<div className="text-center mb-6">
							<div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-blue-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							</div>
							<h2 className="text-xl font-semibold text-white">
								Adaptive Authentication
							</h2>
							<p className="text-sm text-slate-400 mt-1">
								Please enter the 6-digit code sent to your device.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-300 mb-1">
								MFA Code
							</label>
							<input
								type="text"
								maxLength={6}
								value={mfaCode}
								onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
								className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
								required
								placeholder="••••••"
							/>
						</div>

						<button
							type="submit"
							disabled={loading || mfaCode.length !== 6}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 mt-4">
							{loading ? "Verifying..." : "Verify & Connect"}
						</button>
					</form>
				)}

				<div className="pt-4 text-center">
					<p className="text-slate-400 text-sm">
						Don't have an account?{" "}
						<Link
							href="/register"
							className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
							Create one
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
