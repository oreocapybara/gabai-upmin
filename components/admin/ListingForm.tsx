"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocationPicker } from "@/components/admin/LocationPicker";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { showToast } from "@/components/ui/CustomToast";
import { cn, formatCategoryName } from "@/lib/utils";

import { createListingAction, updateListingAction, deleteFeedbackAction } from "@/app/admin/actions";
import { useListingImageUpload } from "@/hooks/admin/useListingImageUpload";
import { feedbackService, type Feedback } from "@/services/feedback.service";

import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
	category_id: number;
	category_name: string;
}

interface ListingFormProps {
	categories: Category[];
	initialData: any | null;
	isEditing: boolean;
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
	return (
		<svg
			className="animate-spin h-4 w-4 shrink-0"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<path d="M21 12a9 9 0 11-6.219-8.56" />
		</svg>
	);
}

// ─── CategorySelect ───────────────────────────────────────────────────────────
// Custom dropdown matching the Input floating-label style with a fully styled panel.

function CategorySelect({
	value,
	onSelect,
	categories,
}: {
	value: string | number;
	onSelect: (categoryId: number) => void;
	categories: Category[];
}) {
	const [open, setOpen] = React.useState(false);
	const ref = React.useRef<HTMLDivElement>(null);

	const selected = categories.find((c) => String(c.category_id) === String(value));

	React.useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div ref={ref} className="relative w-full min-w-0">
			{/* Trigger — matches Input's floating-label border style */}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={cn(
					"flex w-full items-center gap-2 rounded-lg border px-4 py-3 text-left transition-all duration-200 ease-out",
					open
						? "border-stroke-primary ring-1 ring-stroke-primary"
						: "border-stroke-secondary hover:border-stroke-primary/60",
				)}
			>
				<span className="absolute -top-2 left-3.5 bg-surface-primary px-1 text-xs text-content-secondary">
					Category*
				</span>
				<span className="flex h-6 w-6 shrink-0 items-center justify-center text-content-tertiary">
					<CategoryRoundedIcon fontSize="small" />
				</span>
				<span className={cn("flex-1 min-w-0 truncate text-m", selected ? "text-content-primary" : "text-content-tertiary")}>
					{selected ? formatCategoryName(selected.category_name) : "Pick a category"}
				</span>
				<span className="flex h-6 w-6 shrink-0 items-center justify-center text-content-tertiary">
					<ExpandMoreRoundedIcon
						fontSize="small"
						className={cn("transition-transform duration-200", open && "rotate-180")}
					/>
				</span>
			</button>

			{/* Dropdown panel */}
			<div
				className={cn(
					"absolute left-0 top-full z-50 mt-1.5 w-full origin-top rounded-xl border border-stroke-secondary bg-surface-primary py-1.5 shadow-lg",
					"transition-all duration-200 ease-out",
					open
						? "scale-100 opacity-100"
						: "pointer-events-none scale-95 opacity-0",
				)}
			>
				{categories.map((cat) => {
					const isSelected = String(cat.category_id) === String(value);
					return (
						<button
							key={cat.category_id}
							type="button"
							onClick={() => {
								onSelect(cat.category_id);
								setOpen(false);
							}}
							className={cn(
								"mx-1.5 flex w-[calc(100%-12px)] items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors duration-100",
								isSelected
									? "bg-surface-selected text-content-brand"
									: "text-content-secondary hover:bg-surface-hover hover:text-content-primary",
							)}
						>
							<span className="flex-1 text-m font-medium">
								{formatCategoryName(cat.category_name)}
							</span>
							{isSelected && (
								<CheckRoundedIcon fontSize="small" className="shrink-0 text-content-brand" />
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="px-1 text-xs font-medium uppercase tracking-[0.15em] text-content-tertiary">
			{children}
		</p>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListingForm({
	categories,
	initialData,
	isEditing,
}: ListingFormProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [imageRemoved, setImageRemoved] = useState(false);
	const [locationKey, setLocationKey] = useState(0);

	const [formData, setFormData] = useState({
		listing_name: initialData?.listing_name ?? "",
		category_id: initialData?.category_id ?? categories[0]?.category_id ?? "",
		coord_latitude: initialData?.coord_latitude ?? "",
		coord_longitude: initialData?.coord_longitude ?? "",
		image_url: initialData?.image_url ?? "",
		image_path: initialData?.image_path ?? "",
		opening_hours: initialData?.opening_hours ?? "",
		closing_hours: initialData?.closing_hours ?? "",
		price_min: initialData?.price_min ?? "",
		price_max: initialData?.price_max ?? "",
		description: initialData?.description ?? "",
	});

	const {
		imagePreview,
		pendingFile,
		imageUploading,
		uploadError,
		handleImageUpload,
		uploadPendingFile,
		removeImage,
		setUploadError,
	} = useListingImageUpload(initialData?.image_url, initialData?.image_path);

	const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
	const [feedbacksLoading, setFeedbacksLoading] = useState(false);
	const [deletingFeedbackId, setDeletingFeedbackId] = useState<number | null>(null);

	useEffect(() => {
		if (!isEditing || !initialData?.listing_id) return;
		setFeedbacksLoading(true);
		feedbackService.getFeedbacksForListing(initialData.listing_id)
			.then(setFeedbacks)
			.catch(() => {})
			.finally(() => setFeedbacksLoading(false));
	}, [isEditing, initialData?.listing_id]);

	const handleDeleteFeedback = async (feedbackId: number) => {
		setDeletingFeedbackId(feedbackId);
		const result = await deleteFeedbackAction(feedbackId);
		if (result?.error) {
			showToast.error("Failed to delete review", result.error);
		} else {
			setFeedbacks((prev) => prev.filter((f) => f.feedback_id !== feedbackId));
			showToast.success("Review deleted", "The review has been removed.");
		}
		setDeletingFeedbackId(null);
	};

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleRemoveImage = () => {
		removeImage();
		setFormData((prev) => ({ ...prev, image_url: "", image_path: "" }));
		setImageRemoved(true);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.coord_latitude || !formData.coord_longitude) {
			setError("Please tap the map to place a pin and set the listing location.");
			return;
		}
		setIsLoading(true);
		setError(null);
		setUploadError(null);

		try {
			let finalImageUrl = formData.image_url;
			let finalImagePath = formData.image_path;

			if (pendingFile) {
				const uploaded = await uploadPendingFile();
				if (!uploaded) { setIsLoading(false); return; }
				finalImageUrl = uploaded.url;
				finalImagePath = uploaded.path;
			}

			const payload = new FormData();
			Object.entries(formData).forEach(([k, v]) => payload.set(k, String(v ?? "")));
			payload.set("image_url", finalImageUrl);
			payload.set("image_path", finalImagePath);
			payload.set("image_removed", imageRemoved ? "true" : "false");

			const result =
				isEditing && initialData?.listing_id
					? await updateListingAction(initialData.listing_id, payload)
					: await createListingAction(payload);

			if (result?.error) throw new Error(result.error);

			if (isEditing) {
				showToast.success("Listing updated", "Your changes have been saved.");
			} else {
				showToast.success("Listing created", "It's now live on the map.");
			}

			// Clear the form so cached state never shows stale data on back-navigation
			setFormData({
				listing_name: "",
				category_id: categories[0]?.category_id ?? "",
				coord_latitude: "",
				coord_longitude: "",
				image_url: "",
				image_path: "",
				opening_hours: "",
				closing_hours: "",
				price_min: "",
				price_max: "",
				description: "",
			});
			setLocationKey((k) => k + 1);
			handleRemoveImage();

			router.push("/admin");
			router.refresh();
		} catch (err: any) {
			setError(err.message ?? "Failed to save listing");
		} finally {
			setIsLoading(false);
		}
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="mx-auto max-w-xl px-4 pt-6 pb-32">
			{/* Page header */}
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-content-primary font-display">
					{isEditing ? "Edit Listing" : "Create Listing"}
				</h1>
				<p className="mt-1 text-sm text-content-secondary">
					{isEditing
						? "Update the details below and save your changes."
						: "Add accessible places and services for users."}
				</p>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-5">

				{/* ── 1. Image — top, square ── */}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp,image/gif"
					onChange={(e) => {
						handleImageUpload(e);
						setImageRemoved(false);
					}}
					className="hidden"
				/>

				<div className="flex flex-col gap-1">
					<SectionLabel>Listing image</SectionLabel>

					{!imagePreview ? (
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="group relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-dashed border-stroke-secondary bg-surface-secondary/30 transition-all hover:border-stroke-primary hover:bg-surface-hover"
						>
							<div className="flex h-full flex-col items-center justify-center gap-3">
								<div className="flex h-14 w-14 items-center justify-center rounded-full border border-stroke-secondary bg-surface-primary text-content-tertiary transition-colors group-hover:border-stroke-primary group-hover:text-content-secondary">
									<CloudUploadRoundedIcon />
								</div>
								<div className="text-center">
									<p className="text-sm font-semibold text-content-secondary">
										Upload listing image
									</p>
									<p className="mt-0.5 text-xs text-content-tertiary">
										JPEG, PNG, WebP · Max 5 MB
									</p>
								</div>
							</div>
						</button>
					) : (
						<div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-stroke-secondary bg-surface-secondary">
							{pendingFile && !imageUploading && (
								<div className="absolute left-2 top-2 z-10 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
									Not saved yet
								</div>
							)}
							{imageUploading && (
								<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-surface-primary/80 backdrop-blur-sm">
									<Spinner />
									<p className="text-sm text-content-secondary">Uploading…</p>
								</div>
							)}
							<img
								src={imagePreview}
								alt="Preview"
								className="h-full w-full object-cover"
							/>
							{/* Overlay controls */}
							<div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10">
								<Button
									type="button"
									variant="secondary"
									size="sm"
									className="flex-1"
									onClick={() => fileInputRef.current?.click()}
									leadingIcon={<SwapHorizRoundedIcon fontSize="small" />}
								>
									Replace
								</Button>
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={handleRemoveImage}
									leadingIcon={<CloseRoundedIcon fontSize="small" />}
								>
									Remove
								</Button>
							</div>
						</div>
					)}

					{uploadError && (
						<p className="ml-1 mt-1 text-xs text-content-negative">{uploadError}</p>
					)}
				</div>

				{/* ── 2. Basic information ── */}
				<div className="flex flex-col gap-1">
					<SectionLabel>Basic information</SectionLabel>
					<Card className="border-stroke-secondary bg-surface-secondary shadow-none">
						<CardContent className="flex flex-col gap-4 pt-4">
							<CategorySelect
								value={formData.category_id}
								onSelect={(id) =>
									setFormData((prev) => ({ ...prev, category_id: id }))
								}
								categories={categories}
							/>
							<Input
								label="Name*"
								name="listing_name"
								required
								value={formData.listing_name}
								onChange={handleChange}
								placeholder="e.g. CHSS Building"
								leading={<StorefrontRoundedIcon fontSize="small" />}
							/>
							<Input
								label="Description*"
								name="description"
								multiline
								rows={4}
								required
								value={formData.description}
								onChange={handleChange}
								placeholder="Describe the place, services, and accessibility features…"
								leading={<NotesRoundedIcon fontSize="small" />}
							/>
						</CardContent>
					</Card>
				</div>

				{/* ── 3. Location ── */}
				<div className="flex flex-col gap-1">
					<SectionLabel>Location</SectionLabel>
					<LocationPicker
						key={locationKey}
						value={{
							lat: formData.coord_latitude,
							lng: formData.coord_longitude,
						}}
						onChange={({ lat, lng }) =>
							setFormData((prev) => ({
								...prev,
								coord_latitude: lat,
								coord_longitude: lng,
							}))
						}
					/>
				</div>

				{/* ── 4. Hours & price ── */}
				<div className="flex flex-col gap-1">
					<SectionLabel>Operating hours &amp; price</SectionLabel>
					<Card className="border-stroke-secondary bg-surface-secondary shadow-none">
						<CardContent className="flex flex-col gap-4 pt-4">
							<div className="flex flex-col gap-3 sm:flex-row">
								<Input
									label="Opens"
									type="time"
									name="opening_hours"
									value={formData.opening_hours}
									onChange={handleChange}
									leading={<AccessTimeRoundedIcon fontSize="small" />}
									wrapperClassName="sm:min-w-0"
								/>
								<Input
									label="Closes"
									type="time"
									name="closing_hours"
									value={formData.closing_hours}
									onChange={handleChange}
									leading={<AccessTimeRoundedIcon fontSize="small" />}
									wrapperClassName="sm:min-w-0"
								/>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row">
								<Input
									label="Min price"
									name="price_min"
									type="number"
									min="0"
									step="10"
									value={formData.price_min}
									onChange={handleChange}
									placeholder="10"
									leading={
										<span className="text-sm font-semibold text-content-tertiary leading-none">
											₱
										</span>
									}
									wrapperClassName="sm:min-w-0"
								/>
								<Input
									label="Max price"
									name="price_max"
									type="number"
									min="0"
									step="10"
									value={formData.price_max}
									onChange={handleChange}
									placeholder="20"
									leading={
										<span className="text-sm font-semibold text-content-tertiary leading-none">
											₱
										</span>
									}
									wrapperClassName="sm:min-w-0"
								/>
							</div>
							<p className="text-xs text-content-tertiary -mt-2 ml-1">
								Leave max empty for a single price, both empty if free or unknown.
							</p>
						</CardContent>
					</Card>
				</div>

				{/* ── 5. Reviews (edit only) ── */}
				{isEditing && (
					<div className="flex flex-col gap-1">
						<SectionLabel>Reviews ({feedbacks.length})</SectionLabel>
						<Card className="border-stroke-secondary bg-surface-secondary shadow-none">
							<CardContent className="flex flex-col gap-2 pt-4">
								{feedbacksLoading ? (
									<p className="py-2 text-sm text-content-tertiary">Loading reviews…</p>
								) : feedbacks.length === 0 ? (
									<p className="py-2 text-sm text-content-tertiary">No reviews yet.</p>
								) : (
									feedbacks.map((feedback) => (
										<div
											key={feedback.feedback_id}
											className="flex items-start gap-2 rounded-lg bg-surface-primary p-3"
										>
											<div className="flex-1 min-w-0">
												<div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
													<span className="text-sm font-medium text-content-primary">
														{feedback.nickname ?? "Anonymous"}
													</span>
													<span className="text-xs text-yellow-500 tracking-tight">
														{"★".repeat(feedback.rating)}{"☆".repeat(5 - feedback.rating)}
													</span>
													<span className="text-xs text-content-tertiary">
														{new Date(feedback.feedback_date).toLocaleDateString()}
													</span>
												</div>
												{feedback.feedback_message && (
													<p className="mt-1 line-clamp-3 text-sm text-content-secondary">
														{feedback.feedback_message}
													</p>
												)}
											</div>
											<button
												type="button"
												onClick={() => handleDeleteFeedback(feedback.feedback_id)}
												disabled={deletingFeedbackId === feedback.feedback_id}
												className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-content-tertiary transition-colors hover:bg-surface-negative-subtle hover:text-content-negative disabled:opacity-40"
												aria-label="Delete review"
											>
												{deletingFeedbackId === feedback.feedback_id
													? <Spinner />
													: <DeleteOutlineRoundedIcon fontSize="small" />}
											</button>
										</div>
									))
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{/* ── Error banner ── */}
				{error && (
					<div className="rounded-xl border border-stroke-negative bg-surface-primary px-4 py-3">
						<p className="text-sm text-content-negative">{error}</p>
					</div>
				)}

				{/* ── Sticky action bar ── */}
				<div className="fixed inset-x-0 bottom-0 border-t border-stroke-secondary bg-surface-primary/95 backdrop-blur supports-[backdrop-filter]:bg-surface-primary/80">
					<div className="mx-auto flex max-w-xl gap-3 p-4">
						<Button
							type="button"
							variant="secondary"
							onClick={() => router.back()}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading || imageUploading}
							leadingIcon={
								isLoading ? <Spinner /> : isEditing ? <SaveRoundedIcon fontSize="small" /> : <AddRoundedIcon fontSize="small" />
							}
						>
							{isLoading
								? isEditing ? "Saving…" : "Creating…"
								: isEditing ? "Save changes" : "Create listing"}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
