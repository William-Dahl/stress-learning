import React from "react";
import { AppBar, Typography, Toolbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  appBar: {
    display: "flex",
    justifyContent: "space-between",
    zIndex: theme.zIndex.drawer + 1,
  },
  welcomeInfo: {
    color: "white",
  },
  headingappBar: {
    flexGrow: 1,
  },
}));

const HeaderBar = ({ userId }) => {
  const classes = useStyles();

  return (
    <div>
      <AppBar position="sticky" color="primary" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" className={classes.headingappBar}>
            Introduction to HTML
          </Typography>
          <Typography variant="body1" className={classes.welcomeInfo}>
            User ID: {userId}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default HeaderBar;
