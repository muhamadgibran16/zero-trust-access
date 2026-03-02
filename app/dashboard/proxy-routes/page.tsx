"use client";

import { useEffect, useState } from "react";
import { ztFetch } from "../../../lib/api";
import { DevicePostureNotice } from "../../../components/DevicePostureNotice";
import {
	Plus,
	Edit2,
	Trash2,
	Globe,
	Server,
	CheckCircle2,
	XCircle,
	Router,
} from "lucide-react";

type AppRoute = {
	id: string;
	name: string;
	description: string;
	pathPrefix: string;
	targetUrl: string;
	icon: string;
	isActive: boolean;
	createdAt?: string;
};

export default function ProxyRoutesPage() {
	const [routes, setRoutes] = useState<AppRoute[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDeviceError, setIsDeviceError] = useState(false);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingRoute, setEditingRoute] = useState<AppRoute | null>(null);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		pathPrefix: "",
		targetUrl: "",
		icon: "🌐",
		isActive: true,
	});

	useEffect(() => {
		fetchRoutes();
	}, []);

	const fetchRoutes = async () => {
		setLoading(true);
		setError(null);
		setIsDeviceError(false);
		try {
			const res = await ztFetch("/users/admin/proxy-routes");
			const data = await res.json();

			if (!res.ok) {
				if (res.status === 403 && data.error?.includes("Device Posture")) {
					setIsDeviceError(true);
				}
				throw new Error(data.error || "Failed to load routes");
			}
			setRoutes(data.data || []);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenModal = (route?: AppRoute) => {
		if (route) {
			setEditingRoute(route);
			setFormData({
				name: route.name,
				description: route.description,
				pathPrefix: route.pathPrefix,
				targetUrl: route.targetUrl,
				icon: route.icon || "🌐",
				isActive: route.isActive,
			});
		} else {
			setEditingRoute(null);
			setFormData({
				name: "",
				description: "",
				pathPrefix: "/",
				targetUrl: "http://",
				icon: "🌐",
				isActive: true,
			});
		}
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingRoute(null);
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		try {
			const method = editingRoute ? "PUT" : "POST";
			const url = editingRoute
				? `/users/admin/proxy-routes/${editingRoute.id}`
				: "/users/admin/proxy-routes";

			const res = await ztFetch(url, {
				method,
				body: JSON.stringify(formData),
			});
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "Failed to save route");

			fetchRoutes();
			handleCloseModal();
		} catch (err: any) {
			setError(err.message);
		}
	};

	const handleDelete = async (id: string, name: string) => {
		if (
			!confirm(`Are you sure you want to delete gateway route for '${name}'?`)
		)
			return;

		try {
			const res = await ztFetch(`/users/admin/proxy-routes/${id}`, {
				method: "DELETE",
			});
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "Failed to delete route");

			fetchRoutes();
		} catch (err: any) {
			setError(err.message);
		}
	};

	if (loading && routes.length === 0) {
		return <div className="p-8 text-slate-400">Loading routes...</div>;
	}

	if (isDeviceError) {
		return (
			<div className="p-8">
				<DevicePostureNotice message={error || ""} onRetry={fetchRoutes} />
			</div>
		);
	}

	return (
		<div className="p-4 md:p-8 max-w-7xl mx-auto">
			<div className="flex justify-between items-center mb-8">
				<div className="flex items-center space-x-3">
					<div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
						<Router className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
							App Gateway Rules
						</h1>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							Manage internal reverse proxy targets and routing
						</p>
					</div>
				</div>
				<button
					onClick={() => handleOpenModal()}
					className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
					<Plus className="w-4 h-4" />
					<span>Add Route</span>
				</button>
			</div>

			{error && !isModalOpen && (
				<div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm mb-6">
					Error: {error}
				</div>
			)}

			<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg dark:shadow-xl">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
								<th className="px-6 py-4 font-medium">Application</th>
								<th className="px-6 py-4 font-medium">
									Path Prefix (FortiGateX)
								</th>
								<th className="px-6 py-4 font-medium">Internal Target (URL)</th>
								<th className="px-6 py-4 font-medium text-center">Status</th>
								<th className="px-6 py-4 font-medium text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
							{routes.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
										No proxy routes configured.
									</td>
								</tr>
							) : (
								routes.map((route) => (
									<tr
										key={route.id}
										className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
										<td className="px-6 py-4">
											<div className="flex items-center">
												<span className="text-2xl mr-3">{route.icon}</span>
												<div>
													<div className="text-slate-900 dark:text-white font-medium">
														{route.name}
													</div>
													<div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
														{route.description}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<span className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 font-mono">
												{route.pathPrefix}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
											<div className="flex items-center space-x-1">
												<Server className="w-3 h-3 text-slate-400 dark:text-slate-500" />
												<span className="font-mono">{route.targetUrl}</span>
											</div>
										</td>
										<td className="px-6 py-4 text-center">
											{route.isActive ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20">
													<CheckCircle2 className="w-3 h-3 mr-1" /> Active
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-500/20">
													<XCircle className="w-3 h-3 mr-1" /> Disabled
												</span>
											)}
										</td>
										<td className="px-6 py-4 text-right">
											<button
												onClick={() => handleOpenModal(route)}
												className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors mr-2"
												title="Edit Route">
												<Edit2 className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleDelete(route.id, route.name)}
												className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
												title="Delete Route">
												<Trash2 className="w-4 h-4" />
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal for Create/Edit */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm">
					<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
						<div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
							<h2 className="text-xl font-semibold text-slate-900 dark:text-white">
								{editingRoute ? "Edit Gateway Route" : "Add Gateway Route"}
							</h2>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							{error && (
								<div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-500 px-4 py-3 rounded-lg text-sm">
									{error}
								</div>
							)}

							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
									Application Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
									placeholder="e.g. HR Portal"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
									Description
								</label>
								<input
									type="text"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
									placeholder="Brief description of the app"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
										Path Prefix <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										required
										value={formData.pathPrefix}
										onChange={(e) =>
											setFormData({ ...formData, pathPrefix: e.target.value })
										}
										className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
										placeholder="/hr-app"
									/>
									<p className="text-xs text-slate-500 mt-1">
										FortiGateX entry route (e.g. /hr-app)
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
										Icon (Emoji)
									</label>
									<input
										type="text"
										value={formData.icon}
										onChange={(e) =>
											setFormData({ ...formData, icon: e.target.value })
										}
										className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center"
										maxLength={5}
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
									Internal Target URL <span className="text-red-500">*</span>
								</label>
								<div className="flex">
									<span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
										<Globe className="w-4 h-4" />
									</span>
									<input
										type="url"
										required
										value={formData.targetUrl}
										onChange={(e) =>
											setFormData({ ...formData, targetUrl: e.target.value })
										}
										className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-r-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
										placeholder="http://internal-hr.local:8080"
									/>
								</div>
								<p className="text-xs text-slate-500 mt-1">
									The real backend server address to proxy traffic to
								</p>
							</div>

							<div className="flex items-center mt-4">
								<input
									type="checkbox"
									id="isActive"
									checked={formData.isActive}
									onChange={(e) =>
										setFormData({ ...formData, isActive: e.target.checked })
									}
									className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-900"
								/>
								<label
									htmlFor="isActive"
									className="ml-2 text-sm text-slate-700 dark:text-slate-300">
									Enable Route (Visible in App Portal)
								</label>
							</div>

							<div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
								<button
									type="button"
									onClick={handleCloseModal}
									className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-300 dark:border-slate-700">
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
									{editingRoute ? "Save Changes" : "Create Route"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
