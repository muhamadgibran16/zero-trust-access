"use client";

import { useEffect, useState } from "react";
import { ztFetch } from "../../../lib/api";
import { FileLock, Plus, Trash2, Power, PowerOff, Globe } from "lucide-react";
import { DevicePostureNotice } from "../../../components/DevicePostureNotice";

type AppRoute = {
	id: string;
	name: string;
	pathPrefix: string;
};

type PolicyRule = {
	id: string;
	type: string;
	value: string;
	resource: string;
	appRouteId: string | null;
	appRoute: AppRoute | null;
	isActive: boolean;
	createdAt: string;
};

export default function PoliciesPage() {
	const [policies, setPolicies] = useState<PolicyRule[]>([]);
	const [appRoutes, setAppRoutes] = useState<AppRoute[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDeviceError, setIsDeviceError] = useState(false);

	const [newType, setNewType] = useState("DENY_IP");
	const [newValue, setNewValue] = useState("");
	const [newResource, setNewResource] = useState("");
	const [newAppRouteId, setNewAppRouteId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		fetchPolicies();
		fetchAppRoutes();
	}, []);

	const fetchPolicies = async () => {
		setLoading(true);
		setError(null);
		setIsDeviceError(false);
		try {
			const res = await ztFetch("/users/admin/policies");
			const data = await res.json();
			if (!res.ok) {
				if (res.status === 403 && data.error?.includes("Device Posture")) {
					setIsDeviceError(true);
				}
				throw new Error(data.error || "Failed to fetch policies");
			}
			if (data.data) {
				setPolicies(data.data);
			} else {
				setPolicies([]);
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchAppRoutes = async () => {
		try {
			const res = await ztFetch("/users/admin/proxy-routes");
			const data = await res.json();
			if (res.ok && data.data) {
				setAppRoutes(data.data);
			}
		} catch {
			// non-critical
		}
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newValue) return;

		setIsSubmitting(true);
		try {
			const res = await ztFetch("/users/admin/policies", {
				method: "POST",
				body: JSON.stringify({
					type: newType,
					value: newValue,
					resource: newResource || "",
					appRouteId: newAppRouteId || "",
					isActive: true,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to create policy");

			setNewValue("");
			setNewResource("");
			setNewAppRouteId("");
			fetchPolicies();
		} catch (err: any) {
			alert(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleToggle = async (policy: PolicyRule) => {
		try {
			const res = await ztFetch(`/users/admin/policies/${policy.id}`, {
				method: "PUT",
				body: JSON.stringify({ isActive: !policy.isActive }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to update policy");

			setPolicies(
				policies.map((p) =>
					p.id === policy.id ? { ...p, isActive: !p.isActive } : p,
				),
			);
		} catch (err: any) {
			alert(err.message);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this policy rule?")) return;

		try {
			const res = await ztFetch(`/users/admin/policies/${id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to delete policy");

			setPolicies(policies.filter((p) => p.id !== id));
		} catch (err: any) {
			alert(err.message);
		}
	};

	if (isDeviceError) {
		return (
			<div className="flex flex-col items-center justify-center p-4 h-[80vh]">
				<DevicePostureNotice message={error || ""} onRetry={fetchPolicies} />
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto text-slate-900 dark:text-slate-300">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
						<FileLock className="w-5 h-5 mr-3 text-emerald-600 dark:text-emerald-500" />
						Security Policies
					</h1>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
						Build per-app or global access rules for Zero Trust endpoints
					</p>
				</div>
			</div>

			{error && !isDeviceError && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
					Error: {error}
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Policy Builder Form */}
				<div className="lg:col-span-1">
					<form
						onSubmit={handleCreate}
						className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg dark:shadow-2xl">
						<h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
							Create Policy
						</h2>

						<div className="space-y-4">
							{/* Target App */}
							<div>
								<label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
									Target Application
								</label>
								<select
									value={newAppRouteId}
									onChange={(e) => setNewAppRouteId(e.target.value)}
									className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
									<option value="">🌐 Global (All Endpoints)</option>
									{appRoutes.map((route) => (
										<option key={route.id} value={route.id}>
											{route.name} ({route.pathPrefix})
										</option>
									))}
								</select>
								<p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
									Select an app to apply this policy only to that app, or leave
									as Global.
								</p>
							</div>

							<div>
								<label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
									Rule Type
								</label>
								<select
									value={newType}
									onChange={(e) => setNewType(e.target.value)}
									className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
									<option value="DENY_IP">DENY IP Address</option>
									<option value="ALLOW_IP">ALLOW IP Address</option>
									<option value="REQUIRE_ROLE">Require Minimum Role</option>
									<option value="TIME_RESTRICT">Restrict by Time</option>
									<option value="GEO_RESTRICT">Restrict by Country Code</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
									Value <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									placeholder={
										newType === "REQUIRE_ROLE"
											? "e.g., admin"
											: newType === "TIME_RESTRICT"
												? "e.g., 08:00-17:00"
												: newType === "GEO_RESTRICT"
													? "e.g., ID, US, SG"
													: "e.g., 198.51.100.1"
									}
									value={newValue}
									onChange={(e) => setNewValue(e.target.value)}
									className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								/>
							</div>

							{/* Resource prefix — only show when Global is selected */}
							{!newAppRouteId && (
								<div>
									<label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
										Target Resource Prefix (Optional)
									</label>
									<input
										type="text"
										placeholder="e.g., /api/v1/users/admin"
										value={newResource}
										onChange={(e) => setNewResource(e.target.value)}
										className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
									/>
									<p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
										Leave blank for global enforcement across all endpoints.
									</p>
								</div>
							)}

							<button
								type="submit"
								disabled={isSubmitting || !newValue}
								className="w-full flex justify-center items-center bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm mt-4">
								{isSubmitting ? (
									"Creating..."
								) : (
									<>
										<Plus className="w-4 h-4 mr-2" /> Add Policy Engine Rule
									</>
								)}
							</button>
						</div>
					</form>
				</div>

				{/* Policy List */}
				<div className="lg:col-span-2">
					<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg dark:shadow-2xl">
						<table className="w-full text-left text-sm">
							<thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
								<tr>
									<th className="px-6 py-4 font-medium">Type</th>
									<th className="px-6 py-4 font-medium">Value</th>
									<th className="px-6 py-4 font-medium">Target App</th>
									<th className="px-6 py-4 font-medium text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
								{loading ? (
									<tr>
										<td
											colSpan={4}
											className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
											Loading policies...
										</td>
									</tr>
								) : policies.length === 0 ? (
									<tr>
										<td
											colSpan={4}
											className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
											No custom security policies defined.
										</td>
									</tr>
								) : (
									policies.map((policy) => (
										<tr
											key={policy.id}
											className={`hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${!policy.isActive ? "opacity-50" : ""}`}>
											<td className="px-6 py-4 font-medium">
												<span
													className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${
														policy.type === "DENY_IP"
															? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
															: policy.type === "ALLOW_IP"
																? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
																: policy.type === "TIME_RESTRICT"
																	? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
																	: policy.type === "GEO_RESTRICT"
																		? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20"
																		: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
													}`}>
													{policy.type}
												</span>
											</td>
											<td className="px-6 py-4 text-slate-900 dark:text-slate-300 font-mono text-xs">
												{policy.value}
											</td>
											<td className="px-6 py-4">
												{policy.appRoute ? (
													<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
														{policy.appRoute.name}
													</span>
												) : (
													<span className="inline-flex items-center text-xs text-slate-500 dark:text-slate-400">
														<Globe className="w-3 h-3 mr-1" />
														{policy.resource || "Global"}
													</span>
												)}
											</td>
											<td className="px-6 py-4 flex items-center justify-end space-x-3">
												<button
													onClick={() => handleToggle(policy)}
													className={`${policy.isActive ? "text-emerald-500 hover:text-emerald-400" : "text-slate-500 hover:text-slate-300"} transition-colors`}
													title={
														policy.isActive
															? "Deactivate policy"
															: "Activate policy"
													}>
													{policy.isActive ? (
														<Power className="w-4 h-4" />
													) : (
														<PowerOff className="w-4 h-4" />
													)}
												</button>
												<button
													onClick={() => handleDelete(policy.id)}
													className="text-red-500 hover:text-red-400 transition-colors"
													title="Delete policy">
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
			</div>
		</div>
	);
}
