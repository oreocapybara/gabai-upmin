"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { User } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rateLimit";
import type { AdminUser } from "@/types";
import type { AdminLogEntry } from "@/services/admin.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getIp(): Promise<string> {
	const h = await headers();
	return (
		h.get("x-forwarded-for")?.split(",")[0].trim() ??
		h.get("x-real-ip") ??
		"unknown"
	);
}

async function requireAdmin(): Promise<{
	supabase: Awaited<ReturnType<typeof createClient>>;
	user: User;
}> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const isAdmin =
		user?.app_metadata?.role === "admin" ||
		user?.user_metadata?.role === "admin";

	if (!user) throw new Error("Unauthorized");
	if (isAdmin) return { supabase, user };

	if (user.email) {
		const { data, error } = await supabase.rpc("is_admin_email", {
			p_email: user.email,
		});
		if (!error && data) return { supabase, user };
	}

	throw new Error("Unauthorized");
}

async function tryInsertAdminLog(
	_supabase: Awaited<ReturnType<typeof createClient>>,
	email: string | null | undefined,
	listingId: number,
	status: "CREATED_LISTING" | "UPDATED_LISTING" | "DELETED_LISTING",
	listingName?: string | null,
): Promise<void> {
	if (!email) return;
	try {
		// Use service-role client so RLS never blocks the Admin lookup or log insert
		const adminClient = createServiceClient();

		const { data, error: lookupError } = await adminClient
			.from("Admin")
			.select("admin_id")
			.ilike("email", email)
			.single();

		if (lookupError || !data) {
			console.error("Admin_Log insert failed: Admin record not found for", email);
			return;
		}

		const { error } = await adminClient.from("Admin_Log").insert({
			admin_id: data.admin_id,
			listing_id: listingId,
			status,
			listing_name: listingName ?? null,
		});
		if (error) console.error("Admin_Log insert failed:", error);
	} catch (err) {
		console.error("Admin_Log insert failed:", err);
	}
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function getAdminUsersAction(): Promise<{
	data?: AdminUser[];
	error?: string;
}> {
	try {
		await requireAdmin();
		const adminClient = createServiceClient();
		const { data, error } = await adminClient
			.from("Admin")
			.select("admin_id, email, username")
			.order("admin_id", { ascending: true });
		if (error) return { error: error.message };
		return { data: data ?? [] };
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Unknown error" };
	}
}

export async function deleteAdminUserAction(
	email: string,
): Promise<{ error?: string }> {
	try {
		const { user } = await requireAdmin();
		if (user.email === email) return { error: "You cannot delete your own account." };

		const adminClient = createServiceClient();

		// Find the auth user by email and delete them
		const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
		if (!listError) {
			const authUser = users.find((u: User) => u.email === email);
			if (authUser) {
				const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(authUser.id);
				if (deleteAuthError) return { error: deleteAuthError.message };
			}
		}

		// Delete from Admin table
		const { error: deleteError } = await adminClient
			.from("Admin")
			.delete()
			.eq("email", email);
		if (deleteError) return { error: deleteError.message };

		return {};
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Unknown error" };
	}
}

export async function createAdminUserAction(
	email: string,
	password: string,
	username: string,
): Promise<{ error?: string }> {
	try {
		await requireAdmin();

		// auth.admin.createUser bypasses the "Disable signups" project setting.
		// signUp() with the publishable key returns 403 when signups are disabled.
		const adminClient = createServiceClient();
		const { error: signUpError } = await adminClient.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
		});
		if (signUpError) return { error: signUpError.message };

		// Use the same service-role client so RLS doesn't block the upsert
		const { error: upsertError } = await adminClient
			.from("Admin")
			.upsert({ email, username }, { onConflict: "email" });
		if (upsertError) return { error: `Failed to save admin record: ${upsertError.message}` };

		return {};
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Unknown error" };
	}
}

export async function deleteListingAction(listingId: number) {
	try {
		const ip = await getIp();

		// 10 deletes per minute per IP
		const rl = rateLimit(`admin:delete:${ip}`, 10, 60_000);
		if (!rl.success) {
			const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
			return {
				error: `Rate limit exceeded. Try again in ${retryAfterSec}s.`,
				rateLimited: true,
			};
		}

		const { supabase, user } = await requireAdmin();

		const { data: listingRow } = await supabase
			.from("Listing")
			.select("listing_name, image_path")
			.eq("listing_id", listingId)
			.single();

		await tryInsertAdminLog(
			supabase,
			user.email,
			listingId,
			"DELETED_LISTING",
			listingRow?.listing_name ?? null,
		);

		const { error: feedbackError } = await supabase
			.from("Feedback")
			.delete()
			.eq("listing_id", listingId);

		if (feedbackError) return { error: feedbackError.message };

		const { error } = await supabase
			.from("Listing")
			.delete()
			.eq("listing_id", listingId);

		if (error) return { error: error.message };

		if (listingRow?.image_path) {
			const bucket = process.env.NEXT_PUBLIC_LISTING_BUCKET ?? "listing-images";
			const adminClient = createServiceClient();
			const { error: storageErr } = await adminClient.storage
				.from(bucket)
				.remove([listingRow.image_path]);
			if (storageErr)
				console.error("Failed to delete listing image:", storageErr);
		}

		revalidatePath("/admin");
		revalidatePath("/");
		return { success: true };
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Unknown error" };
	}
}

