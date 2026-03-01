"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, LogOut, Activity, Users, FileLock } from "lucide-react";
import { ztFetch } from "../../lib/api";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [mfaSecret, setMfaSecret] = useState<string | null>(null);
	const [showMfaSetup, setShowMfaSetup] = useState(false);
	const [mfaCodeInput, setMfaCodeInput] = useState("");
	const [mfaStatus, setMfaStatus] = useState<string | null>(null);

	const logout = async () => {
		try {
			await ztFetch("/users/logout", { method: "POST" });
		} catch (e) {
			// Ignore error on logout
		} finally {
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			router.push("/login");
		}
	};

	const startMfaSetup = async () => {
		try {
			const res = await ztFetch("/users/setup-mfa", { method: "POST" });
			const data = await res.json();
			if (res.ok && data.data) {
				setMfaSecret(data.data.secret);
				setShowMfaSetup(true);
				setMfaStatus(null);
			} else {
				alert(data.error || "Failed to setup MFA");
			}
		} catch (err: any) {
			alert(err.message);
		}
	};

	const submitMfaCode = async () => {
		setMfaStatus("Verifying...");
		try {
			const res = await ztFetch("/users/enable-mfa", {
				method: "POST",
				body: JSON.stringify({ code: mfaCodeInput }),
			});
			const data = await res.json();
			if (res.ok) {
				setMfaStatus("MFA successfully enabled! Safe to close.");
				setTimeout(() => setShowMfaSetup(false), 2000);
			} else {
				setMfaStatus(data.error || "Invalid code");
			}
		} catch (err: any) {
			setMfaStatus(err.message);
		}
	};

	const navigation = [
		{ name: "Audit Logs", href: "/dashboard", icon: Activity },
		{ name: "User Management", href: "/dashboard/users", icon: Users },
		{ name: "Security Policies", href: "/dashboard/policies", icon: FileLock },
	];

	return (
		<div className="min-h-screen bg-slate-950 flex text-slate-300">
			{/* Sidebar */}
			<div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
				<div className="h-16 flex items-center px-6 border-b border-slate-800">
					<ShieldCheck className="w-6 h-6 text-emerald-500 mr-2" />
					<span className="font-semibold text-white tracking-wide">
						ZTA Admin
					</span>
				</div>
				<nav className="flex-1 px-4 py-6 space-y-2">
					{navigation.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.name}
								href={item.href}
								className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
									isActive
										? "bg-slate-800 text-white"
										: "text-slate-400 hover:text-white hover:bg-slate-800/50"
								}`}>
								<item.icon
									className={`w-5 h-5 mr-3 ${
										isActive ? "text-blue-500" : "text-slate-500"
									}`}
								/>
								{item.name}
							</Link>
						);
					})}
				</nav>
				<div className="p-4 border-t border-slate-800">
					<button
						onClick={startMfaSetup}
						className="w-full mb-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-colors">
						Setup MFA
					</button>
					<button
						onClick={logout}
						className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
						<LogOut className="w-4 h-4 mr-2" />
						Sign Out
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				<header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-end px-8">
					<div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20 flex items-center hidden sm:flex">
						<span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
						End-to-End Encrypted Tunnel Active
					</div>
				</header>
				<main className="flex-1 overflow-y-auto p-8 relative">
					{showMfaSetup && mfaSecret && (
						<div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 text-center max-w-md w-full shadow-2xl">
							<button
								onClick={() => setShowMfaSetup(false)}
								className="absolute top-4 right-4 text-slate-500 hover:text-white">
								&times;
							</button>
							<ShieldCheck className="w-10 h-10 text-blue-500 mx-auto mb-4" />
							<h3 className="text-xl font-bold text-white mb-2">
								Enable Authenticator App
							</h3>
							<p className="text-slate-400 text-sm mb-4">
								Enter this text code into your Authenticator App (like Google
								Authenticator):
							</p>
							<div className="bg-slate-950 p-3 rounded text-emerald-400 font-mono text-lg tracking-widest text-center select-all mb-4">
								{mfaSecret}
							</div>
							<div className="flex space-x-2">
								<input
									type="text"
									placeholder="6-digit code"
									value={mfaCodeInput}
									onChange={(e) => setMfaCodeInput(e.target.value)}
									className="bg-slate-800 border-slate-700 text-white px-4 py-2 rounded-lg flex-1 text-center font-mono tracking-widest"
									maxLength={6}
								/>
								<button
									onClick={submitMfaCode}
									className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
									Verify
								</button>
							</div>
							{mfaStatus && (
								<p
									className={`mt-3 text-sm ${
										mfaStatus.includes("success")
											? "text-emerald-500"
											: "text-amber-500"
									}`}>
									{mfaStatus}
								</p>
							)}
						</div>
					)}
					{children}
				</main>
			</div>
		</div>
	);
}
