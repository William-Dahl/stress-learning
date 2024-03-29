import { CollectionConfig } from "payload/types";

const ParticipantData: CollectionConfig = {
	slug: "participantData",
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
			name: "stress",
			label: "Participant is put under stress conditions",
			type: "checkbox"
		},
		{
			name: "experimentData",
			label: "Is a participant from an interview",
			type: "checkbox",
			defaultValue: false
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

export default ParticipantData;
