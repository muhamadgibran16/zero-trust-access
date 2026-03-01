"use client";

import { useEffect, useState } from "react";
import { ztFetch } from "../../../lib/api";
import { ShieldCheck, Users, Search, PowerOff } from "lucide-react";

export default function UsersPage() {
	const [users, setUsers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await ztFetch("/users/admin/users?perPage=50");
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to fetch users");
			if (data.data) {
				setUsers(data.data);
			} else {
				setUsers([]);
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleRoleChange = async (userId: string, newRole: string) => {
		setUpdatingId(userId);
		try {
			const res = await ztFetch(`/users/admin/users/${userId}/role`, {
				method: "PUT",
				body: JSON.stringify({ role: newRole }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to update role");

			// Update local state
			setUsers(
				users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
			);
			alert(`User role successfully changed to ${newRole}`);
		} catch (err: any) {
			alert(err.message);
		} finally {
			setUpdatingId(null);
		}
	};

	const handleRevokeSession = async (userId: string, userName: string) => {
		if (
			!confirm(
				`Are you sure you want to FORCE LOGOUT user ${userName}? This will invalidate all their active sessions immediately.`,
			)
		)
			return;

		setUpdatingId(userId);
		try {
			const res = await ztFetch(`/users/admin/users/${userId}/revoke`, {
				method: "POST",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to revoke session");

			alert(`All sessions for ${userName} have been revoked and blacklisted.`);
		} catch (err: any) {
			alert(err.message);
		} finally {
			setUpdatingId(null);
		}
	};

	return (
		<div className="max-w-6xl mx-auto text-slate-300">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-white flex items-center">
						<Users className="w-5 h-5 mr-3 text-blue-500" />
						User Management
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						Manage identities and assign administrative privileges
					</p>
				</div>
			</div>

			{error && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
					Error: {error}
				</div>
			)}

			<div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
				<div className="p-4 border-b border-slate-800 flex items-center">
					<Search className="w-5 h-5 text-slate-500 mr-3" />
					<input
						type="text"
						placeholder="Search users..."
						className="bg-transparent border-none text-slate-300 focus:outline-none w-full"
						disabled
					/>
				</div>
				<table className="w-full text-left text-sm">
					<thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
						<tr>
							<th className="px-6 py-4 font-medium">Name</th>
							<th className="px-6 py-4 font-medium">Email</th>
							<th className="px-6 py-4 font-medium">MFA Status</th>
							<th className="px-6 py-4 font-medium">Role</th>
							<th className="px-6 py-4 font-medium text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-800">
						{loading ? (
							<tr>
								<td
									colSpan={5}
									className="px-6 py-8 text-center text-slate-500">
									Loading users...
								</td>
							</tr>
						) : users.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="px-6 py-8 text-center text-slate-500">
									No users found
								</td>
							</tr>
						) : (
							users.map((user) => (
								<tr
									key={user.id}
									className="hover:bg-slate-800/20 transition-colors">
									<td className="px-6 py-4 font-medium text-slate-300">
										{user.name}
									</td>
									<td className="px-6 py-4 text-slate-400">{user.email}</td>
									<td className="px-6 py-4">
										{user.mfaEnabled ? (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
												<ShieldCheck className="w-3 h-3 mr-1" /> Enabled
											</span>
										) : (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
												Pending
											</span>
										)}
									</td>
									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
												user.role === "admin"
													? "bg-purple-500/10 text-purple-400 border-purple-500/20"
													: "bg-blue-500/10 text-blue-400 border-blue-500/20"
											}`}>
											{user.role}
										</span>
									</td>
									<td className="px-6 py-4 flex items-center justify-end space-x-3">
										<select
											value={user.role}
											onChange={(e) =>
												handleRoleChange(user.id, e.target.value)
											}
											disabled={updatingId === user.id}
											className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-24 p-2 disabled:opacity-50">
											<option value="user">User</option>
											<option value="admin">Admin</option>
										</select>
										<button
											onClick={() => handleRevokeSession(user.id, user.name)}
											disabled={updatingId === user.id}
											className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg transition-colors disabled:opacity-50"
											title="Force Logout (Revoke Sessions)">
											<PowerOff className="w-4 h-4" />
										</button>
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
