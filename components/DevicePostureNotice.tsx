import { AlertTriangle, ShieldAlert } from "lucide-react";

interface DevicePostureNoticeProps {
	message: string;
	onRetry?: () => void;
}

export function DevicePostureNotice({
	message,
	onRetry,
}: DevicePostureNoticeProps) {
	return (
		<div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl max-w-md mx-auto mt-12">
			<div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
				<ShieldAlert className="w-8 h-8 text-red-500" />
			</div>
			<h3 className="text-xl font-bold text-white mb-2">
				Device Non-Compliant
			</h3>
			<p className="text-slate-300 text-sm mb-6">
				{message ||
					"Your device does not meet the security requirements to access this resource. Please ensure your OS is updated and no unauthorized modifications (root/jailbreak) are present."}
			</p>

			<div className="flex flex-col space-y-3 w-full">
				<div className="flex items-center text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
					<AlertTriangle className="w-4 h-4 mr-2 text-yellow-500 flex-shrink-0" />
					<span>Expected: macOS 11+, Secure Boot Enabled</span>
				</div>

				{onRetry && (
					<button
						onClick={onRetry}
						className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg transition">
						Check Device Posture Again
					</button>
				)}
			</div>
		</div>
	);
}
