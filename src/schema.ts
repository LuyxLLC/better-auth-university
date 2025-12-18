import type { BetterAuthPluginDBSchema } from "better-auth";

export const getSchema = () => {
  return {
    user: {
      fields: {
        universityId: {
          type: "string",
          required: false,
          defaultValue: null,
          returned: true,
          references: {
            model: "university",
            field: "id",
          },
        },
      },
    },
    university: {
      fields: {
        name: {
          type: "string",
          required: true,
          returned: true,
        },
        domain: {
          type: "string",
          required: true,
          unique: true,
          returned: true,
        },
        slug: {
          type: "string",
          required: true,
          unique: true,
          returned: true,
        },
      },
    },
  } satisfies BetterAuthPluginDBSchema;
};
