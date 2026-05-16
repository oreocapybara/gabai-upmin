import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Page() {
	return (
		<main className="flex min-h-[calc(100svh-4rem)] flex-col bg-surface-brand">
			{/* Brand hero */}
			<div className="flex flex-col items-center justify-center gap-m px-xl py-2xl">
				<div className="overflow-hidden rounded-full shadow-xl ring-4 ring-white-40">
					<Image
						src="/logo.svg"
						alt="GABAI UP Mindanao Logo"
						width={72}
						height={72}
						priority
						className="object-contain"
					/>
				</div>
				<div className="flex flex-col items-center gap-xs text-center">
					<h4 className="text-content-inverse-primary tracking-wide">
						GABAI UP MINDANAO
					</h4>
					<p className="text-s text-content-inverse-secondary">Admin Portal</p>
				</div>
			</div>

			{/* Content sheet */}
			<div className="flex-1 rounded-t-[32px] bg-surface-primary px-xl pt-2xl pb-10 shadow-[0_-8px_32px_rgba(0,0,0,0.15)]">
				<div className="mx-auto w-full max-w-sm">
					<LoginForm />
				</div>
			</div>
		</main>
	);
}
