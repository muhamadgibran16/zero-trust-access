"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ztFetch, API_BASE_URL } from "../../../lib/api";
import { DevicePostureNotice } from "../../../components/DevicePostureNotice";
import { ExternalLink, Globe, Lock, ShieldAlert } from "lucide-react";

type AppRoute = {
	id: string;
	name: string;
	description: string;
	pathPrefix: string;
	icon: string;
	isActive: boolean;
};

export default function PortalPage() {
	const [apps, setApps] = useState<AppRoute[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [isDeviceError, setIsDeviceError] = useState(false);

	useEffect(() => {
		fetchApps();
	}, []);

	const fetchApps = async () => {
		setLoading(true);
		setError(null);
		setIsDeviceError(false);

		try {
			const res = await ztFetch("/users/portal/apps");
			const data = await res.json();

			if (!res.ok) {
				if (res.status === 403 && data.error?.includes("Device Posture")) {
					setIsDeviceError(true);
				}
				throw new Error(data.error || "Failed to load applications");
			}

			setApps(data.data || []);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center text-slate-400">
				Loading enterprise applications...
			</div>
		);
	}

	if (isDeviceError) {
		return (
			<div className="flex flex-col items-center justify-center p-4 h-full">
				<DevicePostureNotice message={error || ""} onRetry={fetchApps} />
			</div>
		);
	}

	// Function to get absolute URL for the proxy
	const getProxyUrl = (pathPrefix: string) => {
		// Construct the proxy URL using the Next.js proxy base URL
		// The Next.js rewrite will forward this to the backend at 127.0.0.1:8080
		const cleanPrefix = pathPrefix.startsWith("/")
			? pathPrefix.substring(1)
			: pathPrefix;
		return `${API_BASE_URL}/users/proxy/${cleanPrefix}/`;
	};

	// Open the app in a new tab. Since we use HttpOnly cookies (same-origin via Next.js proxy),
	// the access_token cookie is automatically sent by the browser with the request.
	const handleOpenApp = (pathPrefix: string) => {
		const url = getProxyUrl(pathPrefix);
		window.open(url, "_blank");
	};

	return (
		<div className="max-w-6xl mx-auto p-4 md:p-8">
			<div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
				<div className="flex-shrink-0 bg-white/50 dark:bg-slate-900/50 p-2 rounded-xl">
					<Image
						src="/logo.png"
						alt="FortiGateX Logo"
						width={50}
						height={50}
						className="object-contain"
					/>
				</div>
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
						Enterprise Portal
					</h1>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						Securely access internal enterprise applications
					</p>
				</div>
			</div>

			{error && !isDeviceError && (
				<div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm mb-6 flex items-center">
					<ShieldAlert className="w-5 h-5 mr-2" />
					{error}
				</div>
			)}

			{apps.length === 0 && !error ? (
				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-lg dark:shadow-xl">
					<Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
						No Applications Available
					</h3>
					<p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
						You currently do not have access to any internal applications, or
						none have been configured yet.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{apps.map((app) => (
						<div
							key={app.id}
							className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg dark:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all hover:shadow-indigo-500/10 group relative overflow-hidden flex flex-col h-full">
							<div className="absolute top-0 right-0 p-4">
								<span className="flex h-2.5 w-2.5">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
								</span>
							</div>

							<div className="flex items-center mb-4">
								<div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl border border-slate-200 dark:border-slate-700">
									{app.icon || "🌐"}
								</div>
								<div className="ml-4">
									<h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
										{app.name}
									</h3>
									<p className="text-xs font-mono text-slate-500 dark:text-slate-500 truncate max-w-[150px]">
										{app.pathPrefix}
									</p>
								</div>
							</div>

							<p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow">
								{app.description ||
									"Internal enterprise application protected by FortiGateX."}
							</p>

							<button
								onClick={() => handleOpenApp(app.pathPrefix)}
								className="w-full flex items-center justify-center space-x-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-medium py-2.5 rounded-lg transition-colors">
								<span>Launch Application</span>
								<ExternalLink className="w-4 h-4" />
							</button>
						</div>
					))}
				</div>
			)}

			<div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
				<h3 className="text-md font-medium text-slate-900 dark:text-white mb-2 flex items-center">
					<Lock className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-500" />
					Zero Trust Network Access (ZTNA)
				</h3>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					All traffic to these applications is routed through an identity-aware
					proxy. Connections are continuously verified against your device
					posture, risk score, and access policies.
				</p>
			</div>
		</div>
	);
}
