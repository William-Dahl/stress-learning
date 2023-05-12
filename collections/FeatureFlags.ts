import { CollectionConfig } from "payload/types";

// Example Collection - For reference only, this must be added to payload.config.ts to be used.
const FeatureFlags: CollectionConfig = {
  slug: "featureFlags",
  admin: {
    useAsTitle: "feature",
    defaultColumns: ["feature", "on", "description"],
    description: "Edit features available on the application",
  },
  access: {
    create: ({ req: { user } }) => user.email == process.env.ADMIN_EMAIL,
    delete: ({ req: { user } }) => user.email == process.env.ADMIN_EMAIL,
  },
  fields: [
    {
      name: "feature",
      type: "text",
      required: true,
      access: {
        update: ({ req: { user } }) => user.email == process.env.ADMIN_EMAIL,
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      access: {
        update: ({ req: { user } }) => user.email == process.env.ADMIN_EMAIL,
      },
    },
    {
      name: "on",
      label: "Turned on",
      type: "checkbox",
      required: true,
    },
  ],
};

export default FeatureFlags;
