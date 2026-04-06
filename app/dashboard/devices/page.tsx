"use client";

import { useEffect, useState } from "react";
import { ztFetch } from "../../../lib/api";
import {
	HardDrive,
	MonitorCheck,
	Search,
	Plus,
	Trash2,
	PowerOff,
	ShieldCheck,
	AlertTriangle,
} from "lucide-react";

type Device = {
	id: string;
	userId: string;
	macAddress: string;
	name: string;
	isApproved: boolean;
	createdAt: string;
	User?: {
		name: string;
		email: string;
		role: string;
	};
};

export default function DevicesPage() {
	const [devices, setDevices] = useState<Device[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [newMac, setNewMac] = useState("");
	const [newName, setNewName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedMac = localStorage.getItem("deviceMac");
			if (storedMac) setNewMac(storedMac);
		}
		fetchDevices();
	}, []);

	const fetchDevices = async () => {
		setLoading(true);
		setError(null);
		try {
			// Since we want admin view, we'll fetch from the admin endpoint.
			// In a real app we'd conditionally fetch based on user role.
			const res = await ztFetch("/users/admin/devices");
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to fetch devices");
			if (data.data) {
				setDevices(data.data);
			} else {
				setDevices([]);
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMac || !newName) return;

		setIsSubmitting(true);
		try {
			const res = await ztFetch("/users/devices", {
				method: "POST",
				body: JSON.stringify({ macAddress: newMac, name: newName }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to register device");

			setNewMac("");
			setNewName("");
			fetchDevices();
			alert("Device submitted for IT approval successfully");
		} catch (err: any) {
			alert(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleApprove = async (mac: string) => {
		try {
			const res = await ztFetch(`/users/admin/devices/${mac}/approve`, {
				method: "PUT",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to approve device");

			setDevices(
				devices.map((d) =>
					d.macAddress === mac ? { ...d, isApproved: true } : d,
				),
			);
		} catch (err: any) {
			alert(err.message);
		}
	};

	const handleReject = async (mac: string) => {
		try {
			const res = await ztFetch(`/users/admin/devices/${mac}/reject`, {
				method: "PUT",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to reject device");

			setDevices(
				devices.map((d) =>
					d.macAddress === mac ? { ...d, isApproved: false } : d,
				),
			);
		} catch (err: any) {
			alert(err.message);
		}
	};

	return (
		<div className="max-w-6xl mx-auto text-slate-900">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 flex items-center">
						<MonitorCheck className="w-5 h-5 mr-3 text-cyan-600" />
						Device Posture (MDM)
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Manage corporate-issued and BYOD hardware identifiers for zero trust
						networks
					</p>
				</div>
			</div>

			{error && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6 flex items-start">
					<AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
					<span>{error}</span>
				</div>
			)}

			<div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
				{/* Self-Service Registration */}
				<div className="xl:col-span-1">
					<form
						onSubmit={handleRegister}
						className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg relative overflow-hidden">
						{/* Decorative background element */}
						<div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
							<MonitorCheck className="w-32 h-32" />
						</div>
						<h2 className="text-lg font-semibold text-slate-900 mb-4 relative z-10">
							Register Device
						</h2>
						<p className="text-xs text-slate-500 mb-6 relative z-10">
							Submit a new device for IT compliance and trust approval.
						</p>

						<div className="space-y-4 relative z-10">
							<div>
								<label className="block text-xs font-medium text-slate-500 mb-1">
									MAC Address <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									placeholder="e.g. 00:1A:2B:3C:4D:5E"
									value={newMac}
									onChange={(e) => setNewMac(e.target.value)}
									className="w-full bg-slate-50 border border-slate-300 rounded-lg text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-slate-500 mb-1">
									Device Nickname <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									placeholder="e.g. John's MacBook Pro"
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									className="w-full bg-slate-50 border border-slate-300 rounded-lg text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
								/>
							</div>

							<button
								type="submit"
								disabled={isSubmitting || !newMac || !newName}
								className="w-full flex justify-center items-center bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm mt-4">
								{isSubmitting ? (
									"Submitting..."
								) : (
									<>
										<Plus className="w-4 h-4 mr-2" /> Request Approval
									</>
								)}
							</button>
						</div>
					</form>
				</div>

				{/* Device Fleet View */}
				<div className="xl:col-span-3">
					<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg">
						<div className="p-4 border-b border-slate-200 flex items-center justify-between">
							<div className="flex items-center w-full max-w-md">
								<Search className="w-5 h-5 text-slate-400 mr-3" />
								<input
									type="text"
									placeholder="Search fleet..."
									className="bg-transparent border-none text-slate-900 focus:outline-none w-full text-sm placeholder:text-slate-400"
									disabled
								/>
							</div>
							<span className="text-xs text-slate-400 hidden sm:inline-block">
								Total Fleet Size: {devices.length}
							</span>
						</div>
						<table className="w-full text-left text-sm whitespace-nowrap">
							<thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
								<tr>
									<th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">
										Owner
									</th>
									<th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">
										Device Info
									</th>
									<th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">
										Compliance
									</th>
									<th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">
										IT Force Commands
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200">
								{loading ? (
									<tr>
										<td
											colSpan={4}
											className="px-6 py-12 text-center text-slate-500">
											<div className="flex flex-col flex-1 items-center justify-center">
												<MonitorCheck className="w-8 h-8 text-slate-700 mb-4 animate-pulse" />
												<p>Synchronizing MDM database...</p>
											</div>
										</td>
									</tr>
								) : devices.length === 0 ? (
									<tr>
										<td
											colSpan={4}
											className="px-6 py-12 text-center text-slate-500">
											<div className="flex flex-col flex-1 items-center justify-center">
												<HardDrive className="w-8 h-8 text-slate-700 mb-4" />
												<p>
													No trusted hardware devices registered in the fleet
													yet.
												</p>
											</div>
										</td>
									</tr>
								) : (
									devices.map((device) => (
										<tr
											key={device.id}
											className={`hover:bg-slate-50 transition-colors ${!device.isApproved ? "opacity-75 bg-slate-50" : ""}`}>
											<td className="px-6 py-4">
												<div className="flex flex-col">
													<span className="font-medium text-slate-900">
														{device.User?.name || "Unknown"}
													</span>
													<span className="text-xs text-slate-500 font-mono mt-0.5">
														{device.User?.email || "-"}
													</span>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex flex-col">
													<span className="font-medium text-slate-900">
														{device.name}
													</span>
													<span className="text-[11px] text-slate-500 font-mono mt-0.5 tracking-wider">
														{device.macAddress}
													</span>
												</div>
											</td>
											<td className="px-6 py-4">
												{device.isApproved ? (
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
														<ShieldCheck className="w-3 h-3 mr-1.5" /> Trusted
													</span>
												) : (
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
														<AlertTriangle className="w-3 h-3 mr-1.5" />{" "}
														Quarantine
													</span>
												)}
											</td>
											<td className="px-6 py-4 flex items-center justify-end space-x-2">
												{device.isApproved ? (
													<button
														onClick={() => handleReject(device.macAddress)}
														className="px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-lg transition-colors text-xs font-semibold uppercase tracking-wider flex items-center">
														<PowerOff className="w-3 h-3 mr-1.5" /> Revoke Trust
													</button>
												) : (
													<button
														onClick={() => handleApprove(device.macAddress)}
														className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors text-xs font-semibold uppercase tracking-wider flex items-center">
														<ShieldCheck className="w-3 h-3 mr-1.5" /> Approve
														Trust
													</button>
												)}
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
