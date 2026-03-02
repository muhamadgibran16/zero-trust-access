import {
	ShieldAlert,
	MonitorCheck,
	ClipboardCheck,
	CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface DevicePostureNoticeProps {
	message: string;
	onRetry?: () => void;
}

export function DevicePostureNotice({
	message,
	onRetry,
}: DevicePostureNoticeProps) {
	return (
		<div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-red-500/10 to-slate-900/50 border border-red-500/20 rounded-2xl max-w-lg mx-auto mt-12 shadow-2xl">
			<div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-5 animate-pulse">
				<ShieldAlert className="w-10 h-10 text-red-500" />
			</div>

			<h3 className="text-2xl font-bold text-white mb-2">
				Device Not Registered
			</h3>
			<p className="text-slate-400 text-sm mb-6 max-w-sm">
				Your device has not been registered in the Zero Trust fleet. All access
				is blocked until your device is enrolled and approved by an
				administrator.
			</p>

			{/* Step-by-step guide */}
			<div className="w-full space-y-3 mb-6">
				<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left mb-2">
					How to get access:
				</h4>
				<div className="flex items-start text-sm text-slate-300 bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-left">
					<div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
						1
					</div>
					<div>
						<span className="font-medium text-white">Register your device</span>
						<p className="text-xs text-slate-500 mt-0.5">
							Go to the Devices page and submit your MAC address for review.
						</p>
					</div>
				</div>
				<div className="flex items-start text-sm text-slate-300 bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-left">
					<div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
						2
					</div>
					<div>
						<span className="font-medium text-white">Wait for IT approval</span>
						<p className="text-xs text-slate-500 mt-0.5">
							An administrator will review and approve your device. If you are
							the admin, you can approve it yourself.
						</p>
					</div>
				</div>
				<div className="flex items-start text-sm text-slate-300 bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-left">
					<div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
						3
					</div>
					<div>
						<span className="font-medium text-white">Access granted!</span>
						<p className="text-xs text-slate-500 mt-0.5">
							Once approved, refresh any page and all features will be unlocked.
						</p>
					</div>
				</div>
			</div>

			<div className="flex flex-col space-y-3 w-full">
				<Link
					href="/dashboard/devices"
					className="w-full inline-flex justify-center items-center bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-xl transition text-sm shadow-lg shadow-cyan-500/20">
					<MonitorCheck className="w-4 h-4 mr-2" />
					Register this Device Now
				</Link>

				{onRetry && (
					<button
						onClick={onRetry}
						className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition text-sm border border-slate-700">
						<span className="flex items-center justify-center">
							<CheckCircle2 className="w-4 h-4 mr-2" />
							I've registered — Check again
						</span>
					</button>
				)}
			</div>
		</div>
	);
}
