"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ztFetch } from "../../lib/api";
import { DevicePostureNotice } from "../../components/DevicePostureNotice";
import {
	Activity,
	Users,
	HardDrive,
	ShieldAlert,
	FileLock,
	Router,
	Cpu,
	Server,
	AlertTriangle,
	CheckCircle2,
	Clock,
} from "lucide-react";

type AnalyticsData = {
	totalUsers: number;
	totalDevices: number;
	approvedDevices: number;
	totalAuditLogs: number;
	blockedRequests: number;
	activePolicies: number;
};

type HealthData = {
	uptimeSeconds: number;
	goroutines: number;
	memoryAllocMB: number;
	memorySysMB: number;
	cpuCores: number;
};

type AuditLog = {
	id: string;
	username?: string;
	action: string;
	method: string;
	path: string;
	ipAddress: string;
	status: number;
	createdAt: string;
};

export default function CommandCenterPage() {
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [health, setHealth] = useState<HealthData | null>(null);
	const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDeviceError, setIsDeviceError] = useState(false);

	useEffect(() => {
		fetchDashboardData();

		// Auto refresh every 30 seconds for live feel
		const interval = setInterval(fetchDashboardData, 30000);
		return () => clearInterval(interval);
	}, []);

	const fetchDashboardData = async () => {
		setIsDeviceError(false);
		try {
			// Fetch Analytics
			const resAnalytics = await ztFetch("/users/admin/analytics");
			const dataAnalytics = await resAnalytics.json();

			if (!resAnalytics.ok) {
				if (
					resAnalytics.status === 403 &&
					dataAnalytics.error?.includes("Device Posture")
				) {
					setIsDeviceError(true);
				}
				throw new Error(dataAnalytics.error || "Failed to load analytics");
			}

			// Fetch Health
			const resHealth = await ztFetch("/users/admin/monitoring/health");
			const dataHealth = await resHealth.json();

			// Fetch recent Audit Logs (just a few for the feed)
			const resLogs = await ztFetch("/users/admin/audit-logs?perPage=5");
			const dataLogs = await resLogs.json();

			setAnalytics(dataAnalytics.data);
			if (resHealth.ok) setHealth(dataHealth.data);
			if (resLogs.ok) {
				// The backend returns { data: { data: logs, meta: { ... } } }
				const logs = dataLogs.data?.data || [];
				setRecentLogs(logs.slice(0, 5));
			}

			setError(null);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (loading && !analytics) {
		return <div className="p-8 text-slate-400">Loading Command Center...</div>;
	}

	if (isDeviceError) {
		return (
			<div className="p-8">
				<DevicePostureNotice
					message={error || ""}
					onRetry={fetchDashboardData}
				/>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center mb-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
						Command Center
					</h1>
					<p className="text-slate-500 dark:text-slate-400 mt-1">
						Zero Trust Security Posture Overview
					</p>
				</div>
				<div className="flex space-x-3">
					<button
						onClick={fetchDashboardData}
						className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-300 dark:border-slate-700">
						<Activity className="w-4 h-4 mr-2" /> Refresh
					</button>
				</div>
			</div>

			{error && (
				<div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm flex items-center">
					<AlertTriangle className="w-5 h-5 mr-2" />
					{error}
				</div>
			)}

			{/* Security Posture Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] z-0 transition-transform group-hover:scale-110"></div>
					<div className="relative z-10 flex justify-between items-start">
						<div>
							<p className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Active Devices
							</p>
							<h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
								{analytics?.approvedDevices || 0}
							</h3>
							<p className="text-xs text-slate-500 mt-1">
								Total Registered: {analytics?.totalDevices || 0}
							</p>
						</div>
						<div className="p-2 bg-blue-500/10 rounded-lg">
							<HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[100px] z-0 transition-transform group-hover:scale-110"></div>
					<div className="relative z-10 flex justify-between items-start">
						<div>
							<p className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Blocked Requests
							</p>
							<h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
								{analytics?.blockedRequests || 0}
							</h3>
							<p className="text-xs text-slate-500 mt-1">
								High Risk / Unauthorized
							</p>
						</div>
						<div className="p-2 bg-red-500/10 rounded-lg">
							<ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-[100px] z-0 transition-transform group-hover:scale-110"></div>
					<div className="relative z-10 flex justify-between items-start">
						<div>
							<p className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Active Policies
							</p>
							<h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
								{analytics?.activePolicies || 0}
							</h3>
							<p className="text-xs text-slate-500 mt-1">
								Enforcing access rules
							</p>
						</div>
						<div className="p-2 bg-purple-500/10 rounded-lg">
							<FileLock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100px] z-0 transition-transform group-hover:scale-110"></div>
					<div className="relative z-10 flex justify-between items-start">
						<div>
							<p className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Total Users
							</p>
							<h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
								{analytics?.totalUsers || 0}
							</h3>
							<p className="text-xs text-slate-500 mt-1">Managed Identities</p>
						</div>
						<div className="p-2 bg-emerald-500/10 rounded-lg">
							<Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column: Live Activity Feed */}
				<div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg flex flex-col">
					<div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
						<h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
							<Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mr-2" />
							Live Traffic Feed
						</h3>
						<Link
							href="/dashboard/logs"
							className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
							View full logs &rarr;
						</Link>
					</div>
					<div className="flex-1 p-2">
						{recentLogs.length === 0 ? (
							<div className="p-6 text-center text-slate-500 text-sm">
								No recent activity found.
							</div>
						) : (
							<div className="divide-y divide-slate-100 dark:divide-slate-800/50">
								{recentLogs.map((log) => {
									const isError = log.status >= 400;
									return (
										<div
											key={log.id}
											className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-start space-x-4 rounded-lg">
											<div
												className={`mt-1 p-1.5 rounded-full ${isError ? "bg-red-500/20 text-red-600 dark:text-red-400" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
												{isError ? (
													<AlertTriangle className="w-4 h-4" />
												) : (
													<CheckCircle2 className="w-4 h-4" />
												)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex justify-between">
													<p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
														{log.username || "Unknown User"}{" "}
														<span className="text-slate-500 font-normal">
															accessed
														</span>{" "}
														{log.path}
													</p>
													<span className="text-xs text-slate-500 whitespace-nowrap ml-2">
														{new Date(log.createdAt).toLocaleTimeString()}
													</span>
												</div>
												<div className="mt-1 flex items-center space-x-3 text-xs">
													<span
														className={`font-mono px-1.5 py-0.5 rounded ${isError ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"}`}>
														HTTP {log.status}
													</span>
													<span className="text-slate-500 dark:text-slate-400 font-mono">
														{log.method}
													</span>
													<span className="text-slate-500">
														{log.ipAddress}
													</span>
													<span className="text-slate-500 italic uppercase">
														{log.action.replace("_", " ")}
													</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>

				{/* Right Column: Health & Quick Actions */}
				<div className="space-y-6">
					{/* System Health Mini-Widget */}
					<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm uppercase tracking-wider font-bold text-slate-500">
								System Health
							</h3>
							<div className="flex items-center space-x-1.5 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded text-xs text-emerald-500 dark:text-emerald-400">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
								<span>Online</span>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<div className="flex justify-between text-xs mb-1">
									<span className="text-slate-500 dark:text-slate-400 flex items-center">
										<Cpu className="w-3 h-3 mr-1" /> Memory Usage
									</span>
									<span className="text-slate-900 dark:text-white font-mono">
										{health?.memoryAllocMB || 0} MB
									</span>
								</div>
								<div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
									<div
										className="bg-blue-500 h-1.5 rounded-full"
										style={{
											width: `${Math.min(((health?.memoryAllocMB || 0) / 100) * 100, 100)}%`,
										}}></div>
								</div>
							</div>

							<div className="flex items-center justify-between pt-2">
								<div className="flex flex-col">
									<span className="text-xs text-slate-500 mb-1">Uptime</span>
									<span className="text-sm text-slate-900 dark:text-white font-mono flex items-center">
										<Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
										{health ? `${health.uptimeSeconds}s` : "0s"}
									</span>
								</div>
								<div className="flex flex-col items-end">
									<span className="text-xs text-slate-500 mb-1">
										Goroutines
									</span>
									<span className="text-sm text-slate-900 dark:text-white font-mono">
										{health ? health.goroutines : 0}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6">
						<h3 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4">
							Quick Actions
						</h3>
						<div className="space-y-2">
							<Link
								href="/dashboard/proxy-routes"
								className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-indigo-600/20 border border-transparent hover:border-slate-300 dark:hover:border-indigo-500/30 transition-colors group">
								<div className="flex items-center">
									<div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mr-3 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
										<Router className="w-4 h-4" />
									</div>
									<span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
										Add Proxy Route
									</span>
								</div>
								<span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-indigo-400">
									&rarr;
								</span>
							</Link>

							<Link
								href="/dashboard/policies"
								className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-purple-600/20 border border-transparent hover:border-slate-300 dark:hover:border-purple-500/30 transition-colors group">
								<div className="flex items-center">
									<div className="w-8 h-8 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400 flex items-center justify-center mr-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
										<FileLock className="w-4 h-4" />
									</div>
									<span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
										New Security Policy
									</span>
								</div>
								<span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-purple-400">
									&rarr;
								</span>
							</Link>

							<Link
								href="/dashboard/devices"
								className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-emerald-600/20 border border-transparent hover:border-slate-300 dark:hover:border-emerald-500/30 transition-colors group">
								<div className="flex items-center">
									<div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mr-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
										<HardDrive className="w-4 h-4" />
									</div>
									<span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
										Approve Devices
									</span>
								</div>
								<span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-emerald-400">
									&rarr;
								</span>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
