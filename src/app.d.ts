import type { User } from '$lib/types/user.type';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			status: number;
			message: string;
		}
		interface Locals {
			user: User;
			// auth: RequestEvent['locals']['auth'];
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
