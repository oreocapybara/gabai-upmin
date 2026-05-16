"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

function GoogleIcon() {
	return (
		<svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</svg>
	);
}

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;
			router.push("/");
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		const supabase = createClient();
		setIsLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/`,
				},
			});
			if (error) throw error;
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-xl", className)} {...props}>
			{/* Heading */}
			<div className="flex flex-col gap-xs">
				<p className="text-l font-semibold text-content-primary">Sign in</p>
				<p className="text-s text-content-secondary">
					Enter your credentials to access the dashboard
				</p>
			</div>

			{/* Form */}
			<form onSubmit={handleLogin} className="flex flex-col gap-m">
				{/* Email */}
				<Input
					id="email"
					type="email"
					label="Email"
					placeholder="admin@example.com"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					leading={<AlternateEmailRoundedIcon fontSize="small" />}
					state={error ? "error" : "default"}
				/>

				{/* Password */}
				<div className="flex flex-col gap-s">
					<div className="flex items-center justify-between px-1">
						<span className="text-s font-medium text-content-secondary">Password</span>
						<Link
							href="/forgot-password"
							className="text-xs text-content-link transition-colors hover:text-content-link-hover active:text-content-link-pressed"
						>
							Forgot password?
						</Link>
					</div>
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						placeholder="••••••••"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						leading={<LockOutlinedIcon fontSize="small" />}
						trailing={
							<button
								type="button"
								onClick={() => setShowPassword((v) => !v)}
								className="text-content-tertiary hover:text-content-secondary transition-colors"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword
									? <VisibilityOffRoundedIcon fontSize="small" />
									: <VisibilityRoundedIcon fontSize="small" />}
							</button>
						}
						state={error ? "error" : "default"}
						helpText={error ?? undefined}
					/>
				</div>

				{/* Submit */}
				<Button
					type="submit"
					className="h-11 w-full rounded-2xl font-semibold"
					disabled={isLoading}
				>
					{isLoading ? "Signing in…" : "Sign in"}
				</Button>
			</form>

			{/* OR divider */}
			<div className="flex items-center gap-m">
				<div className="h-px flex-1 bg-stroke-tertiary" />
				<span className="text-xs uppercase tracking-widest text-content-tertiary">
					or
				</span>
				<div className="h-px flex-1 bg-stroke-tertiary" />
			</div>

			{/* Google */}
			<Button
				type="button"
				variant="secondary"
				className="h-11 w-full gap-2 rounded-2xl"
				onClick={handleGoogleSignIn}
				disabled={isLoading}
			>
				<GoogleIcon />
				Continue with Google
			</Button>

			{/* Footer */}
			<p className="text-center text-s text-content-tertiary">
				Admin access is managed by the System Administrator.
			</p>
		</div>
	);
}
