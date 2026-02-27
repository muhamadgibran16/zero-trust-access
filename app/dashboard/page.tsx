"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ztFetch } from "../../lib/api";
import { DevicePostureNotice } from "../../components/DevicePostureNotice";
import { ShieldCheck, ShieldAlert, LogOut, Activity } from "lucide-react";

export default function Dashboard() {
	const router = useRouter();
	const [logs, setLogs] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [isDeviceError, setIsDeviceError] = useState(false);
	const [isPolicyError, setIsPolicyError] = useState(false);

	// MFA Setup State
	const [showMfaSetup, setShowMfaSetup] = useState(false);
	const [mfaSecret, setMfaSecret] = useState<string | null>(null);
	const [mfaCodeInput, setMfaCodeInput] = useState("");
	const [mfaStatus, setMfaStatus] = useState<string | null>(null);

	useEffect(() => {
		fetchLogs();
	}, []);

	const fetchLogs = async () => {
		setLoading(true);
		setError(null);
		setIsDeviceError(false);
		setIsPolicyError(false);

		try {
			// Fetch real audit logs from the newly exposed ZTA admin endpoint
			const res = await ztFetch("/admin/audit-logs");
			const data = await res.json();

			if (!res.ok) {
				// Handle specific ZTA errors based on keywords or status codes
				if (res.status === 403) {
					if (data.error?.includes("Device Posture")) {
						setIsDeviceError(true);
					} else if (data.error?.includes("Policy Engine")) {
						setIsPolicyError(true);
					}
				} else if (res.status === 401) {
					router.push("/login"); // IAP blocked
					return;
				}
				throw new Error(data.error || "Failed to load access logs");
			}

			// Map real DB audit logs to frontend state
			// Backend AuditLog model: ID, UserID, Action, Method, Path, IPAddress, UserAgent, Status, Details, CreatedAt
			if (data.data) {
				const mappedLogs = data.data.map((log: any) => ({
					id: log.id,
					user: log.userId || "Unknown",
					action: log.action,
					path: `${log.method} ${log.path}`,
					ip: log.ipAddress,
					status: log.status < 400 ? 200 : log.status, // Map anything not an error to 200 for UI simplicity
					time: log.createdAt,
				}));
				setLogs(mappedLogs);
			} else {
				setLogs([]);
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		localStorage.removeItem("accessToken");
		router.push("/login");
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

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
				Verifying secure connection...
			</div>
		);
	}

	if (isDeviceError) {
		return (
			<div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
				<DevicePostureNotice message={error || ""} onRetry={fetchLogs} />
				<button
					onClick={logout}
					className="mt-6 text-slate-500 hover:text-white text-sm flex items-center">
					<LogOut className="w-4 h-4 mr-2" /> Sign out
				</button>
			</div>
		);
	}

	if (isPolicyError) {
		return (
			<div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
				<div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
					<ShieldAlert className="w-8 h-8 text-orange-500" />
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">
					Policy Enforcement
				</h2>
				<p className="text-slate-400 max-w-md">{error}</p>
				<button
					onClick={logout}
					className="mt-8 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg">
					Return to Login
				</button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-950 text-slate-300">
			<header className="border-b border-slate-800 bg-slate-900/50">
				<div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<ShieldCheck className="w-6 h-6 text-emerald-500" />
						<span className="font-semibold text-white tracking-wide">
							ZTA Dashboard
						</span>
					</div>
					<button
						onClick={logout}
						className="text-sm font-medium hover:text-white flex items-center">
						<LogOut className="w-4 h-4 mr-2" />
						Sign Out
					</button>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl font-bold text-white flex items-center">
							<Activity className="w-5 h-5 mr-3 text-blue-500" />
							Security Audit Logs
						</h1>
						<p className="text-sm text-slate-500 mt-1">
							Real-time access events intercepted by the Policy Engine
						</p>
					</div>
					<div className="flex items-center space-x-4">
						<button
							onClick={startMfaSetup}
							className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-colors">
							Setup MFA
						</button>
						<div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20 flex items-center">
							<span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
							End-to-End Encrypted Tunnel Active
						</div>
					</div>
				</div>

				{showMfaSetup && mfaSecret && (
					<div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 text-center max-w-md mx-auto relative shadow-2xl">
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
								className={`mt-3 text-sm ${mfaStatus.includes("success") ? "text-emerald-500" : "text-amber-500"}`}>
								{mfaStatus}
							</p>
						)}
					</div>
				)}

				{error && !isDeviceError && !isPolicyError && (
					<div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
						Error: {error}
					</div>
				)}

				<div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
					<table className="w-full text-left text-sm">
						<thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
							<tr>
								<th className="px-6 py-4 font-medium">Timestamp</th>
								<th className="px-6 py-4 font-medium">Identity (IAP)</th>
								<th className="px-6 py-4 font-medium">Resource</th>
								<th className="px-6 py-4 font-medium">Origin IP</th>
								<th className="px-6 py-4 font-medium">Status / Posture</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-800">
							{logs.map((log) => (
								<tr
									key={log.id}
									className="hover:bg-slate-800/20 transition-colors">
									<td className="px-6 py-4 whitespace-nowrap text-slate-500">
										{new Date(log.time).toLocaleString()}
									</td>
									<td className="px-6 py-4 font-medium text-slate-300">
										{log.user}
									</td>
									<td className="px-6 py-4 font-mono text-xs text-blue-400">
										{log.action} {log.path}
									</td>
									<td className="px-6 py-4 font-mono text-xs text-slate-400">
										{log.ip}
									</td>
									<td className="px-6 py-4">
										{log.status === 200 ? (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
												Allowed
											</span>
										) : (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
												Blocked (Policy Engine)
											</span>
										)}
									</td>
								</tr>
							))}
							{logs.length === 0 && !loading && !error && (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-8 text-center text-slate-500">
										No audit logs available
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</main>
		</div>
	);
}
