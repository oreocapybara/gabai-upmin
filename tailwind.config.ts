/** * GABAI DESIGN SYSTEM 
 * * Hierarchy:
 * - Content: Text & Icons (text-content-*)
 * - Surface: Backgrounds & Layers (bg-surface-*)
 * - Stroke: Borders & Lines (border-stroke-*)
 */
import type { Config } from "tailwindcss";

type NestedColors = {
	[key: string]: string | NestedColors;
};

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				display: ["var(--font-montserrat)", "sans-serif"],
				body: ["var(--font-inter)", "sans-serif"],
			},

			fontSize: { // [fontsize, lineheight]
				xs: ["10px", "15px"],
				s: ["13px", "20px"],
				m: ["16px", "24px"],
				l: ["20px", "30px"],
				xl: ["25px", "38px"],
				"2xl": ["31px", "47px"],
				"3xl": ["39px", "59px"],
				"4xl": ["61px", "92px"],
      },

			fontWeight: {
				regular: "400",
				medium: "500",
				bold: "700",
			},

      // the fonstise pairing will mostly handle the work for fonts this one is still implemented just in case
			lineHeight: {
				xs: "15px",
				s: "20px",
				m: "24px",
				l: "30px",
				xl: "38px",
				"2xl": "47px",
				"3xl": "59px",
				"4xl": "92px",
			},

			spacing: {
				xs: "var(--spacing-xs)",
				s: "var(--spacing-s)",
				m: "var(--spacing-m)",
				l: "var(--spacing-l)",
				xl: "var(--spacing-xl)",
				"2xl": "var(--spacing-2xl)",
				"3xl": "var(--spacing-3xl)",
				"4xl": "var(--spacing-4xl)",
				"5xl": "var(--spacing-5xl)",
			},

			//COLOR SYSTEM
			colors: {
        // TEXT & ICONS (Replaces "content")
				content: {
					primary: "var(--content-primary)",
					secondary: "var(--content-secondary)",
					tertiary: "var(--content-tertiary)",
					disabled: "var(--content-disabled)",
					brand: "var(--content-brand)",
					inverse: {
						primary: "var(--content-primary-inverse)",
						secondary: "var(--content-secondary-inverse)",
						tertiary: "var(--content-tertiary-inverse)",
					},
					link: {
						DEFAULT: "var(--content-link)",
						hover: "var(--content-link-hover)",
						pressed: "var(--content-link-pressed)",
					},
					notice: {
						DEFAULT: "var(--content-notice)",
						bold: "var(--content-notice-bold)",
					},
					positive: {
						DEFAULT: "var(--content-positive)",
						bold: "var(--content-positive-bold)",
					},
					negative: {
						DEFAULT: "var(--content-negative)",
						bold: "var(--content-negative-bold)",
					},
				},
        
        // BACKGROUNDS & LAYERS (Reads as: bg-surface-primary)
				surface: {
					primary: "var(--background-primary)",
					hover: "var(--background-hover)",
					pressed: "var(--background-pressed)",
					selected: "var(--background-selected)",
					disabled: "var(--background-disabled)",
					inverse: "var(--background-inverse)",
					brand: {
						DEFAULT: "var(--background-brand)",
						hover: "var(--background-brand-hover)",
						pressed: "var(--background-brand-pressed)",
					},
					info: {
						DEFAULT: "var(--background-info)",
						subtle: "var(--background-info-subtle)",
					},
					notice: {
						DEFAULT: "var(--background-notice)",
						subtle: "var(--background-notice-subtle)",
					},
					negative: {
						DEFAULT: "var(--background-negative)",
						subtle: "var(--background-negative-subtle)",
					},
					positive: {
						DEFAULT: "var(--background-positive)",
						subtle: "var(--background-positive-subtle)",
					},
				},

        // BORDERS & LINES (Reads as: border-stroke-primary)
				stroke: {
					primary: "var(--border-primary)",
					secondary: "var(--border-secondary)",
					tertiary: "var(--border-tertiary)",
					disabled: "var(--border-disabled)",
					brand: "var(--border-brand)",
					inverse: "var(--border-inverse)",
					focus: "var(--border-focus)",
					info: "var(--border-info)",
					notice: "var(--border-notice)",
					negative: "var(--border-negative)",
					success: "var(--border-success)",
				},

				// Primitives for Black/White opacities
				black: {
					DEFAULT: "var(--color-black)",
					4: "var(--color-black-4)",
					8: "var(--color-black-8)",
					16: "var(--color-black-16)",
					24: "var(--color-black-24)",
					40: "var(--color-black-40)",
					56: "var(--color-black-56)",
					64: "var(--color-black-64)",
					80: "var(--color-black-80)",
					92: "var(--color-black-92)",
				},
				white: {
					DEFAULT: "var(--color-white)",
					4: "var(--color-white-4)",
					8: "var(--color-white-8)",
					16: "var(--color-white-16)",
					24: "var(--color-white-24)",
					40: "var(--color-white-40)",
					56: "var(--color-white-56)",
					64: "var(--color-white-64)",
					80: "var(--color-white-80)",
					92: "var(--color-white-92)",
				},
			} as NestedColors,
		},
	},
	plugins: [],
} satisfies Config;
