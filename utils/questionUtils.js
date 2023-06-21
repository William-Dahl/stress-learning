export const AddEvent = async (userId, eventType, module) => {
  if (userId == "test") return;

  const response = await PostData(
    {
      userId: userId,
      eventType: eventType,
      module: module,
      time: GetTime(),
    },
    "userEvents"
  );

  return response;
};

export const GetTime = () => Math.round(Date.now() / 1000);

export const AddAnswer = async (
  userId,
  attempt,
  attemptCount,
  gaveUp,
  questionNumber,
  timeSpent,
  correct
) => {
  if (userId == "test") return;

  const response = await PostData(
    {
      userId: userId,
      attempt: attempt,
      attemptCount: attemptCount,
      gaveUp: gaveUp,
      questionNumber: questionNumber,
      timeSpent: timeSpent,
      correct: correct,
    },
    "userAnswers"
  );

  return response;
};

export const PostData = async (Obj, collection) => {
  try {
    const req = await fetch(`/api/${collection}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Obj),
    });
    const res = await req.json();
    if (!res.message) console.error(res);
    return res;
  } catch (err) {
    console.error(err);
    return err;
  }
};
