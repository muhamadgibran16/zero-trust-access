"use client";

import { useEffect, useState, useRef } from "react";
import { ztFetch } from "../lib/api";
import { Bell, X, Check } from "lucide-react";

type Notification = {
	id: string;
	title: string;
	message: string;
	type: string;
	isRead: boolean;
	createdAt: string;
};

export function NotificationBell() {
	const [open, setOpen] = useState(false);
	const [notifs, setNotifs] = useState<Notification[]>([]);
	const [unread, setUnread] = useState(0);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchUnreadCount();
		const interval = setInterval(fetchUnreadCount, 15000); // Poll every 15s
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (open) fetchNotifications();
	}, [open]);

	// Close on outside click
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	const fetchUnreadCount = async () => {
		try {
			const res = await ztFetch("/users/notifications/unread-count");
			const data = await res.json();
			if (res.ok && data.data) {
				setUnread(data.data.count || 0);
			}
		} catch {
			// Silently fail
		}
	};

	const fetchNotifications = async () => {
		try {
			const res = await ztFetch("/users/notifications");
			const data = await res.json();
			if (res.ok && data.data) {
				setNotifs(data.data || []);
			}
		} catch {
			// Silently fail
		}
	};

	const markAsRead = async (id: string) => {
		try {
			await ztFetch(`/users/notifications/${id}/read`, { method: "PUT" });
			setNotifs(notifs.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
			setUnread(Math.max(0, unread - 1));
		} catch {
			// Silently fail
		}
	};

	const typeColor = (type: string) => {
		switch (type) {
			case "DEVICE_REQUEST":
				return "text-cyan-600";
			case "HIGH_RISK":
				return "text-red-600";
			case "SESSION_REVOKED":
				return "text-amber-600";
			default:
				return "text-slate-500";
		}
	};

	return (
		<div className="relative" ref={ref}>
			<button
				onClick={() => setOpen(!open)}
				className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100">
				<Bell className="w-5 h-5" />
				{unread > 0 && (
					<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
						{unread > 9 ? "9+" : unread}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
					<div className="p-3 border-b border-slate-200 flex items-center justify-between">
						<h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
						<button
							onClick={() => setOpen(false)}
							className="text-slate-400 hover:text-slate-700">
							<X className="w-4 h-4" />
						</button>
					</div>
					<div className="max-h-80 overflow-y-auto">
						{notifs.length === 0 ? (
							<div className="p-6 text-center text-slate-500 text-sm">
								No notifications
							</div>
						) : (
							notifs.map((n) => (
								<div
									key={n.id}
									className={`p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
										!n.isRead ? "bg-blue-50/50" : ""
									}`}>
									<div className="flex items-start justify-between">
										<div className="flex-1 min-w-0">
											<div className="flex items-center space-x-2">
												{!n.isRead && (
													<span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
												)}
												<p
													className={`text-xs font-semibold truncate ${typeColor(n.type)}`}>
													{n.title}
												</p>
											</div>
											<p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
												{n.message}
											</p>
											<p className="text-[10px] text-slate-400 mt-1">
												{new Date(n.createdAt).toLocaleString()}
											</p>
										</div>
										{!n.isRead && (
											<button
												onClick={() => markAsRead(n.id)}
												className="ml-2 p-1 text-slate-400 hover:text-emerald-600 transition-colors flex-shrink-0"
												title="Mark as read">
												<Check className="w-3 h-3" />
											</button>
										)}
									</div>
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
