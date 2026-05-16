import Link from "next/link";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { createClient } from "@/lib/supabase/server";
import AddUserForm from "@/components/admin/AddUserForm";
import { AdminUserList } from "@/components/admin/AdminUserList";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function Page() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<div className="min-h-screen bg-surface-primary p-6">
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-2xl">
				<Link
					href="/admin"
					className={cn(
						buttonVariants({ variant: "secondary", size: "sm" }),
						"w-fit decoration-transparent",
					)}
				>
					<ArrowBackRoundedIcon fontSize="small" />
					Back to dashboard
				</Link>
				<AddUserForm />
				<AdminUserList currentUserEmail={user?.email ?? ""} />
			</div>
		</div>
	);
}
