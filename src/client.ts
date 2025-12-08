import { BetterAuthClientPlugin } from 'better-auth';
import { universityResolver } from './index.js';

export const universityResolverClient = () => {
  return {
    id: "university-resolver",
    $InferServerPlugin: {} as ReturnType<typeof universityResolver>,
  } satisfies BetterAuthClientPlugin;
};
