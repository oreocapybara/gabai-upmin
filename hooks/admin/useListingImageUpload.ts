import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STORAGE_BUCKET =
	process.env.NEXT_PUBLIC_LISTING_BUCKET ?? "listing-images";
const STORAGE_FOLDER = "listings";

export function useListingImageUpload(
	initialUrl: string | null | undefined,
	initialPath?: string | null,
) {
	const [imagePreview, setImagePreview] = useState<string | null>(
		initialUrl ?? null,
	);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [imageUploading, setImageUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const blobUrlRef = useRef<string | null>(null);

	useEffect(() => {
		setImagePreview(initialUrl ?? null);
	}, [initialUrl, initialPath]);

	// Validate + show local preview only — no network call yet
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		if (!validTypes.includes(file.type)) {
			setUploadError("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF.");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			setUploadError("Image must be smaller than 5MB.");
			return;
		}

		// Revoke any previous blob URL to avoid memory leaks
		if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
		const blobUrl = URL.createObjectURL(file);
		blobUrlRef.current = blobUrl;

		setImagePreview(blobUrl);
		setPendingFile(file);
		setUploadError(null);
	};

	// Called from the form's submit handler — performs the actual upload
	const uploadPendingFile = async (): Promise<{ url: string; path: string } | null> => {
		if (!pendingFile) return null;

		setImageUploading(true);
		setUploadError(null);

		try {
			const supabase = createClient();
			const ext = pendingFile.name.split(".").pop();
			const fileName = `${STORAGE_FOLDER}/${Date.now()}-${Math.random()
				.toString(36)
				.slice(2)}.${ext}`;

			const { data, error } = await supabase.storage
				.from(STORAGE_BUCKET)
				.upload(fileName, pendingFile, {
					cacheControl: "3600",
					upsert: false,
					contentType: pendingFile.type,
				});

			if (error) throw error;

			const { data: pub } = supabase.storage
				.from(STORAGE_BUCKET)
				.getPublicUrl(data.path);

			if (blobUrlRef.current) {
				URL.revokeObjectURL(blobUrlRef.current);
				blobUrlRef.current = null;
			}

			setImagePreview(pub.publicUrl);
			setPendingFile(null);

			return { url: pub.publicUrl, path: data.path };
		} catch (err: any) {
			setUploadError(err.message || "Failed to upload image.");
			return null;
		} finally {
			setImageUploading(false);
		}
	};

	// Pure UI reset — no storage call. Server action handles old-image cleanup on submit.
	const removeImage = () => {
		if (blobUrlRef.current) {
			URL.revokeObjectURL(blobUrlRef.current);
			blobUrlRef.current = null;
		}
		setImagePreview(null);
		setPendingFile(null);
		setUploadError(null);
	};

	return {
		imagePreview,
		pendingFile,
		imageUploading,
		uploadError,
		handleImageUpload,
		uploadPendingFile,
		removeImage,
		setUploadError,
	};
}
