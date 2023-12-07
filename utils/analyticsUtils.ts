import qs from "qs";
import _ from "lodash";

// Function to query the API.
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

// Used to parse the Physiological data csv file, while additionally applying a rolling average to reduce data points.
export const processCSVFileRollingAverage = (
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

	const skinConductanceField = fieldsData.find(f => f.name === "Shimmer_1B20_GSR_Skin_Resistance_CAL")

	let modifiedDataPoints = parsedData;

	if (skinConductanceField) {
		const cutoffFrequency = 0.10; // Adjust this value based on your requirements
		const samplingRate = 1; // Adjust this value based on your data
		const result = splitTonicPhasic(parsedData, cutoffFrequency, samplingRate);

		
		modifiedDataPoints = addTonicPhasicToDataPoints(parsedData, result.tonicComponent, result.phasicComponent);
		
		fieldsData.push({
			name: "TonicComponent",
			units: skinConductanceField.units
		},
		{ 
			name: "PhasicComponent",
			units: skinConductanceField.units
		});
	}

	const rollingWindowSize = calculateRollingWindowSize(lines.length - 2)

	const averagedData = calculateRollingAverage(modifiedDataPoints, rollingWindowSize);

	const dataWithTransformedTime = transformTime(averagedData);

	return {
		points: dataWithTransformedTime,
		timestampKey: timestamp,
		fields: fieldsData,
	};
};

function addTonicPhasicToDataPoints(dataPoints, tonicComponent, phasicComponent) {
	// Ensure the data is sorted by timestamp
	dataPoints.sort((a, b) => a.Shimmer_1B20_TimestampSync_Unix_CAL - b.Shimmer_1B20_TimestampSync_Unix_CAL);
  
	// Add tonic and phasic components to each data point
	for (let i = 0; i < dataPoints.length; i++) {
	  dataPoints[i].TonicComponent = tonicComponent[i];
	  dataPoints[i].PhasicComponent = phasicComponent[i];
	}
  
	return dataPoints;
  }

// Creating two extra data fields for the tonic and phasic components of the GSR physiological data.
function splitTonicPhasic(dataPoints, cutoffFrequency, samplingRate) {
	// Ensure the data is sorted by timestamp
	dataPoints.sort((a, b) => a.Shimmer_1B20_TimestampSync_Unix_CAL - b.Shimmer_1B20_TimestampSync_Unix_CAL);
  
	const gsrData = dataPoints.map(point => point.Shimmer_1B20_GSR_Skin_Conductance_CAL);
	
	// Calculate the time difference between data points
	const timeDifferences = dataPoints.map((point, index) => {
	  if (index === 0) {
		return 0;
	  } else {
		return point.Shimmer_1B20_TimestampSync_Unix_CAL - dataPoints[index - 1].Shimmer_1B20_TimestampSync_Unix_CAL;
	  }
	});
  
	// Calculate the cumulative time
	const cumulativeTime = timeDifferences.reduce((acc, time) => {
	  acc.push(acc[acc.length - 1] + time);
	  return acc;
	}, [0]);
  
	// Calculate the low-pass filter coefficients
	const RC = 1.0 / (2 * Math.PI * cutoffFrequency);
	const alpha = 1.0 / (RC * samplingRate);
	const dt = 1.0 / samplingRate;
	const filterCoefficient = alpha / (alpha + dt);
  
	// Initialize variables for filtering
	let tonicComponent = 0;
	let filteredData = [];
  
	// Apply low-pass filter to obtain tonic component
	for (let i = 0; i < gsrData.length; i++) {
	  tonicComponent = filterCoefficient * gsrData[i] + (1 - filterCoefficient) * tonicComponent;
	  filteredData.push(tonicComponent);
	}
  
	// Calculate phasic component by subtracting tonic component from the original signal
	const phasicData = gsrData.map((value, index) => value - filteredData[index]);
  
	return {
	  tonicComponent: filteredData,
	  phasicComponent: phasicData,
	  cumulativeTime: cumulativeTime,
	};
}

