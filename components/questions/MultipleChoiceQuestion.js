import React, { useRef, useEffect } from "react";
import {
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  FormControlLabel,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import Countdown from "../Countdown";

import { getCookie } from "cookies-next";

import { AddAnswer, AddEvent } from "../../utils/questionUtils";

export const useStyles = makeStyles(() => ({
  textInstructions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    width: "200px",
  },
  timerDiv: {
    width: "100%",
    textAlign: "right",
    fontSize: "24px",
    padding: "10px 0 100px 0",
  },
  timeText: {
    color: "#a6a6a6",
  },
  form: {
    width: "60%",
  },
  FormControl: {
    width: "100%",
  },
}));

const MultipleChoiceQuestion = ({
  questionData,
  allowNext,
  retry,
  shortAnswer,
}) => {
  const classes = useStyles();

  // value user selects
  const [multipleChoiceValue, setMultipleChoiceValue] = React.useState("");
  const shortAnswerRef = useRef("");

  // answer status
  const [error, setError] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [answerStatus, setStatus] = React.useState("");

  const [seconds, setSeconds] = React.useState(0);

  // number of attempts
  const [attempts, setAttempts] = React.useState(1);

  const [doneQuestion, setDone] = React.useState(false);

  // handle change of selected button
  const handleRadioChange = (event) => {
    setMultipleChoiceValue(event.target.value);
  };

  useEffect(() => {
    allowNext();
  }, [doneQuestion]);

  // function adds the users answer to the database
  function addAnswer(correct) {
    const value = shortAnswer
      ? shortAnswerRef.current.value
      : multipleChoiceValue;

    AddAnswer(
      getCookie("userId"),
      value,
      attempts,
      false,
      questionData.questionNumber,
      seconds,
      correct
    );
  }

  // function checks the user answer is correct
  const checkAnswer = (e) => {
    e.preventDefault();

    let response = shortAnswer
      ? shortAnswerRef.current.value
      : multipleChoiceValue;

    if (response == "") {
      alert("Please choose an answer");
      return;
    }

    if (shortAnswer) {
      AddEvent(
        getCookie("userId"),
        "Answer Submitted",
        questionData.questionNumber
      );
      addAnswer();
      setStatus(
        `Question cannot be marked automatically. The correct answer was: ${questionData.correctAnswer}`
      );
      setDone(true);
      return;
    }

    // if the user answer is correct
    if (multipleChoiceValue === questionData.correctAnswer) {
      setError(false);
      setSuccess(true);
      setStatus("You got it correct");
      setDone(true);

      AddEvent(
        getCookie("userId"),
        "Answer Checked: Correct",
        questionData.questionNumber
      );

      addAnswer("correct");
      // if the answer is wrong
    } else {
      setError(true);
      setSuccess(false);

      AddEvent(
        getCookie("userId"),
        "Answer Checked: Incorrect",
        questionData.questionNumber
      );

      if (retry) {
        setAttempts(attempts + 1);
        setStatus("You selected the wrong answer. Try again.");
        return;
      }

      setStatus(
        `You selected the wrong answer. The correct answer was: ${questionData.correctAnswer}.`
      );
      addAnswer("incorrect");
      setDone(true);
    }
  };

  const answerSelection = questionData.answerOptions.map((a) => (
    <FormControlLabel key={a} value={a} control={<Radio />} label={a} />
  ));

  const timeout = () => {
    setStatus(
      `You ran out of time! The correct answer was: ${questionData.correctAnswer}`
    );
    setError(true);
    setSuccess(false);
    setDone(true);

    AddEvent(getCookie("userId"), "Timeout", questionData.questionNumber);
    return;
  };

  return (
    <div className={classes.textInstructions}>
      <div className={classes.timerDiv}>
        <Countdown
          seconds={questionData.countdown ?? 60}
          finished={doneQuestion}
          timeout={timeout}
          setTime={(timerValue) => setSeconds(timerValue)}
        />
      </div>

      <Typography variant="h4"> {questionData.pageTitle} </Typography>
      <br />

      <br />
      <form onSubmit={checkAnswer} className={classes.form}>
        <FormControl component="fieldset" className={classes.FormControl}>
          <FormLabel component="legend">
            {questionData.textDescription}
          </FormLabel>
          {shortAnswer ? (
            <>
              <br />
              <TextField
                disabled={doneQuestion}
                aria-label="quiz"
                name="answer"
                id="outlined-basic"
                variant="outlined"
                inputRef={shortAnswerRef}
                autoComplete="off"
              />
            </>
          ) : (
            <RadioGroup
              aria-label="quiz"
              name="quiz"
              value={multipleChoiceValue}
              onChange={handleRadioChange}
            >
              {answerSelection}
            </RadioGroup>
          )}
          <br />
          {!doneQuestion && (
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              className={classes.button}
            >
              Check Answer
            </Button>
          )}
        </FormControl>
      </form>
      <br />
      {!shortAnswer && (
        <>
          {error && <Alert severity="error">{answerStatus}</Alert>}
          {success && <Alert severity="success">{answerStatus}</Alert>}
        </>
      )}
      {shortAnswer &&
        doneQuestion &&
        (error ? (
          <Alert severity="error">{answerStatus}</Alert>
        ) : (
          <Alert severity="info">{answerStatus}</Alert>
        ))}
    </div>
  );
};

export default MultipleChoiceQuestion;
