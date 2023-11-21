/** @jsxImportSource @emotion/react */
import payload from "payload";
import React, { useState, useEffect, ReactNode, useCallback } from "react";
import {
	Field,
	Point,
	GraphData,
	calculateRollingAverage,
	GetData,
	processCSVFileRollingAverage,
	matchAnswersToEventsOLD,
	processCloseEvents,
	addQuestionTypeToEventsOLD,
	calculateEventAverages,
	matchAnswersToEvents,
	addQuestionTypeToEvents,
	processCSVFile,
	filterOutIntermediateEvents,
} from "../../utils/analyticsUtils";

import { css } from "@emotion/react";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";
import { Label as FormLabel } from "@atlaskit/form";
import Select from "@atlaskit/select";
import PageHeader from "@atlaskit/page-header";
import Button from "@atlaskit/button";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Spinner from "@atlaskit/spinner";
import Image from "next/image";
import CrossIcon from "@atlaskit/icon/glyph/cross";
import Lozenge from "@atlaskit/lozenge";
import TextField from "@atlaskit/textfield";
import Form, { Field as FormField, FormFooter } from "@atlaskit/form";

import { CodeBlock } from "@atlaskit/code";
import dynamic from "next/dynamic";

import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTransition,
	useModal,
} from "@atlaskit/modal-dialog";

import {
	Label,
	LineChart as RechartsLineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ReferenceLine,
} from "recharts";

const LineChart = dynamic(
	() => import("recharts").then((mod) => mod.LineChart),
	{
		ssr: false,
	}
) as typeof RechartsLineChart;

export const Panel = ({
	children,
	testId,
}: {
	children: ReactNode;
	testId?: string;
}) => (
	<div css={panelStyles} data-testid={testId}>
		{children}
	</div>
);

