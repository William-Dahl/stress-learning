/** @jsxImportSource @emotion/react */
import payload from "payload";

import {
	processparticipantData,
	PutAveragesInDatabase,
} from "../../utils/serverUtils";

export default function ProcessGroupDataPage() {
	return (
		<div
			css={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
				gap: "20px",
			}}
		>
			<h1 className="text-2xl">Data generated!</h1>
			<a href="/analytics/group-comparison">
				Click here to go to the group comparison page
			</a>
		</div>
	);
}

export async function getServerSideProps() {
	const participantDataResponse = await payload.find({
		collection: "participantData",
		limit: 200,
		where: {
			experimentData: {
				equals: true,
			},
		},
	});

	for (const user of participantDataResponse.docs) {
		const existingUserAverages = await payload.find({
			collection: "eventAverages",
			limit: 10,
			where: {
				userId: {
					equals: user.id,
				},
			},
		});

		if (existingUserAverages.docs && existingUserAverages.docs.length > 0)
			continue;

		const [GSRAverages, ECGAverages] = await processparticipantData(
			user.id
		);

		await PutAveragesInDatabase(GSRAverages, user.id);
		await PutAveragesInDatabase(ECGAverages, user.id);
	}

	return { props: {} };
}
