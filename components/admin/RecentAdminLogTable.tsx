import { Badge } from "@/components/ui/Badge";
import type { AdminLogEntry } from "@/services/admin.service";

interface RecentAdminLogTableProps {
	logs: AdminLogEntry[];
}

const STATUS_LABELS: Record<NonNullable<AdminLogEntry["status"]>, string> = {
	CREATED_LISTING: "Created",
	UPDATED_LISTING: "Updated",
	DELETED_LISTING: "Deleted",
};

const STATUS_BADGE_CLASS: Record<
	NonNullable<AdminLogEntry["status"]>,
	string
> = {
	CREATED_LISTING: "bg-emerald-100 text-emerald-700 border-emerald-200",
	UPDATED_LISTING: "bg-sky-100 text-sky-700 border-sky-200",
	DELETED_LISTING: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function RecentAdminLogTable({
	logs,
}: RecentAdminLogTableProps) {
	if (logs.length === 0) {
		return (
			<p className="py-4 text-sm text-content-secondary">
				No recent updates yet.
			</p>
		);
	}

	return (
		<div className="space-y-3">
			{logs.map((log, i) => {
				const statusLabel = log.status ? STATUS_LABELS[log.status] : "Update";
				const badgeClass = log.status
					? STATUS_BADGE_CLASS[log.status]
					: "bg-slate-100 text-slate-700 border-slate-200";
				const adminLabel =
					log.Admin?.username ||
					log.Admin?.email ||
					`Admin #${log.admin_id}`;
				const listingLabel =
					log.listing_name ??
					log.Listing?.listing_name ??
					(log.listing_id ? `Listing #${log.listing_id}` : "Listing");

				return (
					<div
						key={log.log_id}
						className="flex flex-col gap-2 rounded-xl border border-stroke-secondary bg-surface-secondary p-3 admin-row-enter"
						style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
					>
						<div className="flex items-center justify-between gap-2">
							<span className="text-sm font-semibold text-content-primary line-clamp-1">
								{listingLabel}
							</span>
							<Badge className={cn(badgeClass, "shrink-0")}>{statusLabel}</Badge>
						</div>
						<p className="text-xs text-content-tertiary">
							By {adminLabel} · Log #{log.log_id}
						</p>
					</div>
				);
			})}
		</div>
	);
}

function cn(...classes: (string | undefined | false)[]) {
	return classes.filter(Boolean).join(" ");
}
