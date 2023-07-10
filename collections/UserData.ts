import { CollectionConfig } from "payload/types";

const UserData: CollectionConfig = {
	slug: "userData",
	admin: {
		useAsTitle: "id",
	},
	access: {
		create: () => true,
	},
	fields: [
		{
			name: "id",
			type: "number",
			unique: true,
		},
		{
			name: "appVersion",
			type: "text",
		},
	],
};

export default UserData;
