"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ztFetch } from "../../lib/api";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token") || "";

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		setLoading(true);
		setError("");

		try {
			const res = await ztFetch("/auth/reset-password", {
				method: "POST",
				body: JSON.stringify({ token, newPassword }),
				requireAuth: false,
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Reset failed");
			setSuccess(true);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
		return (
			<div className="text-center text-red-600 dark:text-red-400">
				<p>Invalid or missing reset token.</p>
				<Link
					href="/forgot-password"
					className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 text-sm mt-4 inline-block">
					Request a new reset link
				</Link>
			</div>
		);
	}

	return (
		<>
			{error && (
				<div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-500 px-4 py-3 rounded-lg text-sm">
					{error}
				</div>
			)}

			{success ? (
				<div className="space-y-4 text-center">
					<div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-4 rounded-lg text-sm">
						✅ Your password has been reset successfully!
					</div>
					<Link
						href="/login"
						className="inline-flex items-center bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
						Sign In with New Password
					</Link>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
							New Password
						</label>
						<input
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
							required
							minLength={6}
							placeholder="Min. 6 characters"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
							Confirm Password
						</label>
						<input
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
							required
							minLength={6}
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50">
						{loading ? "Resetting..." : "Reset Password"}
					</button>
				</form>
			)}

			<div className="text-center">
				<Link
					href="/login"
					className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center">
					<ArrowLeft className="w-3 h-3 mr-1" />
					Back to Login
				</Link>
			</div>
		</>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
			<div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
				<div className="text-center">
					<div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
					</div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
						Reset Password
					</h1>
					<p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
						Enter your new password below.
					</p>
				</div>
				<Suspense
					fallback={
						<div className="text-center text-slate-600 dark:text-slate-400">
							Loading...
						</div>
					}>
					<ResetPasswordForm />
				</Suspense>
			</div>
		</div>
	);
}
