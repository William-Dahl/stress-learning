import { CollectionConfig } from "payload/types";

// Example Collection - For reference only, this must be added to payload.config.ts to be used.
const PhysiologicalData: CollectionConfig = {
	slug: "PhysiologicalData",
	access: {
		read: () => true,
	},
	upload: {
		staticURL: "/PhysiologicalData",
		staticDir: "PhysiologicalData",
		mimeTypes: ["text/csv"],
	},
	fields: [],
};

export default PhysiologicalData;
