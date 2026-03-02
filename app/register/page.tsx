"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ztFetch } from "../../lib/api";
import { ShieldCheck, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Register() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await ztFetch("/auth/register", {
				method: "POST",
				body: JSON.stringify({ name, email, password }),
				requireAuth: false,
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Registration failed");
			}

			setSuccess(true);
			setTimeout(() => {
				router.push("/login"); // Redirect to login after successful register
			}, 2000);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
			<div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/50 dark:bg-blue-900/10 blur-[120px] pointer-events-none" />

			<div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md rounded-2xl p-8 shadow-2xl z-10">
				<div className="flex flex-col items-center mb-8">
					<Image
						src="/logo.png"
						alt="FortiGateX Logo"
						width={64}
						height={64}
						className="mx-auto mb-4 object-contain"
					/>
					<h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
						Create Account
					</h2>
					<p className="text-slate-600 dark:text-slate-400 text-sm text-center mt-2">
						Join FortiGateX
					</p>
				</div>

				{error && (
					<div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
						{error}
					</div>
				)}

				{success && (
					<div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-500 px-4 py-3 rounded-lg mb-6 text-sm text-center">
						Registration successful! Redirecting to login...
					</div>
				)}

				<form onSubmit={handleRegister} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
							Full Name
						</label>
						<input
							type="text"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
							placeholder="John Doe"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
							Email Address
						</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
							placeholder="admin@example.com"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
							Password
						</label>
						<input
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
							placeholder="••••••••"
						/>
					</div>

					<button
						type="submit"
						disabled={loading || success}
						className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-3 mt-6 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed">
						{loading ? (
							"Registering..."
						) : (
							<>
								<UserPlus className="w-5 h-5 mr-2" /> Register
							</>
						)}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-slate-600 dark:text-slate-400 text-sm">
						Already have an account?{" "}
						<Link
							href="/login"
							className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors">
							Log in instead
						</Link>
					</p>
				</div>
				<div className="mt-8 text-center">
					<Link
						href="/"
						className="text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-400 text-sm flex items-center justify-center transition-colors">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Portal
					</Link>
				</div>
			</div>
		</div>
	);
}
