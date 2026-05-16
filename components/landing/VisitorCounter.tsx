"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { markVisitedAndGetCount } from "@/services/visitor.service";

export function VisitorCounter() {
	const [count, setCount] = useState<number | null>(null);

	useEffect(() => {
		let isMounted = true;

		markVisitedAndGetCount().then((initialCount) => {
			if (isMounted) setCount(initialCount);
		});

		const supabase = createClient();
		const channel = supabase
			.channel("site-stats-changes")
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "site_stats" },
				(payload) => {
					if (isMounted) setCount(payload.new.visitor_count);
				},
			)
			.subscribe();

		return () => {
			isMounted = false;
			supabase.removeChannel(channel);
		};
	}, []);

	if (count === null) {
		return (
			<span className="inline-block h-5 w-12 animate-pulse rounded bg-slate-200 align-middle ml-1" />
		);
	}

	return (
		<span className="font-semibold text-content-inverse-primary ml-1">
			{count.toLocaleString()}
		</span>
	);
}
