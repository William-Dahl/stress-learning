import React, { useState } from "react";
import {
	Paper,
	Typography,
	Button,
	Grid,
	Switch,
	FormControlLabel,
} from "@material-ui/core";
import { useRouter } from "next/router";
import { makeStyles } from "@material-ui/core/styles";
import { setCookie, deleteCookie } from "cookies-next";
import { AddEvent, GetTime, PostData } from "../utils/questionUtils";
import payload from "payload";

const useStyles = makeStyles({
	outsideContainer: {
		minHeight: "100vh",
		display: "flex",
		flexDirection: "column",
		alignContent: "center",
		justifyContent: "center",
		backgroundImage: "linear-gradient(#bfe9ff, #94daff)",
	},
	paperContainer: {
		display: "flex",
		flexDirection: "row",
		gap: "50px",
		justifyContent: "left",
	},
	insideContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-evenly",
		gap: "20px",
		padding: "30px",
	},
	textBoxCode: {
		width: "25vw",
		backgroundColor: "#f5fbff",
		// border: '1px solid black'
	},
	heading: {
		paddingBottom: "30px",
	},
});

// first page the user sees
const Landing = ({ id, version }) => {
	const classes = useStyles();
	const router = useRouter();

	// delete userid cookie on landing
	deleteCookie("userId");

	const [analytics, setAnalytics] = useState(true);

	// changes the route
	const routeChange = async () => {
		const newUserId = analytics ? id : "test";

		setCookie("userId", newUserId, {
			maxAge: 7200, // Expires after 2hr
		});

		if (newUserId != "test") {
			PostData(
				{
					id: newUserId,
					appVersion: version,
				},
				"userData"
			);
			AddEvent(newUserId, "Start", 0);
		}

		// sets the path to the first module
		router.push("module/1");
	};

	return (
		<Grid
			container
			spacing={0}
			direction="column"
			alignItems="center"
			className={classes.outsideContainer}
		>
			<Typography className={classes.heading} variant="h2" align="center">
				{" "}
				Introduction to Hypertext Markup Language
			</Typography>
			<Paper className={classes.insideContainer}>
				<FormControlLabel
					control={<Switch />}
					label={"Run without analytics"}
					labelPlacement="start"
					onChange={() => setAnalytics((val) => !val)}
				/>
				<Button
					variant="contained"
					color="primary"
					onClick={routeChange}
					className={classes.startButton}
				>
					Start
				</Button>
			</Paper>
		</Grid>
	);
};

export async function getServerSideProps() {
	const pjson = require("../package.json");
	const version = pjson.version;

	const usersPayload = await payload.find({
		collection: "userData",
		limit: 10000,
	});

	const users = usersPayload.docs;

	let id = 0;
	if (users.length != 0) {
		const ids = users.map((x) => x.id);
		id = Math.max(...ids) + 1;
	}

	return { props: { id, version } };
}

export default Landing;
