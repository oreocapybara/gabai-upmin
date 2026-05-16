"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Search from "@mui/icons-material/SearchRounded";
import Plus from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";

import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import RecentAdminLogTable from "@/components/admin/RecentAdminLogTable";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Navbar from "@/components/ui/Navbar";
import { cn, formatCategoryName, formatPriceRange, isListingOpen } from "@/lib/utils";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import type { AdminListing, AdminLogEntry } from "@/services/admin.service";
import { getRecentAdminLogsAction } from "@/app/admin/actions";
import Image from "next/image";
import DropdownMenu from "@/components/ui/DropdownMenu";

interface AdminDashboardClientProps {
	initialListings: AdminListing[];
	categories: { category_id: number; category_name: string }[];
	recentLogs: AdminLogEntry[];
}

export default function AdminDashboardClient({
	initialListings,
	categories,
	recentLogs,
}: AdminDashboardClientProps) {
	const [logs, setLogs] = useState(recentLogs);
	const [activeTab, setActiveTab] = useState<"listings" | "activity">(
		"listings",
	);

	useEffect(() => {
		setLogs(recentLogs);
	}, [recentLogs]);

	const refreshLogs = async () => {
		const result = await getRecentAdminLogsAction();
		if (result?.data) setLogs(result.data as unknown as AdminLogEntry[]);
	};

	const {
		deleteTarget,
		setDeleteTarget,
		isDeleting,
		searchTerm,
		setSearchTerm,
		setSelectedCategory,
		filteredListings,
		handleDelete,
	} = useAdminDashboard(initialListings, refreshLogs);

	return (
		<div className="h-screen overflow-hidden bg-surface-primary">
			<Navbar />

{/* Full-height column below the fixed navbar */}
			<div className="flex h-full flex-col pt-16">
				<main className="mx-auto flex w-full max-w-5xl flex-1 min-h-0 flex-col px-4">
					{/* ── Static header ── */}
					<header
						className="flex flex-none flex-col gap-3 pt-8 pb-4 sm:flex-row sm:items-end sm:justify-between"
						style={{ animation: "adminRowIn 0.3s ease-out both" }}
					>
						<div>
							<h1 className="text-2xl font-semibold text-content-primary font-display">
								Dashboard
							</h1>
							<p className="mt-1 text-sm text-content-secondary">
								Manage listings and keep campus info up to date.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Link
								href="/admin/manage/add-user"
								className={cn(
									buttonVariants({ variant: "secondary", size: "sm" }),
									"w-auto decoration-transparent",
								)}
							>
								<PersonAddRoundedIcon fontSize="small" />
								Add user
							</Link>
							<Link
								href="/admin/manage"
								className={cn(
									buttonVariants({ variant: "secondary", size: "sm" }),
									"w-auto decoration-transparent",
								)}
							>
								<Plus />
								Create listing
							</Link>
						</div>
					</header>

					{/* ── Search + filter — hidden on mobile when activity tab is active ── */}
					<section
						className={cn(
							"flex-none flex-col gap-3 pb-4 sm:flex-row relative z-10",
							activeTab === "activity" ? "hidden lg:flex" : "flex",
						)}
						style={{ animation: "adminRowIn 0.3s ease-out both", animationDelay: "60ms" }}
					>
						<Input
							placeholder="Search listings"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							leading={<Search />}
							className="text-sm"
						/>
						<DropdownMenu
							categories={categories}
							onCategoryChange={(categoryId) => {
								if (!categoryId) return setSelectedCategory("all");
								const match = categories.find(
									(c) => String(c.category_id) === categoryId,
								);
								setSelectedCategory(match?.category_name ?? "all");
							}}
						/>
					</section>

					{/* ── Mobile tabs — hidden on desktop ── */}
					<div className="flex flex-none border-b border-stroke-secondary lg:hidden">
						{(["listings", "activity"] as const).map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={cn(
									"flex-1 py-2.5 text-sm font-medium capitalize",
									"transition-colors duration-200",
									activeTab === tab
										? "-mb-px border-b-2 border-content-primary text-content-primary"
										: "text-content-tertiary hover:text-content-secondary",
								)}
							>
								{tab === "listings"
									? `Listings (${filteredListings.length})`
									: "Activity"}
							</button>
						))}
					</div>

					{/* ── Scrollable content zone ── */}
					<section
						key={activeTab}
						className="flex flex-1 min-h-0 gap-6 overflow-hidden pt-4 pb-4 flex-col lg:flex-row"
						style={{ animation: "adminRowIn 0.22s ease-out both" }}
					>
						{/* Listings column */}
						<div
							className={cn(
								"min-h-0 flex-col flex-1",
								activeTab === "listings" ? "flex" : "hidden lg:flex",
							)}
						>

							{/* Scrollable list */}
							<div className="flex-1 min-h-0 overflow-y-auto rounded-xl">
								{filteredListings.length === 0 ? (
									<Card className="p-8 text-center">
										<p className="text-sm text-content-secondary">
											No listings match your filters yet.
										</p>
										<Link
											href="/admin/manage"
											className={cn(
												buttonVariants({ variant: "link", size: "sm" }),
												"mt-2 w-auto",
											)}
										>
											Add your first listing
										</Link>
									</Card>
								) : (
									<div className="flex flex-col gap-3">
										{filteredListings.map((listing, i) => {
											const open = isListingOpen(
												listing.opening_hours,
												listing.closing_hours,
											);
											const isTargeted = deleteTarget?.id === listing.listing_id;
											return (
												<div
													key={listing.listing_id}
													className={cn(
														"border-b border-stroke-secondary overflow-hidden",
														"transition-all duration-200",
														isTargeted
															? "bg-surface-negative-subtle opacity-60 scale-[0.99]"
															: "bg-surface-secondary hover:bg-surface-hover",
													)}
													style={{
														animation: "adminRowIn 0.28s ease-out both",
														animationDelay: `${Math.min(i * 35, 280)}ms`,
													}}
												>
													<div className="flex items-center p-2">
														<div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-surface-primary">
															<Image
																src={listing.image_url ?? "/logo.svg"}
																alt={listing.listing_name}
																fill
																sizes="112px"
																priority={i === 0}
																className={cn(
																	listing.image_url
																		? "object-cover"
																		: "object-contain p-2",
																)}
																onError={(e) => {
																	(e.target as HTMLImageElement).src =
																		"/logo.svg";
																}}
															/>
														</div>

														<div className="flex flex-col flex-auto gap-3 px-2">
															<div className="flex flex-col items-start gap-1">
																<h6 className="font-display font-semibold text-content-primary line-clamp-2">
																	{listing.listing_name}
																</h6>
																<div className="flex items-center gap-2 text-content-secondary text-s">
																	<span>
																		{listing.Category?.category_name
																			? formatCategoryName(
																					listing.Category.category_name,
																				)
																			: "Uncategorized"}
																	</span>
																	<span className="text-content-tertiary">
																		·
																	</span>
																	<span
																		className={cn(
																			"px-2 py-0.5 rounded-full text-xs font-semibold",
																			open
																				? "bg-surface-positive text-content-inverse-primary"
																				: "bg-content-negative text-content-inverse-primary",
																		)}
																	>
																		{open ? "Open" : "Closed"}
																	</span>
																</div>
																{formatPriceRange(listing.price_min, listing.price_max) && (
																	<span className="text-xs font-medium text-content-secondary">
																		{formatPriceRange(listing.price_min, listing.price_max)}
																	</span>
																)}
															</div>

															<div className="flex self-stretch gap-2">
																<Button
																	onClick={() =>
																		setDeleteTarget({
																			id: listing.listing_id,
																			name: listing.listing_name,
																		})
																	}
																	variant="secondary"
																	size="sm"
																												>
																	Delete
																</Button>

																<Link
																	href={`/admin/manage?listing_id=${listing.listing_id}`}
																	className={cn(
																		buttonVariants({
																			variant: "default",
																			size: "sm",
																		}),
																		"flex-1 decoration-transparent",
																	)}
																>
																	<EditRoundedIcon fontSize="small" />
																	Edit
																</Link>
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>

						{/* Activity column */}
						<div
							className={cn(
								"min-h-0 flex-col lg:w-80 lg:flex-none",
								activeTab === "activity" ? "flex flex-1" : "hidden lg:flex",
							)}
						>
							{/* Column header — static, never scrolls */}
							<div className="pb-3 flex-none">
								<p className="text-xs uppercase tracking-[0.2em] text-content-tertiary">
									Recent updates
								</p>
								<h2 className="text-base font-semibold text-content-primary">
									Admin activity
								</h2>
							</div>

							{/* Scrollable log entries */}
							<div className="flex-1 min-h-0 overflow-y-auto">
								<RecentAdminLogTable logs={logs} />
							</div>
						</div>
					</section>
				</main>
			</div>

			<DeleteConfirmModal
				isOpen={!!deleteTarget}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleDelete}
				listingName={deleteTarget?.name || ""}
				isLoading={isDeleting}
			/>
		</div>
	);
}
