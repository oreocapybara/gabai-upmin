"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn, formatCategoryName } from "@/lib/utils";
import GroupIcon from "@mui/icons-material/Group";
import NearMeIcon from "@mui/icons-material/NearMe";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import ExploreIcon from "@mui/icons-material/Explore";
import { VisitorCounter } from "@/components/landing/VisitorCounter";

const SLIDES = [
	{
		title: "Get directions",
		description: "Find the fastest way to your destination with just a tap.",
		icon: <LocationOnIcon fontSize="small" />,
		iconColor: "text-content-link",
		iconBg: "bg-surface-info-subtle",
	},
	{
		title: "Share your experience",
		description: "Leave reviews and help others make better choices.",
		icon: <StarIcon fontSize="small" />,
		iconColor: "text-content-notice",
		iconBg: "bg-surface-notice-subtle",
	},
	{
		title: "Explore what you need",
		description: "Filter by category — buildings, food, dorms, and more.",
		icon: <ExploreIcon fontSize="small" />,
		iconColor: "text-content-positive",
		iconBg: "bg-surface-positive-subtle",
	},
];

export default function Page() {
	const router = useRouter();
	const [categories, setCategories] = useState<
		{ category_name: string }[] | null
	>(null);
	const [isPaused, setIsPaused] = useState(false);
	const [activeSlide, setActiveSlide] = useState(0);
	const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const touchStartX = useRef<number | null>(null);

	useEffect(() => {
		createClient()
			.from("Category")
			.select("category_name")
			.then(({ data }) => setCategories(data ?? []));
	}, []);

	useEffect(() => {
		if (isPaused) return;
		const timer = setInterval(() => {
			setActiveSlide((prev) => (prev + 1) % SLIDES.length);
		}, 4000);
		return () => clearInterval(timer);
	}, [isPaused]);

	const goToSlide = (index: number) => {
		setActiveSlide(index);
		setIsPaused(true);
		if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
		resumeTimerRef.current = setTimeout(() => setIsPaused(false), 3000);
	};

	const handleTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (touchStartX.current === null) return;
		const delta = e.changedTouches[0].clientX - touchStartX.current;
		touchStartX.current = null;
		if (Math.abs(delta) < 50) return;
		goToSlide(
			delta < 0
				? (activeSlide + 1) % SLIDES.length
				: (activeSlide - 1 + SLIDES.length) % SLIDES.length,
		);
	};

	return (
		<main className="flex min-h-svh flex-col bg-surface-brand">
			{/* ── Hero ── brand background extends from the Navbar */}
			<div className="flex flex-1 flex-col items-center justify-center gap-m px-xl pb-2xl pt-16">
				<div className="overflow-hidden rounded-full shadow-xl ring-4 ring-white-40">
					<Image
						src="/logo.svg"
						alt="GABAI UP Mindanao Logo"
						width={88}
						height={88}
						priority
						className="object-contain"
					/>
				</div>

				<div className="flex flex-col items-center gap-xs text-center">
					<h4 className="text-content-inverse-primary tracking-wide">
						GABAI UP MINDANAO
					</h4>
					<p className="text-s text-content-inverse-secondary">
						Find your way around campus
					</p>
				</div>

				<div className="flex items-center gap-xs text-content-inverse-secondary opacity-70">
					<GroupIcon sx={{ fontSize: 13 }} />
					<span className="text-s">
						<VisitorCounter /> total visits
					</span>
				</div>
			</div>

			{/* ── Content sheet ── floats up from the bottom */}
			<div className="rounded-t-[32px] bg-surface-primary px-xl pt-2xl pb-10 flex flex-col gap-xl shadow-[0_-8px_32px_rgba(0,0,0,0.15)]">
				{/* Feature carousel */}
				<div>
					<div
						className="overflow-hidden rounded-2xl border border-stroke-secondary"
						onMouseEnter={() => setIsPaused(true)}
						onMouseLeave={() => setIsPaused(false)}
						onTouchStart={handleTouchStart}
						onTouchEnd={handleTouchEnd}
					>
						<div
							className="flex transition-transform duration-500 ease-in-out"
							style={{ transform: `translateX(-${activeSlide * 100}%)` }}
						>
							{SLIDES.map((slide, i) => (
								<div key={i} className="w-full flex-shrink-0">
									<div className="flex items-center gap-l px-l py-m">
										<div
											className={cn(
												"flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
												slide.iconBg,
											)}
										>
											<span className={slide.iconColor}>{slide.icon}</span>
										</div>
										<div className="min-w-0 text-left">
											<p className="text-m font-semibold text-content-primary leading-tight">
												{slide.title}
											</p>
											<p className="mt-xs text-s text-content-secondary">
												{slide.description}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Dot indicators — 44 px tap area, visually small */}
					<div className="mt-1 flex justify-center gap-xs">
						{SLIDES.map((_, i) => (
							<button
								key={i}
								onClick={() => goToSlide(i)}
								aria-label={`Slide ${i + 1}`}
								className="flex h-11 w-11 items-center justify-center"
							>
								<span
									className={cn(
										"block h-1.5 w-full max-w-[6px] rounded-full transition-all duration-300",
										i === activeSlide
											? "max-w-[20px] bg-surface-brand"
											: "bg-stroke-secondary",
									)}
								/>
							</button>
						))}
					</div>
				</div>

				{/* Browse by category */}
				<div className="flex flex-col gap-m">
					<div className="flex items-center gap-m">
						<div className="h-px flex-1 bg-stroke-tertiary" />
						<span className="text-xs font-semibold uppercase tracking-widest text-content-tertiary">
							Browse by category
						</span>
						<div className="h-px flex-1 bg-stroke-tertiary" />
					</div>

					<div className="flex flex-wrap justify-center gap-2">
						{categories === null
							? Array.from({ length: 5 }).map((_, i) => (
									<div
										key={i}
										className="h-8 w-20 animate-pulse rounded-2xl bg-stroke-secondary"
									/>
								))
							: categories.map((cat) => (
									<Button
										key={cat.category_name}
										variant="secondary"
										size="sm"
										className="text-s font-medium text-content-tertiary"
										onClick={() =>
											router.push(
												`/?category=${encodeURIComponent(cat.category_name)}`,
											)
										}
									>
										{formatCategoryName(cat.category_name)}
									</Button>
								))}
					</div>
				</div>

				{/* Primary CTA */}
				<Button
					variant="default"
					size="default"
					className="w-full"
					trailingIcon={<NearMeIcon sx={{ fontSize: 18 }} />}
					onClick={() => router.push("/")}
				>
					Explore Map
				</Button>

				{/* Admin link */}
				<p className="text-center text-s text-content-tertiary">
					Are you an admin?{" "}
					<Link
						href="/login"
						className="font-medium text-content-link underline underline-offset-4 hover:text-content-link-hover active:text-content-link-pressed"
					>
						Log in
					</Link>
				</p>
			</div>
		</main>
	);
}
