import Image from "next/image";

const R = 44;
const CIRCUMFERENCE = 2 * Math.PI * R;
const ARC = CIRCUMFERENCE * 0.72;
const GAP = CIRCUMFERENCE - ARC;

export default function Loading() {
	return (
		<main className="flex min-h-svh w-screen items-center justify-center bg-surface-brand">
			<div className="flex flex-col items-center gap-5">

				{/* Logo + spinner ring */}
				<div className="relative flex items-center justify-center w-24 h-24">

					{/* Outer pulse halo */}
					<div
						className="absolute inset-0 rounded-full bg-white/10"
						style={{ animation: "logoHalo 2s ease-in-out infinite" }}
					/>

					{/* Spinner arc SVG */}
					<svg
						className="absolute inset-0 animate-spin"
						viewBox="0 0 96 96"
						width="96"
						height="96"
						style={{ animationDuration: "1.1s", animationTimingFunction: "linear" }}
					>
						{/* Faint track */}
						<circle
							cx="48"
							cy="48"
							r={R}
							fill="none"
							stroke="rgba(255,255,255,0.18)"
							strokeWidth="2.5"
						/>
						{/* Moving arc */}
						<circle
							cx="48"
							cy="48"
							r={R}
							fill="none"
							stroke="rgba(255,255,255,0.9)"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeDasharray={`${ARC} ${GAP}`}
						/>
					</svg>

					{/* Logo circle */}
					<div className="relative h-[68px] w-[68px] overflow-hidden rounded-full bg-white/10 z-10">
						<Image
							src="/logo.svg"
							alt="GabAI"
							fill
							priority
							className="object-contain p-2"
						/>
					</div>
				</div>

				{/* App name */}
				<p className="font-display font-bold text-l text-white/90 tracking-widest uppercase">
					Gabai UP Mindanao
				</p>
			</div>

			<style>{`
				@keyframes logoHalo {
					0%   { transform: scale(1);   opacity: 0.12; }
					50%  { transform: scale(1.25); opacity: 0;   }
					100% { transform: scale(1);   opacity: 0.12; }
				}
			`}</style>
		</main>
	);
}
