"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { getAdminUsersAction, deleteAdminUserAction } from "@/app/admin/actions";
import type { AdminUser } from "@/types";

export function AdminUserList({ currentUserEmail }: { currentUserEmail: string }) {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [confirmTarget, setConfirmTarget] = useState<AdminUser | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getAdminUsersAction().then((result) => {
			if (result.data) setUsers(result.data);
			setIsLoading(false);
		});
	}, []);

	const handleDelete = async () => {
		if (!confirmTarget) return;
		setIsDeleting(true);
		setError(null);
		const result = await deleteAdminUserAction(confirmTarget.email);
		if (result.error) {
			setError(result.error);
		} else {
			setUsers((prev) => prev.filter((u) => u.email !== confirmTarget.email));
			setConfirmTarget(null);
		}
		setIsDeleting(false);
	};

	return (
		<div className="flex flex-col gap-m">
			<div className="flex flex-col gap-xs">
				<p className="text-m font-semibold text-content-primary">Admin users</p>
				<p className="text-s text-content-tertiary">
					Manage who has access to the admin dashboard.
				</p>
			</div>

			<div className="overflow-hidden rounded-xl border border-stroke-secondary">
				{isLoading ? (
					<div className="divide-y divide-stroke-tertiary">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex items-center gap-m px-m py-s">
								<div className="h-9 w-9 animate-pulse rounded-full bg-stroke-secondary" />
								<div className="flex flex-1 flex-col gap-xs">
									<div className="h-3 w-24 animate-pulse rounded bg-stroke-secondary" />
									<div className="h-3 w-40 animate-pulse rounded bg-stroke-secondary" />
								</div>
							</div>
						))}
					</div>
				) : users.length === 0 ? (
					<div className="px-m py-l text-center text-s text-content-tertiary">
						No admin users found.
					</div>
				) : (
					<div className="divide-y divide-stroke-tertiary">
						{users.map((user) => {
							const isSelf = user.email === currentUserEmail;
							const isConfirming = confirmTarget?.admin_id === user.admin_id;
							const initials = user.username.slice(0, 2).toUpperCase();

							return (
								<div key={user.admin_id}>
									{/* User row */}
									<div className="flex items-center gap-m px-m py-s">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-brand text-xs font-semibold text-content-inverse-primary">
											{initials}
										</div>

										<div className="flex min-w-0 flex-1 flex-col">
											<div className="flex items-center gap-xs">
												<span className="truncate text-s font-medium text-content-primary">
													{user.username}
												</span>
												{isSelf && (
													<Badge className="border-none bg-surface-info-subtle text-xs text-content-link">
														You
													</Badge>
												)}
											</div>
											<span className="truncate text-xs text-content-tertiary">
												{user.email}
											</span>
										</div>

										{!isSelf && (
											<Button
												variant="secondary"
												size="icon"
												className="shrink-0 border-stroke-negative text-content-negative hover:bg-surface-negative-subtle"
												onClick={() => {
													setConfirmTarget(isConfirming ? null : user);
													setError(null);
												}}
											>
												<DeleteRoundedIcon fontSize="small" />
											</Button>
										)}
									</div>

									{/* Inline confirmation */}
									{isConfirming && (
										<div className="flex flex-wrap items-center justify-between gap-m border-t border-stroke-negative bg-surface-negative-subtle px-m py-s">
											<div className="flex items-center gap-s text-s text-content-negative">
												<WarningAmberRoundedIcon fontSize="small" className="shrink-0" />
												<span>
													Remove <strong>{user.username}</strong>? This will permanently delete their account.
												</span>
											</div>
											<div className="flex shrink-0 gap-s">
												<Button
													size="sm"
													variant="secondary"
													onClick={() => setConfirmTarget(null)}
													disabled={isDeleting}
												>
													Cancel
												</Button>
												<Button
													size="sm"
													onClick={handleDelete}
													disabled={isDeleting}
													className="bg-content-negative hover:bg-content-negative-bold text-white"
												>
													{isDeleting ? "Removing…" : "Remove"}
												</Button>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>

			{error && <p className="text-s text-content-negative">{error}</p>}
		</div>
	);
}
