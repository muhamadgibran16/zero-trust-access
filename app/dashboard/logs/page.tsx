"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ztFetch } from "../../../lib/api";
import { DevicePostureNotice } from "../../../components/DevicePostureNotice";
import {
	ShieldAlert,
	Activity,
	Users,
	HardDrive,
	ShieldCheck,
	AlertTriangle,
	BarChart3,
} from "lucide-react";

type Metrics = {
	totalUsers: number;
	totalDevices: number;
	approvedDevices: number;
	totalAuditLogs: number;
	blockedRequests: number;
	activePolicies: number;
};

export default function AuditLogsPage() {
	const router = useRouter();
	const [logs, setLogs] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [isDeviceError, setIsDeviceError] = useState(false);
	const [isPolicyError, setIsPolicyError] = useState(false);
	const [metrics, setMetrics] = useState<Metrics | null>(null);

	useEffect(() => {
		fetchLogs();
		fetchMetrics();
	}, []);

	const fetchMetrics = async () => {
		try {
			const res = await ztFetch("/users/admin/analytics");
			const data = await res.json();
			if (res.ok && data.data) {
				setMetrics(data.data);
			}
		} catch {
			// Silently fail - metrics are non-critical
		}
	};

	const fetchLogs = async () => {
		setLoading(true);
		setError(null);
		setIsDeviceError(false);
		setIsPolicyError(false);

		try {
			const res = await ztFetch("/users/admin/audit-logs");
			const data = await res.json();

			if (!res.ok) {
				if (res.status === 403) {
					if (data.error?.includes("Device Posture")) {
						setIsDeviceError(true);
					} else if (data.error?.includes("Policy Engine")) {
						setIsPolicyError(true);
					}
				} else if (res.status === 401) {
					router.push("/login");
					return;
				}
				throw new Error(data.error || "Failed to load access logs");
			}

			if (data.data) {
				const logsArray = Array.isArray(data.data)
					? data.data
					: data.data.data || [];
				const mappedLogs = logsArray.map((log: any) => ({
					id: log.id,
					user: log.userId || "Unknown",
					action: log.action,
					path: `${log.method} ${log.path}`,
					ip: log.ipAddress,
					status: log.status < 400 ? 200 : log.status,
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

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center text-slate-400">
				Verifying secure connection...
			</div>
		);
	}

	if (isDeviceError) {
		return (
			<div className="flex flex-col items-center justify-center p-4 h-full">
				<DevicePostureNotice message={error || ""} onRetry={fetchLogs} />
			</div>
		);
	}

	if (isPolicyError) {
		return (
			<div className="flex flex-col items-center justify-center p-4 text-center h-full">
				<div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
					<ShieldAlert className="w-8 h-8 text-orange-500" />
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">
					Policy Enforcement
				</h2>
				<p className="text-slate-400 max-w-md">{error}</p>
			</div>
		);
	}

	const metricCards = metrics
		? [
				{
					label: "Total Users",
					value: metrics.totalUsers,
					icon: Users,
					color: "text-blue-600",
					bg: "bg-blue-50",
					border: "border-blue-100",
				},
				{
					label: "Registered Devices",
					value: metrics.totalDevices,
					icon: HardDrive,
					color: "text-cyan-600",
					bg: "bg-cyan-50",
					border: "border-cyan-100",
				},
				{
					label: "Compliant Devices",
					value: metrics.approvedDevices,
					icon: ShieldCheck,
					color: "text-emerald-600",
					bg: "bg-emerald-50",
					border: "border-emerald-100",
				},
				{
					label: "Blocked Requests",
					value: metrics.blockedRequests,
					icon: AlertTriangle,
					color: "text-red-600",
					bg: "bg-red-50",
					border: "border-red-100",
				},
				{
					label: "Active Policies",
					value: metrics.activePolicies,
					icon: BarChart3,
					color: "text-violet-600",
					bg: "bg-violet-50",
					border: "border-violet-100",
				},
			]
		: [];

	return (
		<div className="max-w-6xl mx-auto text-slate-900">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 flex items-center">
						<Activity className="w-5 h-5 mr-3 text-blue-500" />
						Security Audit Logs
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Real-time access events intercepted by the Policy Engine
					</p>
				</div>
			</div>

			{/* Analytics Metrics Cards */}
			{metricCards.length > 0 && (
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
					{metricCards.map((card) => (
						<div
							key={card.label}
							className={`${card.bg} border ${card.border} rounded-xl p-4 flex flex-col items-center text-center transition-transform hover:scale-105`}>
							<card.icon className={`w-6 h-6 ${card.color} mb-2`} />
							<span className="text-2xl font-bold text-slate-900">
								{card.value}
							</span>
							<span className="text-[11px] text-slate-500 mt-1">
								{card.label}
							</span>
						</div>
					))}
				</div>
			)}

			{error && !isDeviceError && !isPolicyError && (
				<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
					Error: {error}
				</div>
			)}

			<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg">
				<table className="w-full text-left text-sm">
					<thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
						<tr>
							<th className="px-6 py-4 font-medium">Timestamp</th>
							<th className="px-6 py-4 font-medium">Identity (IAP)</th>
							<th className="px-6 py-4 font-medium">Resource</th>
							<th className="px-6 py-4 font-medium">Origin IP</th>
							<th className="px-6 py-4 font-medium">Status / Posture</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200">
						{logs.map((log) => (
							<tr
								key={log.id}
								className="hover:bg-slate-50 transition-colors">
								<td className="px-6 py-4 whitespace-nowrap text-slate-500">
									{new Date(log.time).toLocaleString()}
								</td>
								<td className="px-6 py-4 font-medium text-slate-900">
									{log.user}
								</td>
								<td className="px-6 py-4 font-mono text-xs text-blue-600">
									{log.action} {log.path}
								</td>
								<td className="px-6 py-4 font-mono text-xs text-slate-500">
									{log.ip}
								</td>
								<td className="px-6 py-4">
									{log.status === 200 ? (
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
											Allowed
										</span>
									) : (
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
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
		</div>
	);
}
