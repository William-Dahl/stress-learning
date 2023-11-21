import { buildConfig } from "payload/config";
import Users from "./collections/Users";
import Questions from "./collections/Questions";
import FeatureFlags from "./collections/FeatureFlags";
import ParticipantAnswers from "./collections/ParticipantAnswers";
import ParticipantData from "./collections/ParticipantData";
import dotenv from "dotenv";
import ParticipantEvents from "./collections/ParticipantEvents";
import PhysiologicalData from "./collections/PhysiologicalData";
import EventAverages from "./collections/EventAverages";

dotenv.config();

export default buildConfig({
	serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
	admin: {
		user: Users.slug,
	},
	collections: [
		Users,
		Questions,
		FeatureFlags,
		ParticipantAnswers,
		ParticipantEvents,
		ParticipantData,
		PhysiologicalData,
		EventAverages
		// Add Collections here
	],
	// typescript: {
	//   outputFile: path.resolve(__dirname, "payload-types.ts"),
	// },
	// graphQL: {
	//   schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
	// },
});
