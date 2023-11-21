import { CollectionConfig } from "payload/types";

const ParticipantAnswers: CollectionConfig = {
	slug: "participantAnswers",
	admin: {
		useAsTitle: "userId",
		defaultColumns: ["userId", "questionNumber", "attempt", "timeSpent"],
		listSearchableFields: ["questionNumber"],
	},
	access: {
		create: () => true,
		read: () => true,
	},
	fields: [
		{
			name: "attempt",
			type: "text",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
		{
			name: "userId",
			type: "text",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
		{
			name: "attemptCount",
			type: "number",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
		{
			name: "gaveUp",
			type: "checkbox",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
		{
			name: "questionNumber",
			type: "number",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
		{
			name: "timeSpent",
			type: "number",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
		{
			name: "timedOut",
			type: "checkbox",
			access: {
				update: ({ req: { user } }) =>
					user.email == process.env.ADMIN_EMAIL,
			},
		},
		{
			name: "correct",
			type: "radio",
			admin: {
				layout: "horizontal",
			},
			options: [
				{
					label: "Correct",
					value: "correct",
				},
				{
					label: "Inorrect",
					value: "incorrect",
				},
			],
		},
	],
};

export default ParticipantAnswers;
