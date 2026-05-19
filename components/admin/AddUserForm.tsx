"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { createAdminUserAction } from "@/app/admin/actions";

// ─── Validation helpers ───────────────────────────────────────────────────────

const UP_DOMAIN = "@up.edu.ph";

function isValidUpEmail(email: string) {
	return email.toLowerCase().endsWith(UP_DOMAIN);
}

type PasswordChecks = {
	length: boolean;
	uppercase: boolean;
	lowercase: boolean;
	number: boolean;
	special: boolean;
};

function getPasswordStrength(pwd: string): { checks: PasswordChecks; score: number } {
	const checks: PasswordChecks = {
		length: pwd.length >= 8,
		uppercase: /[A-Z]/.test(pwd),
		lowercase: /[a-z]/.test(pwd),
		number: /[0-9]/.test(pwd),
		special: /[^a-zA-Z0-9]/.test(pwd),
	};
	return { checks, score: Object.values(checks).filter(Boolean).length };
}

const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong", "Strong"] as const;
const STRENGTH_BAR_COLOR = [
	"",
	"bg-content-negative",
	"bg-content-notice",
	"bg-content-notice",
	"bg-content-positive",
	"bg-content-positive",
] as const;

const CHECK_LABELS: { key: keyof PasswordChecks; label: string }[] = [
	{ key: "length", label: "At least 8 characters" },
	{ key: "uppercase", label: "Uppercase letter (A–Z)" },
	{ key: "lowercase", label: "Lowercase letter (a–z)" },
	{ key: "number", label: "Number (0–9)" },
	{ key: "special", label: "Special character (!@#…)" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PasswordStrengthMeter({ password }: { password: string }) {
	if (!password) return null;
	const { checks, score } = getPasswordStrength(password);

	return (
		<div className="flex flex-col gap-s">
			{/* Strength bar */}
			<div className="flex items-center gap-s">
				<div className="flex flex-1 gap-1">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								"h-1 flex-1 rounded-full transition-all duration-300",
								score > i ? STRENGTH_BAR_COLOR[score] : "bg-stroke-secondary",
							)}
						/>
					))}
				</div>
				<span
					className={cn(
						"text-xs font-medium w-10 text-right transition-colors duration-300",
						score <= 1 && "text-content-negative",
						score === 2 || score === 3 ? "text-content-notice" : "",
						score >= 4 && "text-content-positive",
					)}
				>
					{STRENGTH_LABEL[score]}
				</span>
			</div>

			{/* Checklist */}
			<ul className="grid grid-cols-1 gap-xs">
				{CHECK_LABELS.map(({ key, label }) => (
					<li
						key={key}
						className={cn(
							"flex items-center gap-xs text-xs transition-colors duration-200",
							checks[key] ? "text-content-positive" : "text-content-tertiary",
						)}
					>
						<CheckRoundedIcon
							fontSize="inherit"
							className={cn(
								"transition-opacity duration-200",
								checks[key] ? "opacity-100" : "opacity-30",
							)}
						/>
						{label}
					</li>
				))}
			</ul>
		</div>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddUserForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	// ── Create account state ──────────────────────────────────────────────────
	const [email, setEmail] = useState("");
	const [emailTouched, setEmailTouched] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// ── Invite state ──────────────────────────────────────────────────────────
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteEmailTouched, setInviteEmailTouched] = useState(false);
	const [inviteLink, setInviteLink] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	// ── Derived validation ────────────────────────────────────────────────────
	const emailValid = !email || isValidUpEmail(email);
	const emailError = emailTouched && email && !emailValid;

	const { checks: pwChecks, score: pwScore } = getPasswordStrength(password);
	const passwordWeak = password.length > 0 && pwScore < 4;
	const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
	const passwordMatch = confirmPassword.length > 0 && password === confirmPassword;

	const inviteEmailValid = !inviteEmail || isValidUpEmail(inviteEmail);
	const inviteEmailError = inviteEmailTouched && inviteEmail && !inviteEmailValid;

	const isFormValid =
		email &&
		isValidUpEmail(email) &&
		username.trim() &&
		pwScore >= 4 &&
		password === confirmPassword &&
		confirmPassword.length > 0;

	// ── Handlers ──────────────────────────────────────────────────────────────
	const handleAddUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setEmailTouched(true);
		if (!isFormValid) return;

		setIsLoading(true);
		setError(null);
		setSuccess(false);

		const result = await createAdminUserAction(email, password, username);
		if (result.error) {
			setError(result.error);
		} else {
			setSuccess(true);
			setEmail("");
			setEmailTouched(false);
			setUsername("");
			setPassword("");
			setConfirmPassword("");
		}
		setIsLoading(false);
	};

	const handleGenerateInvite = () => {
		setInviteEmailTouched(true);
		if (!inviteEmail || !isValidUpEmail(inviteEmail)) return;
		const callbackUrl = `${window.location.origin}/auth/callback?next=/admin&invited_email=${encodeURIComponent(inviteEmail)}`;
		const link = `${window.location.origin}/invite/start?provider=google&email=${encodeURIComponent(inviteEmail)}&redirect_to=${encodeURIComponent(callbackUrl)}`;
		setInviteLink(link);
		setCopied(false);
	};

	const handleCopy = async () => {
		if (!inviteLink) return;
		await navigator.clipboard.writeText(inviteLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className={cn("flex flex-col gap-xl", className)} {...props}>
			{/* Header */}
			<div className="flex flex-col gap-xs">
				<p className="text-l font-semibold text-content-primary">Add admin user</p>
				<p className="text-s text-content-secondary">
					Create an account with email and password, or invite someone via Google.
					Only <strong>@up.edu.ph</strong> emails are accepted.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-xl md:grid-cols-2 md:gap-2xl">
				{/* ── Create account ── */}
				<Card className="border-stroke-secondary">
					<CardContent className="flex flex-col gap-l pt-l">
						<div className="flex flex-col gap-xs">
							<p className="text-m font-semibold text-content-primary">
								Email &amp; password
							</p>
							<p className="text-s text-content-tertiary">
								Creates the account immediately with a confirmed email.
							</p>
						</div>

						<form onSubmit={handleAddUser} className="flex flex-col gap-m">
							<Input
								id="email"
								type="email"
								label="Email"
								placeholder="user@up.edu.ph"
								required
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									setSuccess(false);
								}}
								onBlur={() => setEmailTouched(true)}
								leading={<AlternateEmailRoundedIcon fontSize="small" />}
								state={emailError ? "error" : "default"}
								helpText={emailError ? `Only @up.edu.ph emails are allowed` : undefined}
							/>

							<Input
								id="username"
								type="text"
								label="Username"
								placeholder="e.g. john_doe"
								required
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								leading={<PersonOutlineRoundedIcon fontSize="small" />}
							/>

							<div className="flex flex-col gap-s">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									label="Password"
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
									state={
										passwordWeak ? "error"
										: pwScore >= 4 ? "success"
										: "default"
									}
								/>
								<PasswordStrengthMeter password={password} />
							</div>

							<Input
								id="confirm-password"
								type={showConfirmPassword ? "text" : "password"}
								label="Confirm password"
								placeholder="••••••••"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								leading={<LockOutlinedIcon fontSize="small" />}
								trailing={
									<button
										type="button"
										onClick={() => setShowConfirmPassword((v) => !v)}
										className="text-content-tertiary hover:text-content-secondary transition-colors"
										aria-label={showConfirmPassword ? "Hide password" : "Show password"}
									>
										{showConfirmPassword
											? <VisibilityOffRoundedIcon fontSize="small" />
											: <VisibilityRoundedIcon fontSize="small" />}
									</button>
								}
								state={
									passwordMismatch ? "error"
									: passwordMatch ? "success"
									: "default"
								}
								helpText={passwordMismatch ? "Passwords do not match" : undefined}
							/>

							{error && <p className="text-s text-content-negative">{error}</p>}
							{success && (
								<p className="text-s text-content-positive">
									Admin user created successfully.
								</p>
							)}

							<Button
								type="submit"
								className="w-full"
								disabled={isLoading || !isFormValid}
							>
								{isLoading ? "Creating…" : "Create account"}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* ── Invite via Google ── */}
				<Card className="border-stroke-secondary">
					<CardContent className="flex flex-col gap-l pt-l">
						<div className="flex flex-col gap-xs">
							<p className="text-m font-semibold text-content-primary">
								Invite via Google
							</p>
							<p className="text-s text-content-tertiary">
								Generate a one-click link that pre-fills their email into Google sign-in.
							</p>
						</div>

						<div className="flex flex-col gap-m">
							<Input
								id="invite-email"
								type="email"
								label="Recipient email"
								placeholder="user@up.edu.ph"
								value={inviteEmail}
								onChange={(e) => {
									setInviteEmail(e.target.value);
									setInviteLink(null);
									setCopied(false);
								}}
								onBlur={() => setInviteEmailTouched(true)}
								leading={<AlternateEmailRoundedIcon fontSize="small" />}
								state={inviteEmailError ? "error" : "default"}
								helpText={inviteEmailError ? "Only @up.edu.ph emails are allowed" : undefined}
							/>

							<div className="flex gap-s">
								<Button
									type="button"
									className="flex-1"
									disabled={!inviteEmail || !inviteEmailValid}
									onClick={handleGenerateInvite}
								>
									<LinkRoundedIcon fontSize="small" />
									Generate link
								</Button>
								<Button
									type="button"
									variant="secondary"
									disabled={!inviteLink}
									onClick={handleCopy}
									className="gap-xs"
								>
									{copied ? (
										<CheckRoundedIcon fontSize="small" className="text-content-positive" />
									) : (
										<ContentCopyRoundedIcon fontSize="small" />
									)}
									{copied ? "Copied" : "Copy"}
								</Button>
							</div>

							{inviteLink && (
								<div className="flex flex-col gap-xs rounded-xl border border-stroke-secondary bg-surface-hover px-m py-s">
									<p className="text-xs font-medium uppercase tracking-widest text-content-secondary">
										Invite link
									</p>
									<p className="break-all text-xs leading-relaxed text-content-tertiary">
										{inviteLink}
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default AddUserForm;
