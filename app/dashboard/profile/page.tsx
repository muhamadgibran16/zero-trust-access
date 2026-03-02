"use client";

import { useEffect, useState } from "react";
import { ztFetch } from "../../../lib/api";
import {
	User,
	ShieldCheck,
	KeyRound,
	HardDrive,
	AlertTriangle,
	Save,
	Eye,
	EyeOff,
} from "lucide-react";

type Profile = {
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
		mfaEnabled: boolean;
		riskScore: number;
		createdAt: string;
	};
	devices: {
		id: string;
		macAddress: string;
		name: string;
		isApproved: boolean;
		createdAt: string;
	}[];
};

export default function ProfilePage() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [editName, setEditName] = useState("");
	const [savingName, setSavingName] = useState(false);

	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [savingPassword, setSavingPassword] = useState(false);
	const [showOld, setShowOld] = useState(false);
	const [showNew, setShowNew] = useState(false);

	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await ztFetch("/users/profile");
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to load profile");
			setProfile(data.data);
			setEditName(data.data.user.name);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateName = async (e: React.FormEvent) => {
		e.preventDefault();
		setSavingName(true);
		try {
			const res = await ztFetch("/users/profile", {
				method: "PUT",
				body: JSON.stringify({ name: editName }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to update");
			alert("Name updated successfully!");
			fetchProfile();
		} catch (err: any) {
			alert(err.message);
		} finally {
			setSavingName(false);
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			alert("New passwords do not match.");
			return;
		}
		setSavingPassword(true);
		try {
			const res = await ztFetch("/users/profile/password", {
				method: "PUT",
				body: JSON.stringify({ oldPassword, newPassword }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to change password");
			alert("Password changed successfully!");
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err: any) {
			alert(err.message);
		} finally {
			setSavingPassword(false);
		}
	};

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center text-slate-400">
				Loading profile...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl text-center">
					<AlertTriangle className="w-8 h-8 mx-auto mb-3" />
					<p>{error}</p>
				</div>
			</div>
		);
	}

	if (!profile) return null;

	const { user, devices } = profile;

	return (
		<div className="max-w-4xl mx-auto text-slate-300">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-white flex items-center">
					<User className="w-5 h-5 mr-3 text-violet-500" />
					My Profile
				</h1>
				<p className="text-sm text-slate-500 mt-1">
					Manage your identity, security, and trusted devices
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Account Info */}
				<div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
					<h2 className="text-lg font-semibold text-white mb-4 flex items-center">
						<User className="w-4 h-4 mr-2 text-slate-500" /> Account
					</h2>
					<div className="space-y-3 text-sm">
						<div className="flex justify-between">
							<span className="text-slate-500">Email</span>
							<span className="font-mono text-slate-300">{user.email}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-500">Role</span>
							<span
								className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
									user.role === "admin"
										? "bg-purple-500/10 text-purple-400 border-purple-500/20"
										: "bg-blue-500/10 text-blue-400 border-blue-500/20"
								}`}>
								{user.role}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-500">MFA</span>
							{user.mfaEnabled ? (
								<span className="inline-flex items-center text-xs text-emerald-400">
									<ShieldCheck className="w-3 h-3 mr-1" /> Enabled
								</span>
							) : (
								<span className="text-xs text-amber-500">Not Enabled</span>
							)}
						</div>
						<div className="flex justify-between">
							<span className="text-slate-500">Risk Score</span>
							<span
								className={`font-mono font-bold ${
									user.riskScore >= 100
										? "text-red-500"
										: user.riskScore >= 50
											? "text-amber-500"
											: "text-emerald-500"
								}`}>
								{user.riskScore}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-500">Joined</span>
							<span className="text-xs text-slate-400">
								{new Date(user.createdAt).toLocaleDateString()}
							</span>
						</div>
					</div>

					{/* Edit Name */}
					<form
						onSubmit={handleUpdateName}
						className="mt-6 pt-4 border-t border-slate-800">
						<label className="block text-xs font-medium text-slate-400 mb-1">
							Display Name
						</label>
						<div className="flex space-x-2">
							<input
								type="text"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								className="flex-1 bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
								required
								minLength={2}
							/>
							<button
								type="submit"
								disabled={savingName}
								className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center">
								<Save className="w-3 h-3 mr-1" />
								{savingName ? "..." : "Save"}
							</button>
						</div>
					</form>
				</div>

				{/* Change Password */}
				<div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
					<h2 className="text-lg font-semibold text-white mb-4 flex items-center">
						<KeyRound className="w-4 h-4 mr-2 text-slate-500" /> Change Password
					</h2>
					<form onSubmit={handleChangePassword} className="space-y-4">
						<div>
							<label className="block text-xs font-medium text-slate-400 mb-1">
								Current Password
							</label>
							<div className="relative">
								<input
									type={showOld ? "text" : "password"}
									value={oldPassword}
									onChange={(e) => setOldPassword(e.target.value)}
									className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500"
									required
								/>
								<button
									type="button"
									onClick={() => setShowOld(!showOld)}
									className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
									{showOld ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-slate-400 mb-1">
								New Password
							</label>
							<div className="relative">
								<input
									type={showNew ? "text" : "password"}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500"
									required
									minLength={6}
								/>
								<button
									type="button"
									onClick={() => setShowNew(!showNew)}
									className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
									{showNew ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-slate-400 mb-1">
								Confirm New Password
							</label>
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
								required
								minLength={6}
							/>
						</div>
						<button
							type="submit"
							disabled={savingPassword}
							className="w-full bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
							{savingPassword ? "Changing..." : "Change Password"}
						</button>
					</form>
				</div>
			</div>

			{/* My Devices */}
			<div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
				<div className="p-4 border-b border-slate-800 flex items-center">
					<HardDrive className="w-5 h-5 text-cyan-500 mr-3" />
					<h2 className="text-lg font-semibold text-white">
						My Registered Devices
					</h2>
				</div>
				<table className="w-full text-left text-sm">
					<thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
						<tr>
							<th className="px-6 py-3 font-medium">Device Name</th>
							<th className="px-6 py-3 font-medium">MAC Address</th>
							<th className="px-6 py-3 font-medium">Status</th>
							<th className="px-6 py-3 font-medium">Registered</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-800">
						{devices.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="px-6 py-8 text-center text-slate-500">
									No devices registered yet.
								</td>
							</tr>
						) : (
							devices.map((d) => (
								<tr
									key={d.id}
									className="hover:bg-slate-800/20 transition-colors">
									<td className="px-6 py-3 text-slate-300">{d.name}</td>
									<td className="px-6 py-3 font-mono text-xs text-slate-400">
										{d.macAddress}
									</td>
									<td className="px-6 py-3">
										{d.isApproved ? (
											<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
												<ShieldCheck className="w-3 h-3 mr-1" /> Trusted
											</span>
										) : (
											<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
												Pending
											</span>
										)}
									</td>
									<td className="px-6 py-3 text-xs text-slate-500">
										{new Date(d.createdAt).toLocaleDateString()}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
