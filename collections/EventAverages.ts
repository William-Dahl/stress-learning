import { CollectionConfig } from "payload/types";

const EventAverages: CollectionConfig = {
	slug: "eventAverages",
	fields: [
		{
			name: "userId",
			type: "number",
		},
		{
			name: "value",
			type: "number",
		},
		{
			name: "eventType",
			type: "text",
		},
		{
			name: "fieldName",
			type: "text",
		},
		{
			name: "fieldUnits",
			type: "text",
		},
	],
};

export default EventAverages;
