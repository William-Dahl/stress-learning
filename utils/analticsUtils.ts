import qs from "qs";

export const GetData = async (query, collection) => {
	try {
		const stringifiedQuery = qs.stringify(
			{
				where: query,
				limit: 100,
			},
			{ addQueryPrefix: true }
		);

		const req = await fetch(`/api/${collection}${stringifiedQuery}`);
		const res = await req.json();
		// if (!res.message) console.error(res);
		return res;
	} catch (err) {
		console.error(err);
		return err;
	}
};

export type Field = {
	name: string;
	units: string;
};

export type Point = {
	[key: string]: number;
};

export type GraphData = {
	points: Point[];
	timestampKey: string;
	fields: Field[];
};

export const calculateRollingAverage = (
	points: Point[],
	windowSize: number
): Point[] => {
	if (points.length === 0 || windowSize <= 0) {
		return [];
	}

	const rollingAverages: Point[] = [];

	let count = 0; // Initialize count to 0
	let sum: Point = {};

	for (let i = 0; i < points.length; i++) {
		const currentPoint = points[i];

		for (const key in currentPoint) {
			if (!sum[key]) {
				sum[key] = 0;
			}
			sum[key] += currentPoint[key];
		}

		count += 1; // Increment count

		if (count >= windowSize) {
			const rollingAverage: Point = {};

			for (const key in sum) {
				const average = sum[key] / count;
				rollingAverage[key] = Math.round(average * 100) / 100; // round to 2 decimal places;
			}

			rollingAverages.push(rollingAverage);

			sum = {};
			count = 0; // Reset count
		}
	}

	if (count != 0) {
		const rollingAverage: Point = {};

		for (const key in sum) {
			rollingAverage[key] = sum[key] / count;
		}

		rollingAverages.push(rollingAverage);
	}

	return rollingAverages;
};

const extractLineFields = (line: string) =>
	line
		.replace("\r", "")
		.split(",")
		.filter((str) => str !== "");

export const processCSVFile = (
	contents: string,
	startTime: Date,
): GraphData => {
	const lines = contents.split("\n");
	const header = extractLineFields(lines[0]);
	const units = extractLineFields(lines[1]);

	const timestamp = header.find((name) => name.includes("Timestamp"));

	const fieldsData = header
		.map((headerName, i) => {
			return {
				name: headerName,
				units: units[i],
			} as Field;
		})
		.filter((f) => !f.name.includes("Timestamp") && f.units != "no_units");

	const parsedData: Point[] = [];

	for (let i = 2; i < lines.length; i++) {

		if (lines[i].trim() === "") {
			continue
		}

		const line = lines[i].split(",");
		const item: Point = {};

		for (let j = 0; j < header.length; j++) {
			const key = header[j].trim();
			const value = line[j].trim();

			if (key.includes("Timestamp")) {
				const date = new Date(Math.trunc(Number(value)));

				const seconds: number =
					(date.getTime() - startTime.getTime()) / 1000;

				item[key] = Math.trunc(seconds);
			} else item[key] = Number(value);
		}
		parsedData.push(item);
	}

	const rollingWindowSize = calculateRollingWindowSize(lines.length - 2)

	const averagedData = calculateRollingAverage(parsedData, rollingWindowSize);

	const dataWithTransformedTime = transformTime(averagedData);

	return {
		points: dataWithTransformedTime,
		timestampKey: timestamp,
		fields: fieldsData,
	};
};

const transformTime = (data: Point[]): Point[] => {
	const transformedData: Point[] = [];
	for (let i = 0; i < data.length; i++) {
		const currentPoint = data[i];

		const newPoint: Point = {};

		let isPositive = true;

		for (const key in currentPoint) {
			if (key.includes("Timestamp")) {
				const seconds = currentPoint[key];

				if (seconds < 0) isPositive = false;

				const minutes = seconds / 60;

				newPoint[key] = Math.round(minutes * 100) / 100; // round to 2 decimal places
			} else newPoint[key] = currentPoint[key];
		}

		if (isPositive) transformedData.push(newPoint);
	}

	return transformedData;
};

export const matchAnswersToEvents = async (eventData, userId) => {
	const answerData = await GetData(
		{
			userId: {
				equals: userId,
			},
		},
		"userAnswers"
	);

	if (!answerData.docs) return eventData;

	for (const index in eventData) {
		const currentEvent = eventData[index];

		const answer = answerData.docs.find(
			(a) => a.questionNumber == currentEvent.module
		);

		currentEvent.answer = answer;
	}
	return eventData;
};

export const addQuestionTypeToEvents = async (eventData) => {
	const questions = await GetData({}, "questions");

	for (const index in eventData) {
		const currentEvent = eventData[index];

		if (!currentEvent.module) continue;

		const question = questions.docs.find(
			(q) => q.questionNumber == currentEvent.module
		);

		currentEvent.type = question.questionType;
	}
	return eventData;
};

export const processCloseEvents = (eventData) => {
	eventData[0].raised = false;
	let prev = eventData[0];

	for (let i = 1; i < eventData.length; i++) {
		const currentEvent = eventData[i];
		const currentTime = new Date(currentEvent.time * 1000);
		const prevTime = new Date(prev.time * 1000);

		const diff = (currentTime.getTime() - prevTime.getTime()) / 1000;

		if (diff < 10) {
			currentEvent.raised = !prev.raised;
		} else currentEvent.raised = false;

		prev = currentEvent;
	}
	return eventData;
};

const calculateRollingWindowSize = (length) => Math.ceil(length / 600);