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
	codes: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-evenly",
	},
	codesFinal: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	ext1: {
		width: "45%",
		height: "60vh",
	},
	ext2: {
		width: "45%",
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

const CodingQuestion = ({
	questionData,
	allowNext,
	allowGiveUp,
	allowHint,
}) => {
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

	// status of answer
	const [error, setError] = useState(false);
	const [success, setSuccess] = useState(false);
	const [answerStatus, setStatus] = useState("");

	// time for answer
	const [doneQuestion, setDone] = useState(false);

	// number of attempts
	const [attempts, setAttempts] = useState(1);

	// module opening
	const [open, setOpen] = useState(false);

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

	const SubmitCode = () => {
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
				"Answer Submitted: Correct",
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
				"Answer Submitted: Incorrect",
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

		AddEvent(getCookie("userId"), "Gaveup", questionData.questionNumber);

		AddAnswer(
			getCookie("userId"),
			stripString(html),
			attempts,
			true,
			questionData.questionNumber,
			seconds
		);

		setHtml(correctAnswer2);
		setSrcDoc(`${correctAnswer2}`);
		setStatus("You have given up. The answer has been shown");
	};

	const timeout = () => {
		allowNext();
		setError(true);
		setSuccess(false);
		setDone(true);

		AddEvent(getCookie("userId"), "Timeout", questionData.questionNumber);

		let correctAnswer2 = answerCode;
		correctAnswer2 = correctAnswer2.replace(/\\n/g, "\n");
		correctAnswer2 = correctAnswer2.replace(/\\t/g, "\t");
		correctAnswer2 = correctAnswer2.replace(/\\r/g, "\r");

		setHtml(correctAnswer2);
		setSrcDoc(`${correctAnswer2}`);
		setStatus(`You ran out of time! The answer has been shown`);
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
			<Typography paragraph>{questionData.textDescription}</Typography>
			{error ? <Alert severity="error">{answerStatus}</Alert> : <></>}
			{success ? <Alert severity="success">{answerStatus}</Alert> : <></>}
			<div className={classes.codingWindows}>
				<div className={classes.buttonGroup}>
					{attempts > 2 && allowGiveUp ? (
						<Button
							variant="outlined"
							color="primary"
							className={classes.codeButtons}
							onClick={giveUpFunction}
						>
							{" "}
							Give up?{" "}
						</Button>
					) : (
						<></>
					)}
					{attempts > 1 && allowHint ? (
						<Button
							variant="outlined"
							color="primary"
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
						color="primary"
						className={classes.codeButtons}
						onClick={() => setSrcDoc(html)}
					>
						Run Code
					</Button>
					<Button
						variant="contained"
						color="primary"
						className={classes.codeButtons}
						onClick={SubmitCode}
					>
						Submit
					</Button>
				</div>
				<div className={classes.codes}>
					<div className={classes.ext1}>
						<Typography variant="h6"> Coding Window </Typography>
						<div className={classes.htmlWindow}>
							<Editor
								language="xml"
								value={html}
								onChange={setHtml}
							/>
						</div>
					</div>
					<div className={classes.ext2}>
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

export default CodingQuestion;
