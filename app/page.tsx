import Link from "next/link";
import Image from "next/image";
import {
	Shield,
	Lock,
	Activity,
	Server,
	Smartphone,
	Key,
	ArrowRight,
	Globe,
	Zap,
} from "lucide-react";

export default function Home() {
	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30">
			{/* Navbar */}
			<nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-20">
						<div className="flex items-center space-x-3">
							<Image
								src="/logo.png"
								alt="FortiGateX Logo"
								width={40}
								height={40}
								className="rounded-lg shadow-sm object-contain"
							/>
							<span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
								FortiGateX
							</span>
						</div>
						<div className="flex items-center space-x-4">
							<Link
								href="/login"
								className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors hidden sm:block">
								Sign In
							</Link>
							<Link
								href="/register"
								className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center">
								Get Started
								<ArrowRight className="w-4 h-4 ml-2" />
							</Link>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
				<div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
				<div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
					<div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-8 animate-in fade-in-up duration-500">
						<span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
						Introducing FortiGateX 2.0
					</div>
					<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
						Next-Gen <br className="hidden md:block" />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">
							Zero Trust Network Access
						</span>
					</h1>
					<p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
						Never trust, always verify. Secure your enterprise portal with an
						Identity-Aware Proxy, Device Posture Checks, and Dynamic Policy
						Engine.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							href="/register"
							className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 flex items-center w-full sm:w-auto justify-center text-lg">
							Start Free Trial
							<ArrowRight className="w-5 h-5 ml-2" />
						</Link>
						<Link
							href="/login"
							className="px-8 py-4 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-105 flex items-center w-full sm:w-auto justify-center text-lg backdrop-blur-sm">
							<Lock className="w-5 h-5 mr-2" />
							Login to Portal
						</Link>
					</div>
				</div>
			</section>

			{/* Trust Badges */}
			<section className="py-10 border-y border-slate-200 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">
						Trusted by innovative security teams worldwide
					</p>
					<div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
						<div className="flex items-center text-xl font-bold font-serif">
							<div className="w-8 h-8 rounded bg-slate-800 mr-2" /> ACME Corp
						</div>
						<div className="flex items-center text-xl font-bold font-mono">
							<div className="w-8 h-8 rounded-full bg-slate-800 mr-2" /> Globex
						</div>
						<div className="flex items-center text-xl font-bold italic">
							<div className="w-8 h-8 rotate-45 bg-slate-800 mr-2" /> Soylent
						</div>
						<div className="flex items-center text-xl font-bold tracking-tighter">
							<div className="w-6 h-8 bg-slate-800 mr-2" /> Initech
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className="py-24 relative z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-5xl font-bold mb-4">
							Enterprise Grade Security Features
						</h2>
						<p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
							Everything you need to deploy a robust Zero Trust architecture
							without the complexity.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								icon: Lock,
								title: "Identity-Aware Proxy",
								desc: "Protect internal apps without a VPN. Verify every request dynamically.",
							},
							{
								icon: Smartphone,
								title: "Device Posture",
								desc: "Ensure endpoints are compliant before granting access to sensitive data.",
							},
							{
								icon: Key,
								title: "Adaptive Auth",
								desc: "MFA and SSO integration that adapts to real-time user risk profiles.",
							},
							{
								icon: Server,
								title: "Cloaked Tunnels",
								desc: "Your resources remain completely invisible to the public internet.",
							},
							{
								icon: Shield,
								title: "Dynamic Policies",
								desc: "Location, time, and role-based access control engine.",
							},
							{
								icon: Activity,
								title: "Actionable Analytics",
								desc: "Comprehensive audit logs and command center monitoring.",
							},
						].map((Feature, i) => (
							<div
								key={i}
								className="group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1">
								<div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white dark:text-blue-400 transition-colors">
									<Feature.icon className="w-7 h-7" />
								</div>
								<h3 className="text-xl font-bold mb-3">{Feature.title}</h3>
								<p className="text-slate-600 dark:text-slate-400 leading-relaxed">
									{Feature.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Why FortiGateX */}
			<section className="py-24 bg-slate-900 text-white relative overflow-hidden">
				<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
				<div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-5xl font-bold mb-4">
							Why Choose FortiGateX?
						</h2>
						<p className="text-lg text-slate-300 max-w-2xl mx-auto">
							Engineered for modern teams that demand security without
							sacrificing agility.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
						<div className="flex flex-col items-center text-center">
							<Shield className="w-16 h-16 text-emerald-400 mb-6" />
							<h3 className="text-2xl font-bold mb-3">
								Uncompromising Security
							</h3>
							<p className="text-slate-400">
								Military-grade encryption and continuous verification thwart
								lateral movement and credential theft.
							</p>
						</div>
						<div className="flex flex-col items-center text-center">
							<Zap className="w-16 h-16 text-blue-400 mb-6" />
							<h3 className="text-2xl font-bold mb-3">Lightning Fast Setup</h3>
							<p className="text-slate-400">
								Deploy your proxy, configure policies, and onboard users in
								minutes, not months.
							</p>
						</div>
						<div className="flex flex-col items-center text-center">
							<Globe className="w-16 h-16 text-purple-400 mb-6" />
							<h3 className="text-2xl font-bold mb-3">
								Seamless User Experience
							</h3>
							<p className="text-slate-400">
								Employees access what they need instantly, with intelligent,
								frictionless authentication.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="py-24 relative overflow-hidden">
				<div className="absolute inset-0 bg-blue-600 dark:bg-slate-900 bg-gradient-to-tr from-blue-700 to-blue-500 dark:from-blue-900 dark:to-emerald-900" />
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/30 rounded-full blur-[80px]" />
				<div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/30 rounded-full blur-[80px]" />

				<div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
					<h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
						Ready to secure your enterprise?
					</h2>
					<p className="text-xl text-blue-100 mb-10">
						Join thousands of forward-thinking organizations using FortiGateX to
						implement Zero Trust Network Access today.
					</p>
					<Link
						href="/register"
						className="px-10 py-5 bg-white text-blue-600 hover:bg-slate-50 font-bold rounded-xl shadow-2xl transition-all hover:scale-105 inline-flex items-center text-lg">
						Create Free Account
						<ArrowRight className="w-5 h-5 ml-2" />
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
					<div className="flex items-center space-x-3 mb-6 md:mb-0">
						<Image
							src="/logo.png"
							alt="FortiGateX Logo"
							width={32}
							height={32}
							className="rounded-md opacity-80"
						/>
						<span className="font-bold text-xl text-white">FortiGateX</span>
					</div>
					<div className="text-sm">
						&copy; {new Date().getFullYear()} FortiGateX Inc. All rights
						reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
