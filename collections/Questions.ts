import { CollectionConfig } from "payload/types";

export enum QuestionTypes {
	MULTIPLE_CHOICE = "multipleChoice",
	LEARNING_CONTENT = "learningContent",
	CODING_QUESTION = "coding",
	SHORT_ANSWER = "shortAnswer",
}

const Questions: CollectionConfig = {
	slug: "questions",
	admin: {
		useAsTitle: "pageTitle",
		defaultColumns: [
			"questionNumber",
			"pageTitle",
			"questionType",
			"textDescription",
		],
		listSearchableFields: ["questionType"],
	},
	access: {
		read: () => true,
	},
	defaultSort: "questionNumber",
	fields: [
		{
			name: "questionNumber",
			label: "Ordering",
			type: "number",
			required: true,
			unique: true,
		},
		{
			name: "countdown",
			label: "Countdown value (in seconds)",
			type: "number",
			required: true,
			admin: {
				condition: (data) =>
					data.questionType !== QuestionTypes.LEARNING_CONTENT,
			},
		},
		{
			name: "questionType",
			label: "Question Type",
			type: "radio",
			required: true,
			admin: {
				layout: "horizontal",
			},
			options: [
				{
					label: "Learning Content",
					value: QuestionTypes.LEARNING_CONTENT,
				},
				{
					label: "Multiple Choice",
					value: QuestionTypes.MULTIPLE_CHOICE,
				},
				{
					label: "Short Answer",
					value: QuestionTypes.SHORT_ANSWER,
				},
				{
					label: "Coding Question",
					value: QuestionTypes.CODING_QUESTION,
				},
			],
		},
		{
			name: "pageTitle",
			label: "Page Title",
			type: "text",
			required: true,
		},
		{
			name: "textDescription",
			label: "Question",
			type: "textarea",
			required: true,
			admin: {
				condition: (data) =>
					data.questionType !== QuestionTypes.LEARNING_CONTENT,
			},
		},
		{
			name: "textInstructions",
			label: "Text Instructions",
			type: "richText",
			required: true,
			admin: {
				condition: (data) =>
					data.questionType == QuestionTypes.LEARNING_CONTENT,
			},
		},
		{
			name: "videoLocation",
			label: "Video Location",
			type: "text",
			required: true,
			admin: {
				condition: (data) =>
					data.questionType == QuestionTypes.LEARNING_CONTENT,
			},
		},
		{
			name: "answerOptions",
			label: "Answer Options",
			type: "text",
			required: true,
			admin: {
				condition: (data) =>
					data.questionType == QuestionTypes.MULTIPLE_CHOICE,
			},
		},
		{
			name: "correctAnswer",
			label: "Answer",
			type: "text",
			required: true,
			admin: {
				condition: (data) =>
					data.questionType !== QuestionTypes.LEARNING_CONTENT,
			},
		},
	],
};

export default Questions;
