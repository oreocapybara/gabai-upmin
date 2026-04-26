# Gabai UPMin Code Conventions

A comprehensive guide to naming, structure, and organizational standards for the Gabai UPMin project.

## Overview

This document defines how we name files, variables, components, types, and organize code across the Gabai UPMin project. These conventions ensure consistency, maintainability, and clarity for all team members—from new contributors to experienced developers.
****
**Core Philosophy:**

- **Consistency** — Predictable patterns make code easier to navigate and understand
- **Clarity** — Names should be self-documenting and reveal intent
- **Maintainability** — Clear organization enables efficient scaling and refactoring
- **Developer Experience** — IntelliSense and autocomplete work better with predictable patterns

**How to Use This Guide:**

- Use the **Quick Reference** section for a cheat sheet of common patterns
- Refer to detailed sections when implementing new features
- Check **Common Pitfalls** when uncertain about a pattern

---

## Table of Contents
- [1. Git & Collaboration](#1-git--collaboration)
- [2. File Naming Conventions](#2-file-naming-conventions)
	- [Component Files (.tsx)](#component-files-tsx)
	- [Custom Hooks (.ts)](#custom-hooks-ts)
	- [Services (.ts)](#service-files-ts)
- [3. Variable & Function Naming](#3-variable--function-naming)
- [4. TypeScript Naming](#4-typescript-naming)
- [5. Component Naming & Structure](#5-component-naming--structure)
- [6. Folder Structure & Organization](#6-folder-structure--organization)
- [7. CSS & Styling Conventions](#7-css--styling-conventions)
- [8. Hooks & Composition Patterns](#8-hooks--composition-patterns)
- [9. Services & Data Layer](#9-services--data-layer)
- [10. Comments & Documentation](#10-comments--documentation)
- [11. Error Handling](#11-error-handling)
- [12. Database Naming Conventions](#12-database-naming-conventions)
- [Quick Reference](#quick-reference)
- [Summary](#summary)

---

## 1. Git & Collaboration

### Commit Message Format

**Rule:** Use conventional commits: `type(scope): subject`

```
<type>(<scope>): <subject>
<blank line>
<body>
<blank line>
<footer>
```

### Commit Types

| Type       | Purpose                                   | Example                                       |
| :--------- | :---------------------------------------- | :-------------------------------------------- |
| `feat`     | New feature                               | `feat(auth): add social login`                |
| `fix`      | Bug fix                                   | `fix(listings): correct distance calculation` |
| `docs`     | Documentation                             | `docs: update conventions guide`              |
| `style`    | Code style (formatting, semicolons, etc.) | `style: remove unused imports`                |
| `refactor` | Code refactoring                          | `refactor(services): extract common logic`    |
| `perf`     | Performance improvement                   | `perf(map): optimize marker rendering`        |
| `test`     | Tests                                     | `test(auth): add login form tests`            |
| `chore`    | Build, dependencies, etc.                 | `chore: upgrade tailwind to v3.4`             |
| `ci`       | CI/CD changes                             | `ci: add GitHub Actions workflow`             |

### Commit Examples

✅ **Good:**

```
feat(auth): implement JWT refresh token rotation

- Add refresh token storage in secure cookie
- Implement 15-minute token expiration
- Add automatic token refresh on API calls

Closes #123
```

```
fix(map): fix marker clustering on zoom level change

- Recalculate clusters when zoom level changes
- Prevent duplicate markers in cluster
- Add debounce to cluster recalculation

Fixes #456
```

```
docs(conventions): add database naming conventions

- Define table naming rules (UPPER_CASE, singular)
- Define column naming rules (snake_case, consistent ID suffix)
- Add examples for each column type
```

❌ **Bad:**

```
fixed stuff                                    # Too vague
update                                         # No context
feat: add feature                             # No scope
Fix the bug that was bugging me for weeks     # Unclear intent
feat(random): changed lots of things          # Too many changes in one commit
```

### Branch Naming

**Rule:** `type/description` or `type/#issueNumber`, lowercase, hyphens instead of spaces.

| Type         | Pattern                  | Examples                                                |
| :----------- | :----------------------- | :------------------------------------------------------ |
| **Feature**  | `feature/{description}`  | `feature/add-social-login`, `feature/map-clustering`    |
| **Bug fix**  | `bugfix/{description}`   | `bugfix/marker-duplication`, `bugfix/auth-token-expiry` |
| **Hotfix**   | `hotfix/{description}`   | `hotfix/api-crash`                                      |
| **Refactor** | `refactor/{description}` | `refactor/extract-service-logic`                        |
| **Chore**    | `chore/{description}`    | `chore/upgrade-dependencies`                            |

✅ **Good:**

```
feature/add-jwt-refresh-tokens
bugfix/fix-map-marker-clustering
hotfix/api-500-error
refactor/extract-listing-service-logic
chore/upgrade-react-to-v19
```

❌ **Bad:**

```
feature  (too vague)
Feature/Add_JWT_Refresh_Tokens  (wrong casing and format)
fix/the-bug-that-was-reported-in-issue-123  (too long)
FIX-BUG  (no description)
```

### Pull Request Naming & Description

**Rule:** Title in imperative mood, detailed description explaining "why" not just "what".

✅ **Good PR Title:**

```
Add JWT refresh token rotation

or

Implement user authentication with refresh tokens
```

✅ **Good PR Description:**

```
## Overview
Implements JWT refresh token rotation to improve security posture.

## Changes
- Add refresh token storage in HTTP-only cookies
- Implement 15-minute token expiration
- Auto-refresh tokens on API calls
- Add token rotation on user login

## Testing
- [x] Login with valid credentials
- [x] Token refresh on expiry
- [x] Logout clears tokens
- [x] Expired tokens are rejected

## Related
Closes #123
```

## 2. File Naming Conventions

All files follow specific naming patterns based on their purpose and type.

### By File Type

| File Type            | Pattern                | Examples                                  | Location              |
| :------------------- | :--------------------- | :---------------------------------------- | :-------------------- |
| **Components**       | `PascalCase.tsx`       | `LoginForm.tsx`, `AuthButton.tsx`         | `components/`         |
| **Custom Hooks**     | `use${Name}.ts`        | `useMapStore.ts`, `useGeolocation.ts`     | `hooks/`              |
| **Services**         | `{feature}.service.ts` | `listing.service.ts`, `review.service.ts` | `services/`           |
| **Utilities**        | `camelCase.ts`         | `utils.ts`, `helpers.ts`                  | `lib/`, `utils/`      |
| **Types**            | `camelCase.ts`         | `index.ts`, `supabase.ts`                 | `types/`              |
| **Routes/Folders**   | `kebab-case/`          | `login/`, `forgot-password/`, `manage/`   | `app/`                |
| **Grouping Folders** | `(kebab-case)/`        | `(auth)/`, `(public)/`, `(admin)/`        | `app/` (Next.js only) |

### Component Files (`.tsx`)

**Rule:** File name in `PascalCase`, exported component in `PascalCase`.

✅ **Good:**

```
// File: components/auth/LoginForm.tsx
export function LoginForm() { ... }

// File: components/ui/Card.tsx
export function Card() { ... }
```

❌ **Bad:**

```
// File: components/auth/loginForm.tsx (file should be PascalCase)
export function loginForm() { ... }

// File: components/ui/card.tsx (file should be PascalCase)
export function Card() { ... }
```

### Hook Files (`.ts`)

**Rule:** File name matches the hook export exactly.

✅ **Good:**

```
// File: hooks/useMapStore.ts
export function useMapStore() { ... }

// File: hooks/useGeolocation.ts
export const useGeolocation = () => { ... }
```

❌ **Bad:**

```
// File: hooks/map-store.ts (should match hook name)
export function useMapStore() { ... }

// File: hooks/useMapStore.ts
export function mapStore() { ... }
```

### Service Files (`.ts`)

**Rule:** Use the `{feature}.service.ts` pattern (kebab-case file name with a `.service.ts` suffix) placed in the `services/` folder. This makes purpose explicit and groups services when sorted in file explorers.

✅ **Good:**

```
// File: services/listing.service.ts
export const listingService = { ... }

// File: services/review.service.ts
export const reviewService = { ... }
```

❌ **Bad:**

```
// File: services/listings.ts (plural)
// File: services/list-service.ts (ambiguous pattern)
// File: services/data.ts (too vague)
```

---

## 3. Variable & Function Naming

All variables and functions follow `camelCase` with descriptive names.

### General Rules

| Pattern           | Use Case                      | Examples                                      |
| :---------------- | :---------------------------- | :-------------------------------------------- |
| `camelCase`       | Variables, functions, methods | `userName`, `fetchData`, `isVisible`          |
| `UPPER_CASE`      | Constants                     | `PAGE_SIZE`, `MAX_RETRIES`, `API_TIMEOUT`     |
| `handle${Action}` | Event handlers                | `handleClick`, `handleSubmit`, `handleChange` |
| `set${State}`     | State setters                 | `setEmail`, `setPassword`, `setLoading`       |
| `is${Condition}`  | Booleans                      | `isLoading`, `isVisible`, `isAuthenticated`   |
| `get${Resource}`  | Getter functions              | `getUserData`, `getListings`, `getMapBounds`  |
| `on${Event}`      | Callbacks/listeners           | `onSuccess`, `onError`, `onClose`             |

### Examples in Context

✅ **Good:**

```typescript
// Variables
const userName = "Alice";
const mapInstanceRef = useRef<Map | null>(null);

// Functions
function fetchUserData() { ... }
function calculateDistance(lat1: number, lng1: number) { ... }

// Event handlers
const handleLogin = () => { ... };
const handleFormSubmit = (data) => { ... };

// State
const [isLoading, setIsLoading] = useState(false);
const [selectedLocation, setSelectedLocation] = useState(null);

// Constants
const PAGE_SIZE = 50;
const MAX_RETRIES = 3;
const DEFAULT_ZOOM_LEVEL = 12;
```

❌ **Bad:**

```typescript
// camelCase missing
const UserName = "Alice";
const map_instance_ref = useRef(null);

// Unclear intent
const data = fetchSomething();
const cb = () => { ... };

// Not constant-like
const pageSize = 50;

// Unclear naming
function process(x, y) { ... }
const result = calculate();
```

### Constants

**Rule:** `UPPER_CASE` with underscores, declared at module/file level.

✅ **Good:**

```typescript
// At the top of the file
const PAGE_SIZE = 50;
const API_BASE_URL = "https://api.example.com";
const DEFAULT_THEME = "light";

export function useListings() {
	const [data, setData] = useState([]);
	// ...
}
```

❌ **Bad:**

```typescript
export function useListings() {
	const pageSize = 50; // Define at module level, not inside functions
	const API_BASE_URL = "https://api.example.com";
	// ...
}
```

---

## 4. TypeScript Naming

### Interfaces & Types

**Rule:** `PascalCase`, no `I` or `T` prefix. Choose meaningful names that represent the domain concept.

| Type Category       | Pattern                                     | Examples                                    |
| :------------------ | :------------------------------------------ | :------------------------------------------ |
| **Data Models**     | Noun (PascalCase)                           | `User`, `Listing`, `Review`, `Admin`        |
| **Component Props** | `${ComponentName}Props`                     | `ButtonProps`, `LoginFormProps`             |
| **API Responses**   | `${Resource}Response`                       | `ListingResponse`, `UserResponse`           |
| **API Requests**    | `${Resource}Request` or `Create${Resource}` | `CreateListingRequest`, `UpdateUserRequest` |
| **Enums**           | Noun (PascalCase)                           | `UserRole`, `ListingStatus`, `SortOrder`    |
| **Union Types**     | Descriptive name                            | `FileFormat`, `NotificationLevel`           |

✅ **Good:**

```typescript
// Data models
interface User {
	user_id: string;
	username: string;
	email: string;
}

// Props interfaces
interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
	variant?: "primary" | "secondary";
	size?: "sm" | "md" | "lg";
}

interface LoginFormProps {
	onSuccess?: (user: User) => void;
	onError?: (error: Error) => void;
}

// API responses
interface ListingResponse {
	listing_id: string;
	category_id: string;
	listing_name: string;
}

// Enums
enum UserRole {
	Admin = "admin",
	User = "user",
	Guest = "guest",
}
```

❌ **Bad:**

```typescript
// No I or T prefix
interface IUser { ... }
type TUser = { ... };

// Too vague
interface Data { ... }
type Response = { ... };

// Mixed conventions
interface user_interface { ... }
type createUserResponse = { ... };
```

## 5. Component Naming & Structure

### Component Export Names

**Rule:** `PascalCase`, descriptive name representing the component's purpose.

✅ **Good:**

```typescript
// File: components/auth/login-form.tsx
export function LoginForm(props: LoginFormProps) { ... }

// File: components/ui/card.tsx
export function Card(props: CardProps) { ... }

// File: components/admin/ListingTable.tsx
export function ListingTable(props: ListingTableProps) { ... }
```

❌ **Bad:**

```typescript
// Not PascalCase
export function loginForm() { ... }

// Too generic
export function Form() { ... }

// Internal implementation details in name
export function LoginFormInternal() { ... }
```

### Props Interfaces

**Rule:** Named as `${ComponentName}Props`, extend React props when needed.

✅ **Good:**

```typescript
// Simple props
interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

// Complex props with children
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "outlined";
  children: React.ReactNode;
}

export function Card({ variant, children, ...props }: CardProps) {
  return <div {...props}>{children}</div>;
}
```

❌ **Bad:**

```typescript
// Wrong naming
interface ICard { ... }
type CardComponentProps = { ... };

// Not extending React props
interface ButtonProps {
  onClick: () => void;
  className: string;
}
```

### Display Names

**Rule:** Set `displayName` on components that use `forwardRef` or are exported as references.

✅ **Good:**

```typescript
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant, children, ...props }, ref) => (
    <div ref={ref} {...props}>{children}</div>
  )
);
Card.displayName = "Card";

export { Card };
```

### Component Organization

✅ **Good folder structure:**

```
components/
├── ui/                  (Reusable UI primitives)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Label.tsx
├── auth/                (Authentication features)
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── ForgotPasswordForm.tsx
│   └── LogoutButton.tsx
├── admin/               (Admin features)
│   ├── ListingForm.tsx
│   └── ListingTable.tsx
├── map/                 (Map-related features)
│   ├── Map.tsx
│   ├── MapMarker.tsx
│   └── DirectionsLayer.tsx
├── drawer/              (Modal/drawer components)
│   ├── MainDrawer.tsx
│   ├── ListingDetails.tsx
│   └── ReviewSection.tsx
└── [shared].tsx         (Standalone shared components)
```

---

## 6. Folder Structure & Organization

### Directory Purpose

| Folder        | Purpose                    | Organization                                                 |
| :------------ | :------------------------- | :----------------------------------------------------------- |
| `app/`        | Next.js routes             | Route-based structure with `(groupName)/` for grouping       |
| `components/` | React components           | Feature-based subfolders (`auth/`, `admin/`, `ui/`) + shared |
| `hooks/`      | Custom React hooks         | Individual hook files (one hook per file)                    |
| `lib/`        | Utilities and configs      | Purpose-based subfolders (`supabase/`, `utils.ts`)           |
| `public/`     | Static assets              | Public files served as-is                                    |
| `services/`   | Business logic & Supabase  | Domain-based files (e.g., `listing.service.ts`)              |
| `supabase/`   | Supabase config            | Config and local setup files                                 |
| `types/`      | TypeScript definitions     | Central type definitions                                     |

### Route Organization (Next.js)

**Rule:** Use `(groupName)` folders to group related routes without affecting URL structure.

✅ **Good:**

```
app/
├── (public)/
│   └── page.tsx                  # → /
├── (auth)/
│   ├── login/
│   │   └── page.tsx              # → /login
│   ├── forgot-password/
│   │   └── page.tsx              # → /forgot-password
│   ├── confirm/
│   │   └── route.ts              # POST /confirm
│   ├── error/
│   │   └── page.tsx              # → /error
│   └── update-password/
│       └── page.tsx              # → /update-password
├── admin/
│   ├── layout.tsx
│   ├── page.tsx                  # → /admin
│   └── manage/
│       └── page.tsx              # → /admin/manage
```

### Import Organization by Layer

**Rule:** Three-tier import organization: External → Internal (lib/utils) → Local (relative).

✅ **Good order:**

```typescript
// 1. External packages
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// 2. Internal libraries and utilities
import { cn } from "@/lib/utils";
import { listingService } from "@/services/listing.service";

// 3. Types
import type { Listing, User } from "@/types";

// 4. Local relative imports
import { ListingCard } from "./ListingCard";
import { useMapStore } from "@/hooks/useMapStore";

// 5. Styles (if using CSS modules or similar)
import styles from "./page.module.css";
```

❌ **Bad:**

```typescript
// Mixed and unclear organization
import { cn } from "@/lib/utils";
import React from "react";
import { ListingCard } from "./ListingCard";
import { listingService } from "@/services/listing.service";
import type { Listing } from "@/types";
import { useRouter } from "next/navigation";
```

---

## 7. CSS & Styling Conventions

### Tailwind Utility Classes

**Rule:** Use semantic design system tokens (see DESIGN_SYSTEM.md) + Tailwind utilities.

✅ **Good:**

```tsx
// Using semantic colors from design system
<button className="bg-surface-brand hover:bg-surface-brand-hover text-content-inverse-primary">
  Click me
</button>

// Using spacing tokens
<div className="p-l gap-m">
  Content
</div>

// Using text sizes
<p className="text-m text-content-secondary">Subtitle</p>
```

❌ **Bad:**

```tsx
// Hardcoded values
<button className="bg-[#8a1538] px-[16px] py-[8px]">

// Mixing primitives with semantics
<div className="bg-blue-500 text-content-primary">

// Arbitrary values instead of design tokens
<div className="p-[23px] gap-[11px]">
```

### Class Merging with `cn()`

**Rule:** Use the `cn()` helper from `@/lib/utils` to merge and override classes.

✅ **Good:**

```typescript
// File: lib/utils.ts
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

// Usage in components
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary";
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-l py-s rounded-md text-m transition-colors",
        variant === "primary" && "bg-surface-brand text-content-inverse-primary",
        variant === "secondary" && "bg-surface-hover text-content-primary",
        className
      )}
      {...props}
    />
  );
}
```

### CSS Variables

**Rule:** kebab-case with semantic prefix for design system variables.

✅ **Good:**

```css
/* In globals.css */
:root {
	/* Typography */
	--font-montserrat: "Montserrat", sans-serif;
	--font-inter: "Inter", sans-serif;

	/* Colors (primitives) */
	--color-white: rgb(255 255 255);
	--color-brand-primary: rgb(138 21 56);
	--color-grey-900: rgb(17 24 39);

	/* Semantic colors */
	--surface-brand: var(--color-brand-primary);
	--content-primary: var(--color-grey-900);
	--content-inverse-primary: var(--color-white);
}

.dark {
	--surface-brand: var(--color-brand-dark);
	--content-primary: var(--color-white);
}
```

---

## 8. Hooks & Composition Patterns

### Custom Hook Naming

**Rule:** Prefix all custom hooks with `use`, followed by a descriptive name in `PascalCase`.

✅ **Good:**

```typescript
// File: hooks/useMapStore.ts
export function useMapStore() { ... }

// File: hooks/useGeolocation.ts
export const useGeolocation = () => { ... }

// File: hooks/useListings.ts
export function useListings(filters?: ListingFilters) { ... }

// Stateful hook with prefix
export function useFormState(initialValues: FormValues) { ... }
```

❌ **Bad:**

```typescript
// Missing use prefix
export function mapStore() { ... }

// use prefix in the middle
export function storeUse() { ... }

// Wrong casing
export function uSeMapStore() { ... }
```

### Hook File Organization

**Rule:** One hook per file, file name matches hook export exactly.

✅ **Good:**

```
hooks/
├── useMapStore.ts       # exports useMapStore
├── useGeolocation.ts    # exports useGeolocation
├── useListings.ts       # exports useListings
└── useFormState.ts      # exports useFormState
```

### Hook Dependencies & Performance

✅ **Good:**

```typescript
// Clear dependencies
useEffect(() => {
	loadData();
}, [userId, sortOrder]); // All external values included

// Stable callback references
const handleChange = useCallback(
	(value) => {
		setData(value);
	},
	[setData],
); // Include all dependencies

// Memoized objects
const filterOptions = useMemo(() => ({ category, status }), [category, status]);
```

❌ **Bad:**

```typescript
// Missing dependencies
useEffect(() => {
	console.log(userId); // userId is used but not in dependencies
}, []);

// Empty dependencies when values are needed
useEffect(() => {
	setData(userId);
}, []); // Should include userId

// Creating new objects every render
const config = { theme: "dark", size: "lg" };
useEffect(() => {
	applyConfig(config);
}, [config]); // config is a new object every render
```

---

## 9. Services & Data Layer

### Service File Naming

**Rule:** Use the `{feature}.service.ts` pattern (kebab-case file name with a `.service.ts` suffix). Place service files under `services/`. This makes purpose explicit, groups related files, and reads well in IDEs and import statements.

✅ **Good:**

```typescript
// File: services/listing.service.ts
export const listingService = {
	async getAll(filters?: ListingFilters): Promise<Listing[]> { ... },
	async getById(id: string): Promise<Listing> { ... },
	async create(data: CreateListingRequest): Promise<Listing> { ... },
	async update(id: string, data: UpdateListingRequest): Promise<Listing> { ... },
	async delete(id: string): Promise<void> { ... },
};

// File: services/review.service.ts
export const reviewService = {
	async getByListing(listingId: string): Promise<Review[]> { ... },
	async create(data: CreateReviewRequest): Promise<Review> { ... },
};
```

### Service Method Naming

| Pattern                       | Use Case                | Examples                             |
| :---------------------------- | :---------------------- | :----------------------------------- |
| `get${Resource}`              | Fetch single item       | `getUser`, `getListing`, `getReview` |
| `get${Resource}s` or `getAll` | Fetch multiple          | `getListings`, `getAllUsers`         |
| `getBy${Field}`               | Fetch by specific field | `getByCategory`, `getByUserId`       |
| `create${Resource}`           | Create new item         | `createListing`, `createReview`      |
| `update${Resource}`           | Update existing         | `updateUser`, `updateListing`        |
| `delete${Resource}`           | Delete item             | `deleteListing`, `deleteReview`      |
| `search${Resource}`           | Search/filter           | `searchListings`                     |

### Service Structure

✅ **Good:**

```typescript
// File: services/listing.service.ts
import { supabase } from "@/lib/supabase/client";
import type { Listing, CreateListingRequest } from "@/types";

const LISTINGS_TABLE = "LISTING";

export const listingService = {
	async getAll(limit = 50, offset = 0): Promise<Listing[]> {
		const { data, error } = await supabase
			.from(LISTINGS_TABLE)
			.select("*")
			.limit(limit)
			.offset(offset);

		if (error) throw new Error(`Failed to fetch listings: ${error.message}`);
		return data || [];
	},

	async getById(id: string): Promise<Listing> {
		const { data, error } = await supabase
			.from(LISTINGS_TABLE)
			.select("*")
			.eq("listing_id", id)
			.single();

		if (error) throw new Error(`Failed to fetch listing: ${error.message}`);
		return data;
	},

	async create(listing: CreateListingRequest): Promise<Listing> {
		const { data, error } = await supabase
			.from(LISTINGS_TABLE)
			.insert([listing])
			.select()
			.single();

		if (error) throw new Error(`Failed to create listing: ${error.message}`);
		return data;
	},
};
```

---

## 10. Comments & Documentation

### Inline Comments

**Rule:** Use single-line comments (`//`) for brief explanations. Keep comments concise and update when code changes.

✅ **Good:**

```typescript
// Calculate bounding box from coordinates
const bounds = calculateBounds(coordinates);

// Skip validation for admin users
if (user.role === "admin") {
	return true;
}

// Retry up to 3 times before failing
for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
	// ...
}
```

❌ **Bad:**

```typescript
// DO NOT PUT COMMENTS AT THE END OF LINES
const bounds = calculateBounds(coordinates); // This calculates the bounds

// Overly long comments that explain obvious code
// We are now going to check if the user role is admin
// and if it is, we will return true, otherwise we will continue
if (user.role === "admin") return true;

// Stale comments (outdated)
// This will never be null
const value = getValue(); // Actually, it can be null now
```

### Warning & Deprecation Comments

**Rule:** Use `TODO`, `FIXME`, `WARN` markers for temporary or problematic code.

✅ **Good:**

```typescript
// TODO: Optimize this query with proper indexing
const results = await db.listings.find({ status: "active" });

// FIXME: Handle edge case when timezone offset is invalid
const date = parseDate(dateString);

// WARN: This endpoint is deprecated; use /v2/listings instead
export async function getListingsV1() { ... }

// NOTE: Using any here because third-party lib has incomplete types
const config = (thirdPartyLib.config as any).settings;
```

### Type Documentation

✅ **Good:**

```typescript
/**
 * Represents a user's profile information.
 * @property user_id - Unique identifier (UUID)
 * @property username - Username (3-30 characters, lowercase)
 * @property email - Email address (must be unique)
 * @property role - User role (admin, user, guest)
 * @property created_at - Account creation timestamp
 */
interface User {
	user_id: string;
	username: string;
	email: string;
	role: UserRole;
	created_at: Date;
}
```

---

## 11. Error Handling

### Custom Error Classes

**Rule:** Extend `Error` class, use clear naming, include context.

✅ **Good:**

```typescript
// File: lib/errors.ts

export class ValidationError extends Error {
	constructor(
		message: string,
		public field?: string,
	) {
		super(message);
		this.name = "ValidationError";
	}
}

export class NotFoundError extends Error {
	constructor(resource: string, id: string) {
		super(`${resource} with ID ${id} not found`);
		this.name = "NotFoundError";
	}
}

export class UnauthorizedError extends Error {
	constructor(message = "Unauthorized") {
		super(message);
		this.name = "UnauthorizedError";
	}
}

export class ApiError extends Error {
	constructor(
		message: string,
		public statusCode: number,
		public endpoint: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}
```

### Try-Catch Error Handling

✅ **Good:**

```typescript
// In services
export const listingService = {
  async getById(id: string): Promise<Listing> {
    try {
      const { data, error } = await supabase
        .from("LISTING")
        .select("*")
        .eq("listing_id", id)
        .single();

      if (error) {
        throw new NotFoundError("Listing", id);
      }
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error; // Re-throw known errors
      }
      throw new ApiError(
        "Failed to fetch listing",
        500,
        `GET /listings/${id}`
      );
    }
  },
};

// In components
export function ListingDetail({ listingId }: { listingId: string }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadListing = async () => {
      try {
        const data = await listingService.getById(listingId);
        setListing(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      }
    };

    loadListing();
  }, [listingId]);

  if (error) return <div className="text-content-negative">{error}</div>;
  if (!listing) return <LoadingSpinner />;
  return <div>{listing.listing_name}</div>;
}
```

❌ **Bad:**

```typescript
// Swallowing errors silently
try {
	const listing = await listingService.getById(id);
} catch (error) {
	// Don't do this - error is lost
}

// Generic catch-all without specificity
try {
	// ...
} catch (error) {
	console.error("Something went wrong");
}

// Mixing error types without clarity
if (typeof error === "string") {
	setError(error);
} else if (error && "message" in error) {
	setError(error.message);
}
```

---

## 12. Database Naming Conventions

### Table Names

**Rule:** `UPPER_CASE`, singular noun, descriptive.

✅ **Good:**

```
LISTING        (not LISTINGS)
CATEGORY       (not CATEGORIES)
USER           (not USERS)
REVIEW         (not REVIEWS)
FEEDBACK       (not FEEDBACKS)
ADMIN          (not ADMINS)
```

### Column Names

**Rule:** `snake_case`, descriptive, consistent ID suffix for foreign keys.

| Column Type        | Pattern                                  | Examples                                      |
| :----------------- | :--------------------------------------- | :-------------------------------------------- |
| **Primary Key**    | `${resource}_id`                         | `listing_id`, `user_id`, `review_id`          |
| **Foreign Key**    | `${resource}_id`                         | `category_id`, `user_id`, `listing_id`        |
| **Timestamps**     | `created_at`, `updated_at`, `deleted_at` | —                                             |
| **Boolean fields** | `is_${adjective}`                        | `is_active`, `is_featured`, `is_deleted`      |
| **String fields**  | `snake_case`                             | `listing_name`, `category_type`, `user_email` |

✅ **Good:**

```sql
-- LISTING table
CREATE TABLE LISTING (
  listing_id UUID PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES CATEGORY(category_id),
  created_by_user_id UUID NOT NULL REFERENCES USER(user_id),
  listing_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- REVIEW table
CREATE TABLE REVIEW (
  review_id UUID PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES LISTING(listing_id),
  user_id UUID NOT NULL REFERENCES USER(user_id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---


## Quick Reference

### File **Naming** Cheat Sheet

| Type       | Pattern              | Example          |
| :--------- | :------------------- | :--------------- |
| Components | `PascalCase.tsx`     | `LoginForm.tsx` |
| Hooks      | `use${Name}.ts`      | `useMapStore.ts` |
| Services   | `{feature}.service.ts` | `listing.service.ts`     |
| Utilities  | `camelCase.ts`       | `utils.ts`       |
| Types      | `camelCase.ts`       | `index.ts`       |

### Naming Patterns Cheat Sheet

| Pattern           | Use                  | Example                       |
| :---------------- | :------------------- | :---------------------------- |
| `camelCase`       | Variables, functions | `userName`, `handleClick`     |
| `PascalCase`      | Components, Types    | `Button`, `LoginForm`, `User` |
| `UPPER_CASE`      | Constants            | `PAGE_SIZE`, `MAX_RETRIES`    |
| `kebab-case`      | Routes               | `/login`, `/forgot-password`    |
| `snake_case`      | Database fields      | `user_id`, `listing_name`     |
| `use${Name}`      | Hooks                | `useMapStore`                 |
| `handle${Action}` | Handlers             | `handleClick`, `handleSubmit` |
| `is${Condition}`  | Booleans             | `isLoading`, `isVisible`      |

### Common Prefixes & Suffixes

| Prefix/Suffix       | Purpose          | Examples                             |
| :------------------ | :--------------- | :----------------------------------- |
| `use` (prefix)      | Custom hooks     | `useMapStore`, `useGeolocation`      |
| `handle` (prefix)   | Event handlers   | `handleClick`, `handleChange`        |
| `set` (prefix)      | State setters    | `setEmail`, `setLoading`             |
| `is` (prefix)       | Boolean values   | `isActive`, `isLoading`, `isVisible` |
| `get` (prefix)      | Getter functions | `getUserData`, `getListings`         |
| `on` (prefix)       | Callbacks        | `onSuccess`, `onError`, `onClose`    |
| `Props` (suffix)    | Component props  | `ButtonProps`, `LoginFormProps`      |
| `Request` (suffix)  | API requests     | `CreateListingRequest`               |
| `Response` (suffix) | API responses    | `ListingResponse`                    |
| `_id` (suffix)      | Database IDs     | `listing_id`, `user_id`              |
| `_at` (suffix)      | Timestamps       | `created_at`, `updated_at`           |

---

## Common Pitfalls

### ❌ File Naming

```typescript
// Don't: kebab-case for component files
// File: components/auth/login-form.tsx
export function LoginForm() { ... }

// Do: PascalCase for component files
// File: components/auth/LoginForm.tsx
export function LoginForm() { ... }
```

### ❌ Type Naming

```typescript
// Don't: Use I or T prefix
interface IUser { ... }
type TListingResponse = { ... };

// Do: No prefix, meaningful name
interface User { ... }
type ListingResponse = { ... };
```

### ❌ Database Field Names

```typescript
// Don't: Mixed conventions
interface Listing {
	id: string; // Ambiguous
	userId: string; // Should be snake_case
	created: Date; // Incomplete
	updatedDate: Date; // Mixed naming
}

// Do: Consistent snake_case with clear intent
interface Listing {
	listing_id: string;
	user_id: string;
	created_at: Date;
	updated_at: Date;
}
```

### ❌ Variable Naming

```typescript
// Don't: Unclear abbreviations or generic names
const d = data;
const u = user;
const x = calculateResult();
const cb = handleClick;

// Do: Clear, descriptive names
const userData = data;
const currentUser = user;
const calculatedTotal = calculateResult();
const handleClick = () => { ... };
```

### ❌ Hardcoded Values

```typescript
// Don't: Magic numbers and strings
const button = document.querySelectorAll("div")[0];
setTimeout(() => {
	loadData();
}, 3000);
if (userLevel > 5) {
	grantAccess();
}

// Do: Named constants
const PRIMARY_CONTAINER = document.querySelector(".primary-container");
const RETRY_DELAY_MS = 3000;
const ADMIN_LEVEL_THRESHOLD = 5;

setTimeout(() => {
	loadData();
}, RETRY_DELAY_MS);
if (userLevel > ADMIN_LEVEL_THRESHOLD) {
	grantAccess();
}
```

### ❌ Component Props

```typescript
// Don't: Generic prop names
interface FormProps {
	data: any;
	onSubmit: (data: any) => void;
	items: any[];
}

// Do: Specific, typed prop names
interface LoginFormProps {
	initialEmail?: string;
	onSubmitSuccess: (user: User) => void;
	errors?: ValidationError[];
}
```

---

## Examples in Context

### Complete Component Example

```typescript
// File: components/auth/login-form.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import type { User } from "@/types";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"form"> {
  onSuccess?: (user: User) => void;
}

/**
 * Login form component with email/password authentication.
 * @param onSuccess - Callback fired on successful login
 */
export function LoginForm({ onSuccess, className, ...props }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await authService.login(email, password);
      onSuccess?.(user);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-m p-l", className)}
      {...props}
    >
      {error && (
        <div className="bg-surface-negative-subtle text-content-negative p-m rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-m font-medium mb-s">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-m py-s border border-stroke-primary rounded-md"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-m font-medium mb-s">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-m py-s border border-stroke-primary rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-surface-brand text-content-inverse-primary py-m rounded-md hover:bg-surface-brand-hover disabled:opacity-50"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

### Complete Service Example

```typescript
// File: services/listing.service.ts
import { supabase } from "@/lib/supabase/client";
import type { Listing, CreateListingRequest, ListingFilters } from "@/types";
import { NotFoundError, ApiError } from "@/lib/errors";

const LISTINGS_TABLE = "LISTING";
const PAGE_SIZE = 50;

/**
 * Service for managing listings.
 * Handles all CRUD operations and queries related to property listings.
 */
export const listingService = {
	/**
	 * Fetches all listings with optional filtering and pagination.
	 * @param filters - Filter criteria (category, status, etc.)
	 * @param limit - Maximum results per page
	 * @param offset - Pagination offset
	 * @returns Array of listings
	 */
	async getAll(
		filters?: ListingFilters,
		limit = PAGE_SIZE,
		offset = 0,
	): Promise<Listing[]> {
		try {
			let query = supabase.from(LISTINGS_TABLE).select("*");

			if (filters?.category) {
				query = query.eq("category_id", filters.category);
			}

			const { data, error } = await query
				.limit(limit)
				.offset(offset)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data || [];
		} catch (error) {
			throw new ApiError("Failed to fetch listings", 500, "GET /listings");
		}
	},

	/**
	 * Fetches a single listing by ID.
	 * @param listingId - The listing ID
	 * @returns The listing object
	 * @throws NotFoundError if listing doesn't exist
	 */
	async getById(listingId: string): Promise<Listing> {
		try {
			const { data, error } = await supabase
				.from(LISTINGS_TABLE)
				.select("*")
				.eq("listing_id", listingId)
				.single();

			if (error || !data) {
				throw new NotFoundError("Listing", listingId);
			}

			return data;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			throw new ApiError(
				"Failed to fetch listing",
				500,
				`GET /listings/${listingId}`,
			);
		}
	},

	/**
	 * Creates a new listing.
	 * @param listing - Listing data to create
	 * @returns The created listing
	 */
	async create(listing: CreateListingRequest): Promise<Listing> {
		try {
			const { data, error } = await supabase
				.from(LISTINGS_TABLE)
				.insert([listing])
				.select()
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			throw new ApiError("Failed to create listing", 400, "POST /listings");
		}
	},

	/**
	 * Updates an existing listing.
	 * @param listingId - The listing ID
	 * @param updates - Partial listing data to update
	 * @returns The updated listing
	 */
	async update(listingId: string, updates: Partial<Listing>): Promise<Listing> {
		try {
			const { data, error } = await supabase
				.from(LISTINGS_TABLE)
				.update(updates)
				.eq("listing_id", listingId)
				.select()
				.single();

			if (error) throw error;
			if (!data) throw new NotFoundError("Listing", listingId);

			return data;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			throw new ApiError(
				"Failed to update listing",
				400,
				`PATCH /listings/${listingId}`,
			);
		}
	},

	/**
	 * Deletes a listing by ID.
	 * @param listingId - The listing ID
	 * @throws NotFoundError if listing doesn't exist
	 */
	async delete(listingId: string): Promise<void> {
		try {
			const { error } = await supabase
				.from(LISTINGS_TABLE)
				.delete()
				.eq("listing_id", listingId);

			if (error) throw error;
		} catch (error) {
			throw new ApiError(
				"Failed to delete listing",
				400,
				`DELETE /listings/${listingId}`,
			);
		}
	},
};
```

### Complete Hook Example

```typescript
// File: hooks/useListings.ts
import { useState, useEffect, useCallback } from "react";
import { listingService } from "@/services/listing.service";
import type { Listing, ListingFilters } from "@/types";

interface UseListingsOptions {
	filters?: ListingFilters;
	limit?: number;
}

interface UseListingsReturn {
	listings: Listing[];
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing listings.
 * Handles loading states, error handling, and pagination.
 * @param options - Configuration options
 * @returns Listings data, loading state, error, and refetch function
 */
export function useListings({
	filters,
	limit = 50,
}: UseListingsOptions = {}): UseListingsReturn {
	const [listings, setListings] = useState<Listing[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchListings = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const data = await listingService.getAll(filters, limit, 0);
			setListings(data);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to load listings";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, [filters, limit]);

	useEffect(() => {
		fetchListings();
	}, [fetchListings]);

	return {
		listings,
		isLoading,
		error,
		refetch: fetchListings,
	};
}
```

---

## File Locations

- **ESLint Config:** [eslint.config.mjs](eslint.config.mjs)
- **Next.js Config:** [next.config.ts](next.config.ts)
- **PostCSS Config:** [postcss.config.mjs](postcss.config.mjs)
- **Tailwind Config:** [tailwind.config.ts](tailwind.config.ts)
- **TypeScript Config:** [tsconfig.json](tsconfig.json)
- **App Layout:** [app/layout.tsx](app/layout.tsx)
- **Global Styles:** [app/globals.css](app/globals.css)
- **Utilities:** [lib/utils.ts](lib/utils.ts)
- **Supabase Client:** [lib/supabase/client.ts](lib/supabase/client.ts)
- **Supabase Config:** [supabase/config.toml](supabase/config.toml)
- **Types:** [types/index.ts](types/index.ts)
- **Components Registry:** [components.json](components.json)
- **Proxy Helpers:** [proxy.ts](proxy.ts)

---

## Summary

**Conventions at a Glance:**

- 📄 **Files:** `PascalCase.tsx` for components, `useHookName.ts` for hooks, `{feature}.service.ts` for services
- 🔤 **Variables:** `camelCase` for all, `UPPER_CASE` for constants
- 📝 **Types:** `PascalCase` (no prefix), `${ComponentName}Props` for component props
- 🎨 **Components:** Export as `PascalCase`, file as `kebab-case`
- 📦 **Organization:** Feature-based folders with clear responsibilities
- 🔌 **Data:** Supabase + services layer, RLS-driven access
- 💾 **Database:** `UPPER_CASE` tables, `snake_case` columns, `_id` suffix for IDs
- 📚 **Docs:** JSDoc for public APIs, inline comments for complex logic
- ❌ **Errors:** Custom error classes with clear names
- 🔗 **Git:** `type(scope): subject` commits, `type/description` branches

---

This guide works alongside [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). For design tokens and styling conventions, refer to that document.
