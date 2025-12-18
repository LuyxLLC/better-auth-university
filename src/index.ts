import { BetterAuthPlugin } from 'better-auth';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { mergeSchema } from 'better-auth/db';
import { getSchema } from './schema.js';

export interface University {
  id: string;
  name: string;
  domain: string;
  slug: string;
}

export interface UniversityData {
  name: string;
  domains: string[];
  web_pages: string[];
  country: string;
  alpha_two_code: string;
  "state-province": string | null;
  slug: string;
}

export interface UniversityResolverOptions {
  /**
   * List of universities to use for resolving email domains.
   */
  universities: UniversityData[];
  /**
   * Disabling domain restrictions allows any email domain to be used
   * for sign-up, even if it is not in the provided list of universities.
   * 
   * Defaults to `true`.
   */
  enforceUniversityDomain?: boolean;
}

export const universityResolver = ({ universities, enforceUniversityDomain = true }: UniversityResolverOptions): BetterAuthPlugin => {
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

            const emailDomain = email.split('@')[1];
            const universityRecord = universities.find(university => university.domains.includes(emailDomain));

            if (!universityRecord) {
              if (enforceUniversityDomain) {
                throw new APIError("BAD_REQUEST", {
                  message: 'Email domain does not belong to a recognized university.',
                  code: 'UNIVERSITY_DOMAIN_NOT_ALLOWED',
                });
              } else {
                return;
              }
            }

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
              university = await adapter.create<University>({
                model: "university",
                data: {
                  name: universityRecord.name,
                  domain: emailDomain,
                  slug: universityRecord.slug,
                }
              });
            }

            context.body.universityId = university.id;
          })
        }
      ]
    },
  };
};
