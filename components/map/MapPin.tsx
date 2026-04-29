export const getPinStyle = (category: string) => {
	// Define which icon goes with which category

	//TODO: Style properly
	switch (category) {
		case "canteen-eatery":
			return {
				background: "#1E40AF", // Blue
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: "/glyphs/canteen-eatery.svg",
			};
		case "clinic-hospital":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: "/glyphs/clinic-hospital.svg",
			};
		case "dormitory":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: "/glyphs/dormitory.svg",
			};
		case "laundromat":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: "/glyphs/laundromat.svg",
			};
		case "market":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: "/glyphs/market.svg",
			};
		case "school-building":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: "/glyphs/school-building.svg",
			};
		case "toda":
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: "/glyphs/toda.svg",
			};
		default:
			return {
				background: "#1E40AF",
				glyphColor: "#FFFFFF",
				borderColor: "#1E3A8A",
				glyph: "/glyphs/school-building.svg",
			};
	}
};
