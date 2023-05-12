import { CollectionConfig } from "payload/types";

const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  access: {
    read: ({ req: { user } }) => user.email == process.env.ADMIN_EMAIL,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
};

export default Users;
