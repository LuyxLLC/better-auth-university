import { BetterAuthPlugin } from 'better-auth';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { mergeSchema } from 'better-auth/db';
import { getSchema } from './schema.js';

export interface University {
  id: string;
  name: string;
  domain: string;
}

export interface UniversityData {
  name: string;
  domains: string[];
  web_pages: string[];
  country: string;
  alpha_two_code: string;
  "state-province": string | null;
}

export interface UniversityResolverOptions {
  universities: UniversityData[];
  /**
   * List of allowed email domains or extensions.
   * 
   * Examples: ['.edu', '.ac.uk', 'mit.edu']
   * If not provided, defaults to ['.edu'].
   * 
   * Pass `['*']` to allow all domains.
   */
  allowedEmailDomains?: string[];
}

export const universityResolver = (options: UniversityResolverOptions): BetterAuthPlugin => {
  const allowedDomains = options.allowedEmailDomains || ['.edu'];
  const allowAll = allowedDomains.includes('*');

  return {
    id: 'university-resolver',
    schema: mergeSchema(getSchema()),
    hooks: {
      before: [
        {
          matcher: (context) => {
            return context.path === '/sign-up/email';
          },
          handler: createAuthMiddleware(async (context) => {
            const { email } = context.body;

            if (!email || typeof email !== 'string') {
              return;
            }

            if (!allowAll) {
              const isValid = allowedDomains.some(domain => email.endsWith(domain));

              if (!isValid) {
                throw new APIError("BAD_REQUEST", {
                  message: `Email must end with one of the following: ${allowedDomains.join(', ')}`
                });
              }
            }

            const emailDomain = email.split('@')[1];
            const adapter = context.context.adapter;

            let university = await adapter.findOne<University>({
              model: "university",
              where: [
                {
                  field: "domain",
                  value: emailDomain
                }
              ]
            });

            if (!university) {
              const found = options.universities.find(university => university.domains.includes(emailDomain));

              if (found) {
                university = await adapter.create<University>({
                  model: "university",
                  data: {
                    name: found.name,
                    domain: emailDomain,
                  }
                });
              } else {
                university = await adapter.create<University>({
                  model: "university",
                  data: {
                    name: emailDomain,
                    domain: emailDomain,
                  }
                });
              }
            }

            if (university) {
              context.body.universityId = university.id;
            }
          })
        }
      ]
    },
  };
};
