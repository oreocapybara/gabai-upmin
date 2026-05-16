"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

function InviteStartContent() {
	const params = useSearchParams();
	const provider = params.get("provider") || "google";
	const email = params.get("email") || undefined;
	const redirect_to = params.get("redirect_to") || undefined;
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const doOAuth = async () => {
			try {
				const supabase = createClient();
				await supabase.auth.signInWithOAuth({
					provider: provider as any,
					options: {
						redirectTo: redirect_to || undefined,
						queryParams: email ? { login_hint: email } : undefined,
					},
				});
				setLoading(false);
			} catch (err) {
				setError(err instanceof Error ? err.message : String(err));
			}
		};

		doOAuth();
	}, [provider, email, redirect_to]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-surface-primary p-6">
			<div className="w-full max-w-md">
				<div className="rounded-lg border border-stroke bg-surface-primary p-6 text-center shadow">
					<div className="mb-4">
						<h2 className="text-lg font-semibold">Continue with {provider}</h2>
						<p className="text-sm text-content-secondary">
							We will open a Google sign-in window. Please complete the flow to
							accept the invite.
						</p>
					</div>

					<div className="mb-4">
						{loading ? (
							<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
						) : null}
					</div>

					{email && (
						<div className="mb-2 text-sm">
							Suggested email: <span className="font-medium">{email}</span>
						</div>
					)}

					{error && <p className="text-sm text-red-500">{error}</p>}

					<div className="mt-4">
						<a href="/" className="text-sm underline">
							Cancel
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function InviteStartPage() {
	return (
		<Suspense>
			<InviteStartContent />
		</Suspense>
	);
}
