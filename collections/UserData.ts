import { CollectionConfig } from "payload/types";

const UserData: CollectionConfig = {
	slug: "userData",
	admin: {
		useAsTitle: "id",
	},
	access: {
		create: () => true,
		read: () => true,
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
		{
			name: "ShimmerGsrData",
			admin: {
				description: "Must be a CSV file",
			},
			type: "upload",
			label: "Shimmer GSR",
			relationTo: "PhysiologicalData",
		},
		{
			name: "ShimmerEcgData",
			admin: {
				description: "Must be a CSV file",
			},
			type: "upload",
			label: "Shimmer ECG",
			relationTo: "PhysiologicalData",
		},
	],
};

export default UserData;
