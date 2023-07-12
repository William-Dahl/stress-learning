import React, { useRef, useEffect } from "react";
import {
	Typography,
	Button,
	FormControl,
	FormLabel,
	TextField,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import Countdown from "../Countdown";

import { getCookie } from "cookies-next";

import {
	AddAnswer,
	AddEvent,
	AddTimedOutAnswer,
} from "../../utils/questionUtils";

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

const ShortAnswerQuestion = ({ questionData, allowNext }) => {
	const classes = useStyles();

	// value user selects
	const shortAnswerRef = useRef("");

	// answer status
	const [error, setError] = React.useState(false);
	const [answerStatus, setStatus] = React.useState("");

	const [seconds, setSeconds] = React.useState(0);

	const [doneQuestion, setDone] = React.useState(false);

	useEffect(() => {
		allowNext();
	}, [doneQuestion]);

	// function checks the user answer is correct
	const checkAnswer = (e) => {
		e.preventDefault();

		if (shortAnswerRef.current.value == "") {
			alert("Please choose an answer");
			return;
		}

		AddEvent(
			getCookie("userId"),
			"Answer Submitted",
			questionData.questionNumber
		);

		AddAnswer(
			getCookie("userId"),
			shortAnswerRef.current.value,
			1,
			false,
			questionData.questionNumber,
			seconds
		);
		setStatus(
			`You have submitted your answer. Short answer questions cannot be marked automatically.`
		);
		setDone(true);
		return;
	};

	const timeout = () => {
		setStatus(
			`You ran out of time! The correct answer was: ${questionData.correctAnswer}`
		);
		setError(true);
		setDone(true);
		AddEvent(getCookie("userId"), "Timeout", questionData.questionNumber);
		AddTimedOutAnswer(
			getCookie("userId"),
			shortAnswerRef.current.value,
			1,
			false,
			questionData.questionNumber,
			seconds
		);
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
				<FormControl
					component="fieldset"
					className={classes.FormControl}
				>
					<FormLabel component="legend">
						{questionData.textDescription}
					</FormLabel>
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
			{doneQuestion &&
				(error ? (
					<Alert severity="error">{answerStatus}</Alert>
				) : (
					<Alert severity="info">{answerStatus}</Alert>
				))}
		</div>
	);
};

export default ShortAnswerQuestion;
