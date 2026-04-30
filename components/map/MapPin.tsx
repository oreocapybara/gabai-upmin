import Canteen from '@mui/icons-material/Fastfood';
import Clinic from '@mui/icons-material/MedicalServicesRounded';
import Dormitory from '@mui/icons-material/Bed';
import Laundromat from '@mui/icons-material/LocalLaundryServiceRounded';
import Market from '@mui/icons-material/LocalGroceryStoreRounded';
import School from '@mui/icons-material/SchoolRounded';
import Toda from '@mui/icons-material/DirectionsCarFilledRounded';

type PinStyle = {
	background: string;
	glyphColor: string;
	borderColor: string;
	glyph?: React.ElementType;
	glyphSrc?: string;
};

export const getPinStyle = (category: string): PinStyle => {
	// Define which icon goes with which category

	
	//TODO: Style properly
	switch (category) {
		case "canteen-eatery":
			return {
				background: "#1E40AF", // Blue
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: Canteen,
			};
		case "clinic-hospital":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: Clinic,
			};
		case "dormitory":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: Dormitory,
			};
		case "laundromat":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: Laundromat,
			};
		case "market":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: Market,
			};
		case "school-building":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: School,
			};
		case "toda":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: Toda,
			};
		default:
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: School,
			};
	}
};
