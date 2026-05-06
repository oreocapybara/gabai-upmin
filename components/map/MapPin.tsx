import { cn } from "@/lib/utils";
import React from "react";

import Canteen from "@mui/icons-material/FastfoodRounded";
import Clinic from "@mui/icons-material/MedicalServicesRounded";
import Dormitory from "@mui/icons-material/Bed";
import Laundromat from "@mui/icons-material/LocalLaundryServiceRounded";
import Market from "@mui/icons-material/LocalGroceryStoreRounded";
import School from "@mui/icons-material/SchoolRounded";
import Toda from "@mui/icons-material/DirectionsCarFilledRounded";

type PinStyle = {
	color: string;
	Icon: React.ElementType;
};

// background color
const baseColor = "bg-content-brand";

const getPinStyle = (category: string): PinStyle => {
	// Define which icon goes with which category

	//TODO: Style properly
	//Based on category apply these icons
	switch (category) {
		case "canteen-eatery":
			return {
				color: baseColor, // Blue
				Icon: Canteen,
			};
		case "clinic-hospital":
			return {
				color: baseColor,
				Icon: Clinic,
			};
		case "dormitory":
			return {
				color: baseColor,
				Icon: Dormitory,
			};
		case "laundromat":
			return {
				color: baseColor,
				Icon: Laundromat,
			};
		case "market":
			return {
				color: baseColor,
				Icon: Market,
			};
		case "school-building":
			return {
				color: baseColor,
				Icon: School,
			};
		case "toda":
			return {
				color: baseColor,
				Icon: Toda,
			};
		default:
			return {
				color: baseColor,
				Icon: School,
			};
	}
};

interface MapPinProps {
	category: string;
	isSelected?: boolean;
}

const MapPin = ({ category, isSelected = false }: MapPinProps) => {
	const { color, Icon } = getPinStyle(category);
	const backgroundColor = isSelected ? "bg-content-positive-bold" : color;

	return (
		<div // Marker body
			className={cn(
				"flex justify-center items-center bg-surface-primary border-[1px]  border-stroke-secondary p-1 rounded-t-full rounded-bl-full rounded-br-[2700px] rotate-45 cursor-pointer  text-content-brand shadow",
				"transition-colors duration-200",
			)}
		>
			<div className={cn( 
				"bg-surface-brand", backgroundColor, "transition-colors duration-200 p-1 rounded-full",
			)}>
				<Icon
					className={cn(
						"-rotate-45 p-[0.5px] text-content-inverse-primary ",
						"transition-colors duration-300",
					)}
				/>
			</div>
		</div>
	);
};

export default MapPin;
