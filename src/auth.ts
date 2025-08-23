import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { GOOGLE_ID, GOOGLE_SECRET, AUTH_SECRET } from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Google({
			clientId: GOOGLE_ID,
			clientSecret: GOOGLE_SECRET
			// authorization: {
			//     params: {
			//         prompt: 'consent',
			//         access_type: 'offline',
			//         response_type: 'code',
			//     },
			// },
		})
	],
	secret: AUTH_SECRET,
	trustHost: true // For Vercel
	// pages: {
	//     signIn: '/u/',
	// }
});
