import payload from "payload";
import {
	GraphData,
	calculateEventAverages,
	matchAnswersToEvents,
	addQuestionTypeToEvents,
	processCSVFile,
    EventPhysiologicalData,
} from "./analyticsUtils";

// Collects all of the data analytics recorded for a specific participant, returning the averages of Physiological measurements per page.
export async function processparticipantData(userId: number): Promise<[EventPhysiologicalData[], EventPhysiologicalData[]]> {
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
		limit: 200,
		where: {
			id: {
				equals: userId,
			},
		},
	});

	const participantData = participantDataResponse.docs[0];

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

	let GSRAverages: EventPhysiologicalData[] = [];

	if (GSRDataUrl) {
		try {
			const GSRdata = await fetch(GSRDataUrl).then((response) =>
				response.text()
			);

			processedGSRData = processCSVFile(GSRdata);

			GSRAverages = calculateEventAverages(
				eventDataWithQuestionType,
				processedGSRData
			);
		} catch {}
	}

	const ECGDataURL = participantData.ShimmerEcgData?.url;

	let processedECGData: GraphData | null = null;

	let ECGAverages: EventPhysiologicalData[] = [];
	if (ECGDataURL) {
		try {
			const ECGData = await fetch(ECGDataURL).then((response) =>
				response.text()
			);

			processedECGData = processCSVFile(ECGData);

			ECGAverages = calculateEventAverages(
				eventDataWithQuestionType,
				processedECGData
			);
		} catch {}
	}

	return [GSRAverages, ECGAverages];
}

// Storing the calculated physiological data averages in the database.
export async function PutAveragesInDatabase(averageData: EventPhysiologicalData[], userId: number) {
	for (const average of averageData) {
        try {
            await payload.create({
                collection: "eventAverages",
                data: {
                    userId: userId,
                    eventType: average.eventType,
                    value: average.value,
                    fieldName: average.field.name,
                    fieldUnits: average.field.units,
                },
            });
        } catch {}
	}
	
}

// calculating the average time taken per question for each group.
export async function CalculateTimeTakenAverages() {
    const participantDataResponse = await payload.find({
		collection: "participantData",
		limit: 200,
		where: {
			experimentData: {
				equals: true,
			},
		},
	});

    const questionResponse = await payload.find({
        collection: "questions",
        limit: 100,
    });

    const questions = questionResponse.docs

    const stressGroupTimes = []
    const controlGroupTimes = []

    for (const user of participantDataResponse.docs) {
        const answerResponse = await payload.find({
            collection: "participantAnswers",
            limit: 200,
            where: {
                userId: {
                    equals: user.id,
                },
            }
        });

        const timeTaken = []

        for (const answer of answerResponse.docs) {
            const question = questions.find(q=> q.questionNumber === answer.questionNumber)

            timeTaken.push({
                question: answer.questionNumber,
                timeTaken: answer.timeSpent,
                max: question.countdown,
            })
        }

        const timeOutEventsResponse = await payload.find({
            collection: "participantEvents",
            limit: 200,
            where: {
                and: [
                    {
                        userId: {
                            equals: user.id,
                        }
                    },
                    {
                        eventType: {
                            equals: "Timeout"
                        }
                    },
                ]
            }
        });

        for (const timeout of timeOutEventsResponse.docs) {

            const question = questions.find(q=> q.questionNumber === timeout.module)
            timeTaken.push({
                question: timeout.module,
                timeTaken: question.countdown,
                max: question.countdown
            })
        }

        if (user.stress) {
            stressGroupTimes.push(...timeTaken)
        } else {
            controlGroupTimes.push(...timeTaken)
        }
    }

    const stressTimesSummed = reduceTimes(stressGroupTimes)

    const controlTimesSummed = reduceTimes(controlGroupTimes)

    const stressAverageTimes = calculatePercentageAverages(stressTimesSummed)

    const controlAverageTimes = calculatePercentageAverages(controlTimesSummed)

    const AverageTimeResults = []

    for (const item of controlAverageTimes) {
        const stressTime = stressAverageTimes.find(i=> i.question === item.question)
        
        AverageTimeResults.push({
            Question: item.question,
            Stress: stressTime.timeTaken,
            Control: item.timeTaken
        })

    }

    return AverageTimeResults;
}

// Using a reducer to group all of the time taken values by their question number. This is then used to create averages in the below function.
function reduceTimes(arr) {
    return arr.reduce((accumulator, current) => {
        const index = accumulator.findIndex(i=> i.question === current.question)
        if (index !== -1) {
            accumulator[index].timeTaken += current.timeTaken;
            accumulator[index].count += 1
        } else {
            accumulator.push({
                question: current.question,
                timeTaken: current.timeTaken,
                count: 1,
                max: current.max,
            })
        }
        return accumulator
    }, [])
}

// Calculating the average time taken per question as a percentage based on the time given per question.
function calculatePercentageAverages(timesSummed) {
    const averagedPercentages = []
    for (const item of timesSummed) {
        averagedPercentages.push({
            question: item.question,
            timeTaken: (item.timeTaken / item.count) / item.max,
        })
    }
    return averagedPercentages
}