/** @jsxImportSource @emotion/react */
import payload from "payload";
import { css } from "@emotion/react";
import PageHeader from "@atlaskit/page-header";
import dynamic from "next/dynamic";

import { CalculateTimeTakenAverages } from "../../utils/serverUtils";
import { processAverages } from "../../utils/analyticsUtils";

import {
	BarChart as RechartsBarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ReferenceLine,
} from "recharts";
import router from "next/router";
import Button from "@atlaskit/button";

const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
	ssr: false,
}) as typeof RechartsBarChart;

export default function GroupComparisonPage({ averageData, averageTimeTaken }) {
	return (
		<div className="p-8 flex gap-6 flex-col justify-start min-h-screen">
			<div className="-mt-6">
				<PageHeader
					breadcrumbs={
						<a href="/analytics" css={homeLinkStyles}>
							Back
						</a>
					}
				>
					Group comparison
				</PageHeader>
				<span css={subtitleStyles}>
					View a comparison of the data from the control and stress
					groups
				</span>
				<Button
					onClick={() => router.push(`/analytics/processGroupData`)}
				>
					Generate grouped data
				</Button>
			</div>
			<h2 className="text-lg font-bold">Time differences:</h2>
			<div>
				<BarChart
					width={1000}
					height={500}
					data={averageTimeTaken}
					margin={{
						top: 5,
						right: 50,
						left: 100,
						bottom: 5,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="Question" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey="Stress" fill="#8884d8" />
					<Bar dataKey="Control" fill="#82ca9d" />
				</BarChart>
			</div>
			{averageData.fields.map((f) => {
				return (
					<div
						key={f.name}
						css={{
							overflow: "scroll",
						}}
					>
						<h2>
							<p className="text-lg font-bold">Field:</p>
							{f.name}
							<p className="text-lg font-bold">Units: </p>
							{f.units}
						</h2>
						<BarChart
							width={2000}
							height={600}
							data={averageData.values[f.name]}
							margin={{
								top: 50,
								right: 50,
								left: 100,
								bottom: 5,
							}}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="event" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar dataKey="Stress" fill="#8884d8" />
							<Bar dataKey="Control" fill="#82ca9d" />
							<ReferenceLine
								y={averageData.baselines[f.name]["Control"]}
								stroke="red"
								isFront={true}
								label={{
									position: "left",
									value: "Control Baseline",
									fontSize: 20,
									fill: "red",
								}}
							/>
							<ReferenceLine
								y={averageData.baselines[f.name]["Stress"]}
								stroke="blue"
								isFront={true}
								label={{
									position: "left",
									value: "Stress Baseline",
									fontSize: 20,
									fill: "blue",
								}}
							/>
						</BarChart>
					</div>
				);
			})}
		</div>
	);
}

const homeLinkStyles = css({
	color: "#6B778C",
	paddingBottom: "8",
	"&:hover": {
		textDecoration: "underline",
	},
});

const subtitleStyles = css({
	display: "flex",
	color: "#616f86",
	marginTop: -16,
	alignItems: "baseline",
	marginBottom: 20,
});

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

	const userInStressGroupLookup = {};

	for (const user of participantDataResponse.docs) {
		userInStressGroupLookup[Number(user.id)] = user.stress ?? false;
	}

	const averagesResponse = await payload.find({
		collection: "eventAverages",
		limit: 10000,
	});

	const averages = averagesResponse.docs;

	const averageData = processAverages(averages, userInStressGroupLookup);

	const averageTimeTakenReversed = await CalculateTimeTakenAverages();
	const averageTimeTaken = averageTimeTakenReversed.reverse();

	return { props: { averageData, averageTimeTaken } };
}
