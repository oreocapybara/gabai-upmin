"use client";

import Link from 'next/link';
import Image from 'next/image';

import { useEffect, useState, } from 'react';

import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from "@/components/ui/Card";
import { MainDrawer } from '@/components/drawer/MainDrawer';

import { Slide } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import NearMeIcon from '@mui/icons-material/NearMe';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import ExploreIcon from '@mui/icons-material/Explore';

export default function Page() {
	const [categories, setCategories] = useState<{ category_name: string }[]>([]);
	const [isPaused, setIsPaused] = useState(false);
	const [carouselIndex, setCarouselIndex] = useState(0);
	const carouselSlides = [
		{ 
		  title: 'Get directions', 
		  description: 'Find the fastest way to your destination with just a tap.', 
		  icon: <LocationOnIcon className="text-content-link"/> 
		},
		{ 
		  title: 'Share your experience', 
		  description: 'Contribute to the community by leaving reviews and helping others make better choices.', 
		  icon: <StarIcon className="text-content-notice"/> 
		},
		{ 
		  title: 'Explore what you need', 
		  description: 'Use filters to quickly discover places that match your needs -- buildings, food, dorms, and more.', 
		  icon: <ExploreIcon className="text-content-positive"/> 
		},
	];

	useEffect(() => {
		const fetchCategories = async () => {
			const supabase = createClient();
			const { data, error } = await supabase
				.from('Category')
				.select('category_name');
			if (error) {
				console.error('Error fetching categories:', error);
			} else {
				setCategories(data || []);
			}
		};
		fetchCategories();
	}, []);

	useEffect(() => {
		if (isPaused) return;

		const timer = setInterval(() => {
			setCarouselIndex((prevIndex) => (prevIndex + 1) % carouselSlides.length);
		}, 5000);

		return () => clearInterval(timer);
	}, [isPaused, carouselSlides.length]);

	return (
		<main className="flex min-h-svh w-full items-center justify-center p-2 md:p-6">
			<div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
				<div className="flex h-40 w-40 items-center justify-center rounded-full text-2xl font-bold text-white">
					<Image 
						src="/logo.svg" 
						alt="GABAI UP Mindanao Logo" 
						width={200}    
						height={200} 
						priority     
						className="object-contain" 
					/>
				</div>

				<p className="text-xl text-content-brand tracking-tight sm:text-5xl font-semibold">
				GABAI UP MINDANAO
				</p>

				<p className="max-w-xl text-base leading-7 text-content-secondary text-sm">
				Find your way around campus
				</p>

				<div className="relative w-full max-w-2xl mt-6 h-32"> 
				{carouselSlides.map((slide, index) => (
					<Slide 
					key={index} 
					in={index === carouselIndex} 
					direction="left" 
					mountOnEnter 
					unmountOnExit
					>
						<Card 
							onMouseEnter={() => setIsPaused(true)}
							onMouseLeave={() => setIsPaused(false)}
							className="absolute w-full h-full rounded-3xl border-2 border-stroke-secondary overflow-hidden"
						>
							<CardContent className="flex items-center gap-8 h-full px-10 py-0">
							
								<div className="flex-shrink-0 flex items-center justify-center">
									<div className="scale-[1.5]"> 
									{slide.icon}
									</div>
								</div>

								<div className="flex-grow min-w-0 text-left">
									<h3 className="font-bold text-content-brand text-s leading-tight mb-1">
									{slide.title}
									</h3>
									<p className="text-content-tertiary text-s leading-snug">
									{slide.description}
									</p>
								</div>

							</CardContent>
						</Card>
					</Slide>
				))}
				</div>

				<div className="mt-4 flex items-center">
					<GroupIcon fontSize="medium" className="text-content-tertiary" />
					<p className="ml-2 max-w-xl text-base leading-7 text-content-tertiary sm:text-lg">
					Visitor count here
					</p>
				</div>

				<div className="mt-4 self-start text-left">
					<p className="max-w-xl text-base leading-7 text-content-brand sm:text-lg font-semibold"> 
					Browse by category
					</p>
					<div className="flex flex-wrap gap-2 mt-2">
						{categories.map((cat) => (
							<Button key={cat.category_name} variant="secondary" size="sm" className="text-content-secondary">
								{cat.category_name}
							</Button>
						))}
					</div>
					<Button variant="default" size="default" className="mt-4" trailingIcon={<NearMeIcon />}>
					Explore Map
					</Button>
				</div>

				<div className="mt-4 flex items-center">
					<p className="ml-2 max-w-xl text-base leading-7 text-content-tertiary sm:text-lg">
					Are you an admin?
					</p>

					<Link 
						href="/login" 
						className="ml-2 underline underline-offset-4 text-content-link hover:text-content-link-hover active:text-content-link-pressed"
					>
					Log in
					</Link>
				</div>

				<MainDrawer />
			</div>
		</main>
	);
}