export default function participantAnalyticsPage({
	startEvent,
	processedGSRData,
	processedECGData,
	eventDataWithQuestionType,
	participantData,
}) {
	const startTime = new Date(startEvent.createdAt);

	const [isOpen, setIsOpen] = useState(false);
	const [modalEvent, setModalEvent] = useState(undefined);
	const openModal = useCallback(() => setIsOpen(true), []);
	const closeModal = useCallback(() => setIsOpen(false), []);

	const EventItem = ({ event }) => {
		var date = new Date(event.createdAt);

		const time = date.toTimeString();

		var seconds: number = (date.getTime() - startTime.getTime()) / 1000;
		var minutes: number = 0;
		if (seconds >= 60) {
			minutes = Math.trunc(seconds / 60);
			seconds = Math.trunc(seconds % 60);
		}

		return (
			<div className="bg-white shadow-md rounded p-4 flex gap-8">
				<p className="font-bold">{event.eventType}</p>
				<div className="flex flex-row gap-2">
					<p className="font-bold">Time:</p>
					<p>
						{minutes != 0 && minutes + "m"} {seconds}s
					</p>
				</div>
				{event.eventType != "Start" && (
					<div className="flex flex-row gap-2">
						<p className="font-bold">Question:</p>
						<p>{event.module}</p>
					</div>
				)}
			</div>
		);
	};

	const getEventReferenceLine = (event) => {
		const time = new Date(event.time * 1000);

		const seconds: number = (time.getTime() - startTime.getTime()) / 1000;

		let colour = "black";
		let width = 20;

		let dashed = true;

		let labelVal: string | undefined = undefined;

		switch (event.eventType) {
			case "Start":
				return undefined;
			case "Timeout":
				colour = "#FF5630";
				labelVal = "TO";
				width = 30;
				break;
			case "Navigation: Next":
				colour = "#172B4D";
				labelVal = (event.module + 1).toString();
				dashed = false;
				break;
			case "Answer Submitted":
				colour = "#6554C0";
				labelVal = "S";
				break;
			case "Answer Submitted: Correct":
				colour = "#36B37E";
				labelVal = "Correct";
				width = 60;
				break;
		}

		return (
			<ReferenceLine
				strokeWidth={dashed ? "2" : "1"}
				key={event.id}
				x={seconds / 60}
				strokeDasharray={dashed ? "3 3" : ""}
				stroke={colour}
				label={({ viewBox }) => (
					<CustomLabel
						viewBox={viewBox}
						value={labelVal ? labelVal : ""}
						event={event}
						width={width}
						colour={colour}
					/>
				)}
			/>
		);
	};

	const CustomLabel = ({ viewBox, value, event, width, colour }) => {
		return (
			<foreignObject
				css={{ overflow: "visible" }}
				x={viewBox.x - width / 2}
				y={event.eventType == "Navigation: Next" ? "30" : "0"}
			>
				<div
					css={{
						background: colour,
						color: "white",
						fontSize: "14px",
						width: `${width}px`,
						height: `20px`,
						borderRadius: `4px`,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						margin: "4",
					}}
					onClick={() => {
						setModalEvent(event);
						openModal();
					}}
				>
					{value}
				</div>
			</foreignObject>
		);
	};
	const DataAccordian = ({
		graphData,
		title,
	}: {
		graphData: GraphData;
		title: string;
	}) => {
		return (
			<Accordion defaultExpanded>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1a-content"
					id={`${title} header`}
				>
					<div className="text-lg">{title}</div>
				</AccordionSummary>
				<AccordionDetails>
					<Tabs id="default">
						<div css={{ overflow: "scroll" }}>
							<TabList>
								{graphData.fields.map((f) => (
									<div css={{ minWidth: "20%" }}>
										<Tab key={f.name}>{f.name}</Tab>
									</div>
								))}
							</TabList>
						</div>
						{graphData.fields.map((f) => (
							<TabPanel key={f.name}>
								<div
									css={{
										overflow: "scroll",
									}}
								>
									<h1 className="m-4 text-sm">
										<b>Units:</b>
										<br></br> X-Axis: minutes &emsp;Y-Axis:{" "}
										{f.units}
									</h1>
									<LineChart
										width={7000}
										height={600}
										data={graphData.points}
										key={f.name}
										margin={{
											top: 60,
											bottom: 40,
										}}
									>
										<CartesianGrid />
										<XAxis
											type="number"
											dataKey={graphData.timestampKey}
											scale="time"
										/>
										<YAxis />
										<Tooltip />
										{eventDataWithQuestionType.map(
											(event) =>
												getEventReferenceLine(event)
										)}
										<Line
											type="monotone"
											dataKey={f.name}
											stroke="red"
										/>
									</LineChart>
								</div>
							</TabPanel>
						))}
					</Tabs>
				</AccordionDetails>
			</Accordion>
		);
	};

	const CustomHeader = () => {
		const { onClose, titleId } = useModal();
		return (
			<div
				css={{
					display: "flex",
					padding: "24px",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<div css={{ fontSize: 20, fontWeight: 500 }} id={titleId}>
					Event description
				</div>
				<Button appearance="link" onClick={onClose}>
					<CrossIcon label="Close Modal" primaryColor={"#505F79"} />
				</Button>
			</div>
		);
	};

	const getDurationString = () => {
		const endDate = new Date(eventDataWithQuestionType[0].createdAt);
		var seconds = (endDate.getTime() - startTime.getTime()) / 1000;
		var minutes = 0;
		if (seconds >= 60) {
			minutes = Math.trunc(seconds / 60);
			seconds = Math.trunc(seconds % 60);
		}

		return `${minutes}m ${seconds}s`;
	};

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
					Analytics dashboard
				</PageHeader>
				<span css={subtitleStyles}>
					View the physiological signs overlayed with the events from
					an interview.
				</span>
			</div>
			<ModalTransition>
				{isOpen && (
					<Modal onClose={closeModal} width={"xlarge"}>
						<CustomHeader />
						<ModalBody>
							<table css={{ fontSize: "16px" }}>
								<tbody>
									<tr
										css={{
											height: "30px",
										}}
									>
										<td css={{ width: "160px" }}>
											<b>Event type</b>
										</td>
										<td>{modalEvent.eventType}</td>
									</tr>
									<tr
										css={{
											height: "30px",
										}}
									>
										<td>
											<b>Module Number</b>
										</td>
										<td>{modalEvent.module}</td>
									</tr>
									<tr
										css={{
											height: "30px",
										}}
									>
										<td>
											<b>Module Type</b>
										</td>
										<td>{modalEvent.type}</td>
									</tr>
								</tbody>
							</table>
							<div css={{ marginTop: "20px", fontSize: "16px" }}>
								{modalEvent.answer ? (
									<div>
										<h2
											css={{
												marginBottom: "20px",
												fontSize: "20px",
											}}
										>
											Answer:
										</h2>
										<table>
											<tbody>
												<tr
													css={{
														height: "30px",
													}}
												>
													<td
														css={{
															width: "160px",
														}}
													>
														<b>Attempt</b>
													</td>
													<td
														css={{
															overflowWrap:
																"break-word",
														}}
													>
														{modalEvent.type ==
														"coding" ? (
															<CodeBlock
																language="html"
																showLineNumbers={
																	false
																}
																text={
																	modalEvent
																		.answer
																		.attempt
																}
																shouldWrapLongLines={
																	true
																}
															/>
														) : (
															modalEvent.answer
																.attempt
														)}
													</td>
												</tr>
												<tr
													css={{
														height: "30px",
													}}
												>
													<td>
														<b>Attempt count</b>
													</td>
													<td>
														{
															modalEvent.answer
																.attemptCount
														}
													</td>
												</tr>
												<tr
													css={{
														height: "30px",
													}}
												>
													<td>
														<b>Gave up</b>
													</td>
													<td>
														<Lozenge
															appearance={
																modalEvent
																	.answer
																	.gaveUp
																	? "removed"
																	: "success"
															}
															isBold
														>
															{modalEvent.answer.gaveUp.toString()}
														</Lozenge>
													</td>
												</tr>
												<tr
													css={{
														height: "30px",
													}}
												>
													<td>
														<b>Time spent</b>
													</td>
													<td>
														{
															modalEvent.answer
																.timeSpent
														}
														s
													</td>
												</tr>
												<tr
													css={{
														height: "30px",
													}}
												>
													<td>
														<b>Timed out</b>
													</td>
													<td>
														<Lozenge
															appearance={
																modalEvent
																	.answer
																	.timedOut
																	? "removed"
																	: "success"
															}
															isBold
														>
															{modalEvent.answer.timedOut.toString()}
														</Lozenge>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								) : (
									<div>There was no answer submitted</div>
								)}
							</div>
						</ModalBody>
						<ModalFooter></ModalFooter>
					</Modal>
				)}
			</ModalTransition>
			<div className="flex flex-col gap-4">
				<div css={{ fontSize: "16px" }}>
					<div>
						<h2
							css={{
								marginBottom: "20px",
								fontSize: "20px",
							}}
						>
							Interview Information:
						</h2>
						<table>
							<tbody>
								<tr
									css={{
										height: "30px",
									}}
								>
									<td
										css={{
											width: "160px",
										}}
									>
										<b>Time</b>
									</td>
									<td>{startTime.toString().slice(0, 24)}</td>
								</tr>
								<tr
									css={{
										height: "30px",
									}}
								>
									<td
										css={{
											width: "160px",
										}}
									>
										<b>App version</b>
									</td>
									<td>{participantData.appVersion}</td>
								</tr>
								<tr
									css={{
										height: "30px",
									}}
								>
									<td
										css={{
											width: "160px",
										}}
									>
										<b>Duration</b>
									</td>
									<td>{getDurationString()}</td>
								</tr>
								<tr
									css={{
										height: "30px",
									}}
								>
									<td
										css={{
											width: "160px",
										}}
									>
										<b>Data Uploaded</b>
									</td>
									<td>
										<Lozenge
											appearance={
												processedGSRData !== null &&
												processedECGData !== null
													? "success"
													: "removed"
											}
											isBold
										>
											{(
												processedGSRData !== null &&
												processedECGData !== null
											).toString()}
										</Lozenge>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				{processedGSRData && (
					<DataAccordian
						graphData={processedGSRData}
						title="GSR Data"
					/>
				)}
				{processedECGData && (
					<DataAccordian
						graphData={processedECGData}
						title="ECG Data"
					/>
				)}
				{/* <ul className="flex flex-col gap-4">
					{eventDataWithQuestionType.map((event) => (
						<li key={event.id}>
							<EventItem event={event} />
						</li>
					))}
				</ul> */}
			</div>
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
});

const panelStyles = css({
	display: "flex",
	marginTop: "16px",
	marginBottom: "8px",
	padding: "32px",
	alignItems: "center",
	justifyContent: "center",
	flexDirection: "column",
	flexGrow: 1,
	backgroundColor: "#f1f2f4",
	borderRadius: "3px",
	color: "#616f86",
});

export async function getServerSideProps({ params }) {
	const userId = Number(params.id);

	const eventDataResponse = await payload.find({
		collection: "participantEvents",
		limit: 200,
		where: {
			userId: {
				equals: userId,
			},
		},
	});

	const eventData = eventDataResponse.docs;

	const participantDataResponse = await payload.find({
		collection: "participantData",
		limit: 1,
		where: {
			id: {
				equals: userId,
			},
		},
	});

	const participantData = participantDataResponse.docs[0];

	const startEvent = eventData.find((event) => event.eventType == "Start");

	const startTime = new Date(startEvent.createdAt);

	const participantAnswersResponse = await payload.find({
		collection: "participantAnswers",
		limit: 100,
		where: {
			userId: {
				equals: userId,
			},
		},
	});

	const eventDataWithAnswers = matchAnswersToEvents(
		participantAnswersResponse.docs,
		eventData
	);

	const questionAPIResponse = await payload.find({
		collection: "questions",
		limit: 100,
	});

	const eventDataWithQuestionType = addQuestionTypeToEvents(
		questionAPIResponse.docs,
		eventDataWithAnswers
	);

	const GSRDataUrl = participantData.ShimmerGsrData?.url;

	let processedGSRData: GraphData | null = null;

	if (GSRDataUrl) {
		try {
			const GSRdata = await fetch(GSRDataUrl).then((response) =>
				response.text()
			);

			processedGSRData = processCSVFileRollingAverage(GSRdata, startTime);
		} catch {}
	}

	const ECGDataURL = participantData.ShimmerEcgData?.url;

	let processedECGData: GraphData | null = null;

	if (ECGDataURL) {
		try {
			const ECGData = await fetch(ECGDataURL).then((response) =>
				response.text()
			);

			processedECGData = processCSVFileRollingAverage(ECGData, startTime);
		} catch {}
	}

	return {
		props: {
			startEvent,
			processedGSRData,
			processedECGData,
			eventDataWithQuestionType,
			participantData,
		},
	};
}