// Used to parse the raw CSV file to generate the GraphData data type used to display the data on the screen.
// Does not apply a rolling average and is used when analysing the group data, as we do not display the data as line graphs in
// groups as we do with individual analysis, therefore the datapoints do not need to be reduced.
export const processCSVFile = (
	contents: string
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
			
			item[key] = Number(value);
		}
		parsedData.push(item);
	}

	return {
		points: parsedData,
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

export const matchAnswersToEvents = (participantAnswers, eventData) => {
	if (!participantAnswers) return eventData;

	for (const index in eventData) {
		const currentEvent = eventData[index];

		const answer = participantAnswers.find(
			(a) => a.questionNumber == currentEvent.module
		) ?? null;

		currentEvent.answer = answer;
	}
	return eventData;
};

type EventDataWithQuestionType = {
	answer: {
	  id: string;
	  attempt: string;
	  userId: string;
	  attemptCount: number;
	  gaveUp: boolean;
	};
	createdAt: string;
	eventType: string;
	id: string;
	module: number;
	time: number;
	type: string;
	updatedAt: string;
	userId: string;
  };
  

export const addQuestionTypeToEvents = (questions, eventData): EventDataWithQuestionType[] => {
	for (const index in eventData) {
		const currentEvent = eventData[index];

		if (!currentEvent.module) continue;

		const question = questions.find(
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

export type EventPhysiologicalData = {
	eventType: string;
	field: Field;
	value: number;
}

export const calculateEventAverages = (eventData: EventDataWithQuestionType[], graphData: GraphData): EventPhysiologicalData[] => {

	eventData = filterOutIntermediateEvents(eventData);

	const averages: EventPhysiologicalData[] = []

	let eventCount = 0

	const sum = {}
	let pointCount = 0

	graphData.fields.forEach(field => sum[field.name] = 0)

	graphData.points.every(point => {
		const pointTime = point[graphData.timestampKey] / 1000; // is recorded in milliseconds
		const eventTime = eventData[eventCount].time

		if (pointTime > eventTime) {
			graphData.fields.forEach(field => {

				let eventType = ""
				if (eventData[eventCount].eventType === "Start") {
					eventType = "Baseline"
				} else if (eventData[eventCount].module === 15) {
					eventType = "Activity" // stress activity occured while on page 15.
				} else {
					eventType = `Module ${eventData[eventCount].module}`
				}

				averages.push({
					eventType: eventType,
					field: field,
					value: sum[field.name] / pointCount,
				})
				sum[field.name] = 0
			})
			pointCount = 0;
			eventCount += 1;
		} else {
			graphData.fields.forEach(field => {
				sum[field.name] += point[field.name];
			})
			pointCount += 1;
		}

		return (eventCount < eventData.length) // end loop when all events have been processed
	})

	return averages;
}

export function filterOutIntermediateEvents(eventData: EventDataWithQuestionType[]) {

	const sortedEvents = eventData.sort((a,b) => a.time - b.time);
	const head = sortedEvents[0]
	const tail =  sortedEvents[sortedEvents.length - 1]

	const filteredEvents = [head]

	sortedEvents.forEach(e => {
		if (e.eventType === "Navigation: Next") {
			filteredEvents.push(e)
		}
	})

	if (!filteredEvents.includes(tail)) {
		filteredEvents.push(tail)
	}

	const eventsWithoutDuplicates = []

	let sortedByModuleEvents = filteredEvents.sort((a,b) => a.module - b.module)

	let prevEvent = sortedByModuleEvents[0]

	for (let i = 1; i < sortedByModuleEvents.length; i++) {
		if (sortedByModuleEvents[i].module !== prevEvent.module) {
			eventsWithoutDuplicates.push(prevEvent)
		}
		prevEvent = sortedByModuleEvents[i]
	}

	return eventsWithoutDuplicates.sort((a,b) => a.time - b.time);
}

export type AverageData = {
	baselines: {
		[key: string]: number
	};
	values:  [{
		[key: string]: number
	}];
	fields: Field[];
}

export type EventAverageFromDatabase = {
	userId: number;
	eventType: string;
	fieldName: string;
	fieldUnits: string;
	value: number;
}

export function processAverages(averages: EventAverageFromDatabase[], userInStressGroupLookup) {
	const fields = []
	const baselines = {}
	const fieldCount = {}
	const values = {}

	for (const average of averages.reverse()) {
		const field: Field = {
			name: average.fieldName,
			units: average.fieldUnits,
		}
		
		// if field hasn't been added
		if (!fields.some(f => _.isEqual(f, field))) {
			fields.push(field);
		}

		const group = userInStressGroupLookup[average.userId] ? "Stress" : "Control";

		fieldCount[average.eventType] ??= {}
		fieldCount[average.eventType][field.name] ??= {}
		fieldCount[average.eventType][field.name][group] = (fieldCount[average.eventType][field.name][group] ?? 0) + 1;
		
		if (average.eventType === "Baseline") {
			baselines[field.name] ??= {}
			baselines[field.name][group] = (baselines[field.name][group] ?? 0) + average.value
			continue; // if baseline then we don't need to update values array
		}

		values[field.name] ??= []
		const valueIndex = values[field.name].findIndex(v => v.event === average.eventType);

		// if eventType i.e "Module 1" hasn't been added
		if (valueIndex === -1) {
			values[field.name].push({
				event: average.eventType,
				[group]: average.value,
			})
		} else {
			values[field.name][valueIndex][group] = (values[field.name][valueIndex][group] ?? 0) + average.value
		}
	}

	for (const key in baselines) { // each key in baseline gives us a field name
		baselines[key]["Control"] /= fieldCount["Baseline"][key]["Control"]
		baselines[key]["Stress"] /= fieldCount["Baseline"][key]["Stress"]

		for (const val of values[key]) {
			val["Control"] /= fieldCount[val.event][key]["Control"];
			val["Stress"] /= fieldCount[val.event][key]["Stress"];
		}
	}

	return {values, fields, baselines}
}