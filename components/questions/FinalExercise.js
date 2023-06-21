import React, { useState } from "react";
import { Typography, Button, Modal, Fade, Backdrop } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Editor from "../Editor";
import Countdown from "../Countdown";
import { makeStyles } from "@material-ui/core/styles";

import { AddAnswer, AddEvent } from "../../utils/questionUtils";

import { getCookie } from "cookies-next";

const useStyles = makeStyles((theme) => ({
  textInstructions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  codingWindows: {
    display: "flex",
    flexDirection: "column",
    // alignItems: 'flex-end',
    width: "100%",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  codeButtons: {
    margin: "5px",
  },
  htmlWindow: {
    border: "1px solid #cccccc",
    height: "90%",
    display: "flex",
    flexDirection: "column",
    borderRadius: "10px",
  },
  outputWindow: {
    border: "1px solid #cccccc",
    height: "90%",
    borderRadius: "10px",
  },
  imgWindow: {
    border: "1px solid #cccccc",
    height: "90%",
    borderRadius: "10px",
  },
  codesFinal: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ext1Final: {
    width: "35%",
    height: "60vh",
  },
  ext2Final: {
    width: "25%",
    height: "60vh",
  },
  ext3Final: {
    width: "35%",
  },
  htmlEditor: {
    height: "100%",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: "#eeeeee",
    border: "2px solid #ccccc",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    textAlign: "center",
    width: "50vw",
  },
  timerDiv: {
    width: "100%",
    textAlign: "right",
    fontSize: "24px",
    paddingTop: "10px",
  },
  timeText: {
    marginTop: "10px",
    color: "#a6a6a6",
  },
  paragraph: {
    textAlign: "center",
  },
}));

const FinalExercise = ({ questionData, allowNext }) => {
  const classes = useStyles();

  let starterCode = questionData.starterCode;
  starterCode = starterCode.replace(/\\n/g, "\n");
  starterCode = starterCode.replace(/\\t/g, "\t");
  starterCode = starterCode.replace(/\\r/g, "\r");
  const [html, setHtml] = useState(starterCode);
  const [srcDoc, setSrcDoc] = useState("");

  let answerCode = questionData.correctAnswer;
  answerCode = answerCode.replace(/\\n/g, "\n");
  answerCode = answerCode.replace(/\\t/g, "\t");
  answerCode = answerCode.replace(/\\r/g, "\r");

  const [seconds, setSeconds] = React.useState(0);

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [answerStatus, setStatus] = useState("");

  const [doneQuestion, setDone] = useState(false);

  const [attempts, setAttempts] = useState(1);

  const [open, setOpen] = useState(false);

  const imgsrc = "data:image/png;base64," + questionData.imgSrc;
  const imageV = <img src={imgsrc} alt="coding" width="100%" />;

  const handleOpenHint = () => {
    AddEvent(getCookie("userId"), "Hint used", questionData.questionNumber);
    setOpen(true);
  };

  const handleCloseHint = () => {
    setOpen(false);
  };

  //clean up the user input
  const stripString = (codeString) => {
    let stripedString = codeString;
    stripedString = stripedString.replace(/"/g, "'");
    stripedString = stripedString.replace(/[\s\n\t\r]/g, "");
    return stripedString;
  };

  const checkCode = () => {
    if (doneQuestion) {
      return;
    }

    // clean up user input and database code
    const newAnswer = stripString(html);
    const correctVal = stripString(answerCode);

    if (correctVal === newAnswer) {
      setError(false);
      setSuccess(true);
      setStatus("You got it correct");
      setDone(true);
      allowNext();

      AddEvent(
        getCookie("userId"),
        "Answer Checked: Correct",
        questionData.questionNumber
      );

      AddAnswer(
        getCookie("userId"),
        stripString(html),
        attempts,
        false,
        questionData.questionNumber,
        seconds
      );
    } else {
      setError(true);
      setSuccess(false);
      setStatus("There is an error in your code");
      setAttempts(attempts + 1);

      AddEvent(
        getCookie("userId"),
        "Answer Checked: Incorrect",
        questionData.questionNumber
      );
    }
  };

  const giveUpFunction = () => {
    allowNext();
    setError(true);
    setSuccess(false);
    setDone(true);

    let correctAnswer2 = answerCode;
    correctAnswer2 = correctAnswer2.replace(/\\n/g, "\n");
    correctAnswer2 = correctAnswer2.replace(/\\t/g, "\t");
    correctAnswer2 = correctAnswer2.replace(/\\r/g, "\r");

    setHtml(correctAnswer2);
    setSrcDoc(`${correctAnswer2}`);
    setStatus("You have given up. The answer has been shown");

    AddAnswer(
      getCookie("userId"),
      stripString(html),
      attempts,
      true,
      questionData.questionNumber,
      seconds
    );

    AddEvent(getCookie("userId"), "Gaveup", questionData.questionNumber);
  };

  const timeout = () => {
    allowNext();
    setError(true);
    setSuccess(false);
    setDone(true);

    let correctAnswer2 = answerCode;
    correctAnswer2 = correctAnswer2.replace(/\\n/g, "\n");
    correctAnswer2 = correctAnswer2.replace(/\\t/g, "\t");
    correctAnswer2 = correctAnswer2.replace(/\\r/g, "\r");

    setHtml(correctAnswer2);
    setSrcDoc(`${correctAnswer2}`);
    setStatus(`You ran out of time! The answer has been shown`);

    AddEvent(getCookie("userId"), "Timeout", questionData.questionNumber);
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
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleCloseHint}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <Typography variant="h5"> Coding Hint </Typography>
            <br />
            <Typography paragraph> {questionData.hint} </Typography>
          </div>
        </Fade>
      </Modal>
      <Typography variant="h4"> {questionData.pageTitle} </Typography>
      <br />
      {/* <p> {val} </p> */}
      {/* <Markup content={val} /> */}
      <Typography
        className={classes.paragraph}
        paragraph
        dangerouslySetInnerHTML={{ __html: questionData.textDescription }}
      />
      {/* <Typography variant="h5"> {answerStatus} </Typography> */}
      {error ? <Alert severity="error">{answerStatus}</Alert> : <></>}
      {success ? <Alert severity="success">{answerStatus}</Alert> : <></>}
      <div className={classes.codingWindows}>
        <div className={classes.buttonGroup}>
          {attempts > 2 ? (
            <Button
              variant="contained"
              color="secondary"
              className={classes.codeButtons}
              onClick={giveUpFunction}
            >
              {" "}
              Give up?{" "}
            </Button>
          ) : (
            <></>
          )}
          {attempts > 1 ? (
            <Button
              variant="contained"
              color="secondary"
              className={classes.codeButtons}
              onClick={handleOpenHint}
            >
              {" "}
              Hint{" "}
            </Button>
          ) : (
            <></>
          )}
          <Button
            variant="contained"
            color="secondary"
            className={classes.codeButtons}
            onClick={() => setSrcDoc(html)}
          >
            {" "}
            Run{" "}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            className={classes.codeButtons}
            onClick={checkCode}
          >
            {" "}
            Check{" "}
          </Button>
        </div>
        <div className={classes.codesFinal}>
          <div className={classes.ext1Final}>
            <Typography variant="h6"> Desired Output </Typography>
            <div className={classes.imgWindow}>{imageV}</div>
          </div>
          <div className={classes.ext2Final}>
            <Typography variant="h6"> Coding Window </Typography>
            <div className={classes.htmlWindow}>
              <Editor language="xml" value={html} onChange={setHtml} />
            </div>
          </div>
          <div className={classes.ext3Final}>
            <Typography variant="h6"> Output Window </Typography>
            <div className={classes.outputWindow}>
              <iframe
                srcDoc={srcDoc}
                title="output"
                sandbox="allow-scripts"
                frameBorder="0"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalExercise;
