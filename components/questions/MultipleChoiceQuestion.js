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

const useStyles = makeStyles(() => ({
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
  countdown,
}) => {
  const classes = useStyles();

  // value user selects
  const [multipleChoiceValue, setMultipleChoiceValue] = React.useState("");
  const [shortAnswerValue, setShortAnswerValue] = React.useState("");

  // answer status
  const [error, setError] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [answerStatus, setStatus] = React.useState("");

  // number of attempts
  const [attempts, setAttempts] = React.useState(1);

  const [doneQuestion, setDone] = React.useState(false);

  // Timer renderer callback with condition
  // const timer = ({ minutes, seconds, completed }) => {
  //   if (completed) {
  //     // Render a complete state
  //     return "Times up!";
  //   } else {
  //     // Render a countdown
  //     return (
  //       <Typography
  //         className={minutes ? classes.timeText : classes.timeTextRed}
  //       >
  //         {minutes ? minutes + "m" : ""} {seconds}s
  //       </Typography>
  //     );
  //   }
  // };

  // handle change of selected button
  const handleRadioChange = (event) => {
    setMultipleChoiceValue(event.target.value);
  };

  useEffect(() => {
    allowNext();
    addAnswer();
  }, [doneQuestion]);

  // function adds the users answer to the database
  async function addAnswer() {
    // const data = {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //   },
    //   body: JSON.stringify({
    //     userId: localStorage.getItem("userId"),
    //     questionNumber: questionNumber,
    //     timeSpent: seconds,
    //     attemptCount: attempts,
    //     attempt: value,
    //     gaveUp: 0,
    //   }),
    // };
    // console.log(data);
    // const url = "http://127.0.0.1:5000/answers";
    // let res = await fetch(url, data);
    // res = await res.json();
    // console.log(res);
  }

  // function checks the user answer is correct
  const checkAnswer = (e) => {
    e.preventDefault();

    let response = shortAnswer ? shortAnswerValue : multipleChoiceValue;

    if (response == "") {
      alert("Please choose an answer");
      return;
    }

    if (shortAnswer) {
      setStatus(
        `Question cannot be marked automatically. The correct answer was: ${questionData.correctAnswer}`
      );
      setDone(true);
      return;
    }

    // if the user answer is correct
    if (!shortAnswer && multipleChoiceValue === questionData.correctAnswer) {
      setError(false);
      setSuccess(true);
      setStatus("You got it correct");
      setDone(true);
      // if the answer is wrong
    } else {
      setError(true);
      setSuccess(false);

      if (retry) {
        setAttempts(attempts + 1);
        setStatus("You selected the wrong answer. Try again.");
        return;
      }

      setStatus(
        `You selected the wrong answer. The correct answer was: ${questionData.correctAnswer}.`
      );
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
    return;
  };

  return (
    <div className={classes.textInstructions}>
      <div className={classes.timerDiv}>
        <Countdown
          seconds={countdown ?? 90}
          finished={doneQuestion}
          timeout={timeout}
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
                aria-label="quiz"
                name="answer"
                id="outlined-basic"
                variant="outlined"
                onChange={setShortAnswerValue}
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
