import React from "react";
import { Paper, Typography, Button, Grid, TextField } from "@material-ui/core";
import { useRouter } from "next/router";
import { makeStyles } from "@material-ui/core/styles";
import { setCookie, deleteCookie } from "cookies-next";

const useStyles = makeStyles({
  outsideContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    backgroundImage: "linear-gradient(#bfe9ff, #94daff)",
  },
  insideContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: "10px",
    height: "40vh",
    width: "40vw",
  },
  startButton: {
    paddingTop: "15px",
    paddingBottom: "15px",
    paddingLeft: "30px",
    paddingRight: "30px",
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
const Landing = () => {
  const classes = useStyles();
  const router = useRouter();

  // delete userid cookie on landing
  deleteCookie("userId");

  // TODO: change to use form instead of getElementById
  // changes the route
  const routeChange = () => {
    // stores the userId in the local storage
    const newUserId = document.getElementById("userId").value;

    if (newUserId === "") {
      alert("Please enter a login code");
      return;
    }

    setCookie("userId", newUserId, {
      maxAge: 3600, // Expires after 1hr
    });

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
        <Typography variant="h4" align="center">
          {" "}
          Enter Login Code{" "}
        </Typography>
        <TextField
          id="userId"
          label="Enter Code"
          variant="outlined"
          className={classes.textBoxCode}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={routeChange}
          className={classes.startButton}
        >
          Start Module
        </Button>
      </Paper>
    </Grid>
  );
};

export default Landing;
