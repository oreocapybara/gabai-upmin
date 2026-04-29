import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center font-body font-bold gap-[6px] whitespace-nowrap rounded-2xl  text-m  transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-surface-brand shadow hover:bg-surface-brand-hover active:bg-surface-brand-pressed text-content-inverse-primary",
				secondary: 
					"bg-surface-primary border-stroke-primary border-[1px] text-content-brand shadow-sm hover:bg-surface-hover hover:text-content-link active:bg-surface-pressed active:text-content-link-pressed",
				tertiary:
					"bg-surface-primary text-content-brand hover:bg-surface-hover hover:text-content-link-hover active:bg-surface-pressed",
				mono: "bg-surface-primary text-content-primary hover:bg-surface-hover active:bg-surface-pressed",
				link: "text-content-link underline-offset-4 underline hover:text-content-link-hover active:text-content-link-pressed",
			},
			size: {
				default: "w-full px-6 py-2",
				sm: "w-fill px-4 py-1",
				icon: "p-2",
			},
			squared: {
				true: "rounded",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	leadingIcon?: React.ReactNode;
	trailingIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			squared,
			leadingIcon,
			trailingIcon,
			asChild = false,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, squared, className }))}
				ref={ref}
				{...props}
			>
				{leadingIcon}
				{props.children}
				{trailingIcon}
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