export async function createListingAction(formData: FormData) {
	try {
		const ip = await getIp();

		// 20 creates per hour per IP
		const rl = rateLimit(`admin:create:${ip}`, 20, 60 * 60_000);
		if (!rl.success) {
			const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
			return {
				error: `Rate limit exceeded. Try again in ${retryAfterSec}s.`,
				rateLimited: true,
			};
		}

		const { supabase, user } = await requireAdmin();

		const payload = {
			listing_name: formData.get("listing_name") as string,
			category_id: parseInt(formData.get("category_id") as string),
			coord_latitude: parseFloat(formData.get("coord_latitude") as string),
			coord_longitude: parseFloat(formData.get("coord_longitude") as string),
			image_url: (formData.get("image_url") as string) || null,
			image_path: (formData.get("image_path") as string) || null,
			opening_hours: (formData.get("opening_hours") as string) || null,
			closing_hours: (formData.get("closing_hours") as string) || null,
			price_min: formData.get("price_min")
				? parseFloat(formData.get("price_min") as string)
				: null,
			price_max: formData.get("price_max")
				? parseFloat(formData.get("price_max") as string)
				: null,
			description: (formData.get("description") as string) || null,
		};

		const { data, error } = await supabase
			.from("Listing")
			.insert([payload])
			.select("listing_id")
			.single();

		if (error) return { error: error.message };

		await tryInsertAdminLog(
			supabase,
			user.email,
			data.listing_id,
			"CREATED_LISTING",
			payload.listing_name,
		);

		revalidatePath("/admin");
		revalidatePath("/");
		return { success: true };
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Unknown error" };
	}
}
export async function updateListingAction(
	listingId: number,
	formData: FormData,
) {
	try {
		const ip = await getIp();
		const rl = rateLimit(`admin:update:${ip}`, 30, 60 * 60_000);
		if (!rl.success) {
			const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
			return {
				error: `Rate limit exceeded. Try again in ${retryAfterSec}s.`,
				rateLimited: true,
			};
		}

		const { supabase, user } = await requireAdmin();

		// 1. Read the existing image_path BEFORE we overwrite the row
		const { data: existing } = await supabase
			.from("Listing")
			.select("image_path")
			.eq("listing_id", listingId)
			.single();

		const oldPath = existing?.image_path ?? null;
		const newPath = (formData.get("image_path") as string) || null;
		const imageRemoved = formData.get("image_removed") === "true";

		const payload = {
			listing_name: formData.get("listing_name") as string,
			category_id: parseInt(formData.get("category_id") as string),
			coord_latitude: parseFloat(formData.get("coord_latitude") as string),
			coord_longitude: parseFloat(formData.get("coord_longitude") as string),
			image_url: imageRemoved
				? null
				: (formData.get("image_url") as string) || null,
			image_path: imageRemoved ? null : newPath,
			opening_hours: (formData.get("opening_hours") as string) || null,
			closing_hours: (formData.get("closing_hours") as string) || null,
			price_min: formData.get("price_min")
				? parseFloat(formData.get("price_min") as string)
				: null,
			price_max: formData.get("price_max")
				? parseFloat(formData.get("price_max") as string)
				: null,
			description: (formData.get("description") as string) || null,
		};

		const { error } = await supabase
			.from("Listing")
			.update(payload)
			.eq("listing_id", listingId);

		if (error) return { error: error.message };

		// 2. After a successful DB update, delete the old object if it was
		//    replaced or explicitly removed. Do this last so we never lose the
		//    image without a matching DB change.
		if (oldPath && oldPath !== payload.image_path) {
			const bucket = process.env.NEXT_PUBLIC_LISTING_BUCKET ?? "listing-images";
			const adminClient = createServiceClient();
			const { error: storageErr } = await adminClient.storage
				.from(bucket)
				.remove([oldPath]);
			if (storageErr) console.error("Failed to delete old image:", storageErr);
		}

		await tryInsertAdminLog(
			supabase,
			user.email,
			listingId,
			"UPDATED_LISTING",
			payload.listing_name,
		);
		revalidatePath("/admin");
		revalidatePath("/");
		return { success: true };
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Unknown error" };
	}
}

export async function deleteFeedbackAction(feedbackId: number) {
	try {
		const { supabase } = await requireAdmin();
		const { error } = await supabase
			.from("Feedback")
			.delete()
			.eq("feedback_id", feedbackId);
		if (error) return { error: error.message };
		revalidatePath("/admin");
		revalidatePath("/");
		return { success: true };
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Unknown error" };
	}
}

export async function getRecentAdminLogsAction(
	limit = 15,
): Promise<{ data?: AdminLogEntry[]; error?: string }> {
	try {
		await requireAdmin();
		const adminClient = createServiceClient();
		const { data, error } = await adminClient
			.from("Admin_Log")
			.select(
				"log_id, status, listing_id, listing_name, admin_id, Listing(listing_name), Admin(username, email)",
			)
			.order("log_id", { ascending: false })
			.limit(limit);

		if (error) return { error: error.message };
		// Supabase returns joined rows as arrays; unwrap to single objects.
		const mapped: AdminLogEntry[] = (data ?? []).map((row) => ({
			...row,
			Listing: Array.isArray(row.Listing) ? (row.Listing[0] ?? null) : row.Listing,
			Admin: Array.isArray(row.Admin) ? (row.Admin[0] ?? null) : row.Admin,
		}));
		return { data: mapped };
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Unknown error" };
	}
}
