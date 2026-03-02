"use client";

import { useEffect, useState } from "react";
import { ztFetch } from "../../../lib/api";
import { FileLock, Plus, Trash2, Power, PowerOff } from "lucide-react";
import { DevicePostureNotice } from "../../../components/DevicePostureNotice";

type PolicyRule = {
	id: string;
	type: string;
	value: string;
	resource: string;
	isActive: boolean;
	createdAt: string;
};

export default function PoliciesPage() {
	const [policies, setPolicies] = useState<PolicyRule[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDeviceError, setIsDeviceError] = useState(false);

	const [newType, setNewType] = useState("DENY_IP");
	const [newValue, setNewValue] = useState("");
	const [newResource, setNewResource] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		fetchPolicies();
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
					isActive: true,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to create policy");

			setNewValue("");
			setNewResource("");
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
		<div className="max-w-6xl mx-auto text-slate-300">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-white flex items-center">
						<FileLock className="w-5 h-5 mr-3 text-emerald-500" />
						Security Policies
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Build dynamic access rules to restrict Zero Trust endpoints
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
						className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
						<h2 className="text-lg font-semibold text-white mb-4">
							Create Policy
						</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-xs font-medium text-slate-400 mb-1">
									Rule Type
								</label>
								<select
									value={newType}
									onChange={(e) => setNewType(e.target.value)}
									className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
									<option value="DENY_IP">DENY IP Address</option>
									<option value="ALLOW_IP">ALLOW IP Address</option>
									<option value="REQUIRE_ROLE">Require Minimum Role</option>
									<option value="TIME_RESTRICT">Restrict by Time</option>
									<option value="GEO_RESTRICT">Restrict by Country Code</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-slate-400 mb-1">
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
									className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-slate-400 mb-1">
									Target Resource Prefix (Optional)
								</label>
								<input
									type="text"
									placeholder="e.g., /api/v1/finance"
									value={newResource}
									onChange={(e) => setNewResource(e.target.value)}
									className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								/>
								<p className="text-[10px] text-slate-500 mt-1">
									Leave blank for global enforcement.
								</p>
							</div>

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
					<div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
						<table className="w-full text-left text-sm">
							<thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
								<tr>
									<th className="px-6 py-4 font-medium">Type</th>
									<th className="px-6 py-4 font-medium">Value target</th>
									<th className="px-6 py-4 font-medium">Resource Prefix</th>
									<th className="px-6 py-4 font-medium text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-800">
								{loading ? (
									<tr>
										<td
											colSpan={4}
											className="px-6 py-8 text-center text-slate-500">
											Loading policies...
										</td>
									</tr>
								) : policies.length === 0 ? (
									<tr>
										<td
											colSpan={4}
											className="px-6 py-8 text-center text-slate-500">
											No custom security policies defined.
										</td>
									</tr>
								) : (
									policies.map((policy) => (
										<tr
											key={policy.id}
											className={`hover:bg-slate-800/20 transition-colors ${!policy.isActive ? "opacity-50" : ""}`}>
											<td className="px-6 py-4 font-medium">
												<span
													className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${
														policy.type === "DENY_IP"
															? "bg-red-500/10 text-red-400 border-red-500/20"
															: policy.type === "ALLOW_IP"
																? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
																: policy.type === "TIME_RESTRICT"
																	? "bg-amber-500/10 text-amber-400 border-amber-500/20"
																	: policy.type === "GEO_RESTRICT"
																		? "bg-purple-500/10 text-purple-400 border-purple-500/20"
																		: "bg-blue-500/10 text-blue-400 border-blue-500/20"
													}`}>
													{policy.type}
												</span>
											</td>
											<td className="px-6 py-4 text-slate-300 font-mono text-xs">
												{policy.value}
											</td>
											<td className="px-6 py-4 text-slate-300 font-mono text-xs">
												{policy.resource || (
													<span className="text-slate-500 italic">GLOBAL</span>
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
