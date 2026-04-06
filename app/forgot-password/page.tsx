"use client";

import { useState } from "react";
import { ztFetch, API_BASE_URL } from "../../lib/api";
import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await ztFetch("/auth/forgot-password", {
				method: "POST",
				body: JSON.stringify({ email }),
				requireAuth: false,
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Request failed");
			setSent(true);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 space-y-6">
				<div className="text-center">
					<div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
						<KeyRound className="w-8 h-8 text-violet-600" />
					</div>
					<h1 className="text-2xl font-bold text-slate-900">
						{sent ? "Check Your Email" : "Forgot Password"}
					</h1>
					<p className="text-slate-600 mt-2 text-sm">
						{sent
							? "If an account exists with that email, a reset link has been generated. Check the backend console for the link."
							: "Enter your email address and we'll send you a reset link."}
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				)}

				{!sent ? (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Email Address
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow"
								required
								placeholder="you@company.com"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50">
							{loading ? "Sending..." : "Send Reset Link"}
						</button>
					</form>
				) : (
					<div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-4 rounded-lg text-sm text-center">
						📧 Reset link has been logged to the{" "}
						<strong>backend console</strong>. Copy it from there to reset your
						password.
					</div>
				)}

				<div className="text-center">
					<Link
						href="/login"
						className="text-sm text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center">
						<ArrowLeft className="w-3 h-3 mr-1" />
						Back to Login
					</Link>
				</div>
			</div>
		</div>
	);
}
