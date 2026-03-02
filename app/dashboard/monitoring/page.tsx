"use client";

import { useEffect, useState } from "react";
import { ztFetch } from "../../../lib/api";
import { DevicePostureNotice } from "../../../components/DevicePostureNotice";
import {
	Server,
	Activity,
	Database,
	Cpu,
	MemoryStick,
	Clock,
} from "lucide-react";

type HealthMetrics = {
	uptimeSeconds: number;
	goroutines: number;
	memoryAllocMB: number;
	memorySysMB: number;
	cpuCores: number;
};

type DbMetrics = {
	postgres: {
		status: string;
		openConnections: number;
		inUse: number;
		idle: number;
	};
	redis: {
		status: string;
	};
};

export default function MonitoringPage() {
	const [health, setHealth] = useState<HealthMetrics | null>(null);
	const [dbStatus, setDbStatus] = useState<DbMetrics | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [isDeviceError, setIsDeviceError] = useState(false);

	useEffect(() => {
		fetchData();
		// Poll every 10 seconds
		const interval = setInterval(fetchData, 10000);
		return () => clearInterval(interval);
	}, []);

	const fetchData = async () => {
		setError(null);
		setIsDeviceError(false);

		try {
			const [healthRes, dbRes] = await Promise.all([
				ztFetch("/users/admin/monitoring/health"),
				ztFetch("/users/admin/monitoring/db"),
			]);

			const healthData = await healthRes.json();
			const dbData = await dbRes.json();

			if (!healthRes.ok) {
				if (
					healthRes.status === 403 &&
					healthData.error?.includes("Device Posture")
				) {
					setIsDeviceError(true);
				}
				throw new Error(healthData.error || "Failed to load health metrics");
			}

			setHealth(healthData.data);
			setDbStatus(dbData.data);
			setLoading(false);
		} catch (err: any) {
			setError(err.message);
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center p-4 h-full text-slate-400">
				<Activity className="w-8 h-8 mb-4 animate-spin" />
				Loading system metrics...
			</div>
		);
	}

	if (isDeviceError) {
		return (
			<div className="flex flex-col items-center justify-center p-4 mx-auto max-w-lg mt-20">
				<DevicePostureNotice message={error || ""} onRetry={fetchData} />
			</div>
		);
	}

	const formatUptime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours}h ${minutes}m ${secs}s`;
	};

	return (
		<div className="max-w-6xl mx-auto p-4 md:p-8">
			<div className="flex items-center space-x-3 mb-8">
				<div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
					<Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
						System Monitoring
					</h1>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						Real-time infrastructure health & metrics
					</p>
				</div>
			</div>

			{error && !isDeviceError && (
				<div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm mb-6">
					Error: {error}
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				{/* API Server Container */}
				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg dark:shadow-xl relative overflow-hidden">
					<div className="absolute top-0 right-0 p-4">
						<span className="flex h-3 w-3">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
						</span>
					</div>

					<div className="flex items-center space-x-3 mb-6">
						<Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							API Server (Go)
						</h2>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
							<div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-2">
								<Cpu className="w-4 h-4 mr-2" />
								CPU Cores
							</div>
							<div className="text-2xl font-bold text-slate-900 dark:text-white">
								{health?.cpuCores || 0}
							</div>
						</div>

						<div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
							<div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-2">
								<MemoryStick className="w-4 h-4 mr-2" />
								Memory Alloc
							</div>
							<div className="text-2xl font-bold text-slate-900 dark:text-white">
								{health?.memoryAllocMB || 0}{" "}
								<span className="text-sm font-normal text-slate-500">MB</span>
							</div>
						</div>

						<div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
							<div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-2">
								<Activity className="w-4 h-4 mr-2" />
								Goroutines
							</div>
							<div className="text-2xl font-bold text-slate-900 dark:text-white">
								{health?.goroutines || 0}
							</div>
						</div>

						<div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
							<div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-2">
								<Clock className="w-4 h-4 mr-2" />
								Uptime
							</div>
							<div className="text-xl font-bold text-slate-900 dark:text-white">
								{health ? formatUptime(health.uptimeSeconds) : "0s"}
							</div>
						</div>
					</div>
				</div>

				{/* Database Container */}
				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg dark:shadow-xl relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>

					<div className="flex items-center space-x-3 mb-6">
						<Database className="w-5 h-5 text-blue-500 dark:text-blue-400" />
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white">
							Database Pool
						</h2>
					</div>

					<div className="space-y-4">
						<div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
							<div className="flex flex-col">
								<span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
									PostgreSQL (Primary)
								</span>
								<span className="text-xs text-slate-500 mt-1">
									{dbStatus?.postgres.openConnections || 0} Open Connections
								</span>
							</div>
							<div className="flex items-center">
								{dbStatus?.postgres.status === "connected" ? (
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20">
										Connected
									</span>
								) : (
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20">
										Disconnected
									</span>
								)}
							</div>
						</div>

						<div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
							<div className="flex flex-col">
								<span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
									Redis (Cache)
								</span>
								<span className="text-xs text-slate-500 mt-1">
									Blocklist & Sessions
								</span>
							</div>
							<div className="flex items-center">
								{dbStatus?.redis.status === "connected" ? (
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20">
										Connected
									</span>
								) : (
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20">
										Disconnected
									</span>
								)}
							</div>
						</div>

						<div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
							<div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
								Connection Pool Stats (PG)
							</div>
							<div className="flex justify-between text-sm">
								<div className="flex flex-col items-center">
									<span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
										{dbStatus?.postgres.inUse || 0}
									</span>
									<span className="text-slate-500 text-xs">In Use</span>
								</div>
								<div className="flex flex-col items-center">
									<span className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">
										{dbStatus?.postgres.idle || 0}
									</span>
									<span className="text-slate-500 text-xs">Idle</span>
								</div>
								<div className="flex flex-col items-center">
									<span className="text-slate-900 dark:text-slate-300 font-bold text-xl">
										{dbStatus?.postgres.openConnections || 0}
									</span>
									<span className="text-slate-500 text-xs">Total</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center text-sm text-slate-500 dark:text-slate-500">
				Metrics are refreshed automatically every 10 seconds.
			</div>
		</div>
	);
}
