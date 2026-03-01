import Link from "next/link";
import { Shield, Lock, Activity, Server, Smartphone, Key } from "lucide-react";

export default function Home() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col items-center justify-center p-4 relative overflow-hidden">
			{/* Animated Background Elements */}
			<div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
			<div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />

			<div className="text-center max-w-3xl z-10">
				<div className="inline-flex items-center justify-center p-4 bg-slate-900 ring-1 ring-slate-800 rounded-2xl mb-8 shadow-2xl relative group cursor-default">
					<div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl group-hover:bg-blue-500/20 transition-all duration-500" />
					<Shield className="w-16 h-16 text-blue-500 relative z-10" />
				</div>
				<h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
					Zero Trust{" "}
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
						Access
					</span>
				</h1>
				<p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
					Never trust, always verify. Secure enterprise portal protected by
					Identity-Aware Proxy, Device Posture Checks, and Dynamic Policy
					Engine.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
					<Link
						href="/login"
						className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center w-full sm:w-auto justify-center">
						<Lock className="w-5 h-5 mr-2" />
						Access Portal
					</Link>
					<Link
						href="/dashboard"
						className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all hover:scale-105 flex items-center w-full sm:w-auto justify-center">
						<Activity className="w-5 h-5 mr-2" />
						Admin Logs
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
					<div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
						<Key className="w-8 h-8 text-emerald-400 mb-4" />
						<h3 className="text-lg font-bold text-white mb-2">Adaptive Auth</h3>
						<p className="text-sm text-slate-400">
							Continuous authentication via MFA and SSO integration validating
							real-time context.
						</p>
					</div>
					<div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
						<Smartphone className="w-8 h-8 text-blue-400 mb-4" />
						<h3 className="text-lg font-bold text-white mb-2">
							Device Posture
						</h3>
						<p className="text-sm text-slate-400">
							Strictly blocks unmanaged, rooted, or outdated endpoints from
							accessing APIs.
						</p>
					</div>
					<div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
						<Server className="w-8 h-8 text-purple-400 mb-4" />
						<h3 className="text-lg font-bold text-white mb-2">
							Cloaked Tunnel
						</h3>
						<p className="text-sm text-slate-400">
							Critical resources are hidden behind an encrypted tunnel, immune
							to public scanning.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
