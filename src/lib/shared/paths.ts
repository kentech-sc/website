import type { ResolvedPathname } from '$app/types';

import { resolve } from '$app/paths';

/**
 * Resolve an internal pathname that is supplied at runtime rather than as a
 * statically known SvelteKit route.
 */
export const resolveInternalPath = resolve as unknown as (pathname: string) => ResolvedPathname;
