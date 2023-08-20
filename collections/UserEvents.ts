import { CollectionConfig } from "payload/types";

const UserEvents: CollectionConfig = {
	slug: "userEvents",
	admin: {
		useAsTitle: "userId",
		defaultColumns: ["userId", "eventType", "module", "time"],
		listSearchableFields: ["userId", "eventType"],
	},
	access: {
		create: () => true,
		read: () => true,
	},
	fields: [
		{
			name: "eventType",
			type: "text",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
		{
			name: "userId",
			type: "text",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
		{
			name: "module",
			type: "number",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
		{
			name: "time",
			type: "number",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
	],
};

export default UserEvents;
