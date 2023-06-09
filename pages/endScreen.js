import React from "react";
import { Paper, Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  outsideContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    // backgroundColor: '#bfe9ff',
    backgroundImage: "linear-gradient(#bfe9ff, #94daff)",
  },
  insideContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: "10px",
    height: "50vh",
    width: "60vw",
  },

  textBoxCode: {
    width: "25vw",
    backgroundColor: "#f5fbff",
    // border: '1px solid black'
  },
  heading: {
    paddingBottom: "30px",
  },
}));

const EndScreen = () => {
  const classes = useStyles();

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      className={classes.outsideContainer}
    >
      <Typography className={classes.heading} variant="h3" align="center">
        {" "}
        Thank you for your participation!{" "}
      </Typography>
      <Paper className={classes.insideContainer}>
        <Typography variant="h5" align="center">
          {" "}
          The content for this learning module was adapted from:{" "}
        </Typography>
        <Typography paragraph align="center">
          {" "}
          Foster, Jo 2018, HTML 101: The Essential Beginner's Guide to Learning
          HTML Coding{" "}
        </Typography>
        <Typography paragraph align="center">
          {" "}
          Sanders, Bill 2011. Smashing HTML5 (1st. ed.). Wiley Publishing.{" "}
        </Typography>
        <Typography paragraph align="center">
          {" "}
          Brooks, DR 2007, An Introduction to HTML and JavaScript : for
          Scientists and Engineers, Springer London, London.{" "}
        </Typography>
        <Typography paragraph align="center">
          {" "}
          Krause, J 2016, Introducing Web Development, Apress : Imprint: Apress,
          Berkeley, CA.{" "}
        </Typography>
      </Paper>
    </Grid>
  );
};

export default EndScreen;
