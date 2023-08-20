import { buildConfig } from "payload/config";
import Users from "./collections/Users";
import Questions from "./collections/Questions";
import FeatureFlags from "./collections/FeatureFlags";
import UserAnswers from "./collections/UserAnswers";
import UserData from "./collections/UserData";
import dotenv from "dotenv";
import UserEvents from "./collections/UserEvents";
import PhysiologicalData from "./collections/PhysiologicalData";

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
		UserAnswers,
		UserEvents,
		UserData,
		PhysiologicalData,
		// Add Collections here
	],
	// typescript: {
	//   outputFile: path.resolve(__dirname, "payload-types.ts"),
	// },
	// graphQL: {
	//   schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
	// },
});
