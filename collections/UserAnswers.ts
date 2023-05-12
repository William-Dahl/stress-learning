import { CollectionConfig } from "payload/types";

// Example Collection - For reference only, this must be added to payload.config.ts to be used.
const UserAnswers: CollectionConfig = {
  slug: "userAnswers",
  admin: {
    useAsTitle: "userId",
    defaultColumns: ["userId", "questionNumber", "attempt", "timeSpent"],
    listSearchableFields: ["questionNumber"],
  },
  fields: [
    {
      name: "attempt",
      type: "text",
    },
    {
      name: "userId",
      type: "text",
    },
    {
      name: "attemptCount",
      type: "number",
    },
    {
      name: "gaveUp",
      type: "number",
    },
    {
      name: "questionNumber",
      type: "number",
    },
    {
      name: "timeSpent",
      type: "number",
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

export default UserAnswers;
