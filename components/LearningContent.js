import React, { useState, useEffect } from "react";
import TabPanel from "./TabPanel";
import { Paper, Typography, Tabs, Tab } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ReactPlayer from "react-player";
import SerializeRichText from "../utils/SerialiseRichText";

const useStyles = makeStyles((theme) => ({
  clInstructions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  textInstructions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "80%",
    marginLeft: "10%",
    textAlign: "center",
  },
  textColor: {
    backgroundColor: "#d7ecf7",
    paddingLeft: "2px",
    paddingRight: "2px",
    borderRadius: "5px",
    border: "1px solid #b0e4ff",
  },
  videoInstructions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  videoPanel: {
    backgroundColor: "#cccccc",
    width: "60vw",
    height: "60vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  videoBox: {
    flexShrink: 0,
    minWidth: "100%",
    minHeight: "100%",
  },
}));

const LearningContent = ({ moduleInfo, textInstructions }) => {
  const classes = useStyles();

  const [hasWindow, setHasWindow] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <div className={classes.clInstructions}>
      <Typography variant="h4"> {moduleInfo.pageTitle} </Typography>
      <br />
      <Paper position="static">
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="simple tabs example"
        >
          <Tab label="Video Instructions" />
          {textInstructions && <Tab label="Text Instructions" />}
        </Tabs>
      </Paper>
      <TabPanel value={currentTab} index={0}>
        <div className={classes.videoInstructions}>
          <div className={classes.videoPanel}>
            {hasWindow && (
              <ReactPlayer
                className={classes.videoBox}
                url={moduleInfo.videoLocation}
                controls={true}
                config={{
                  youtube: {
                    playerVars: { disablekb: 1, modestbranding: 1, fs: 0 },
                  },
                }}
              />
            )}
          </div>
        </div>
      </TabPanel>
      {textInstructions && (
        <TabPanel value={currentTab} index={1}>
          <div className={classes.textInstructions}>
            {SerializeRichText(moduleInfo.textInstructions)}
          </div>
        </TabPanel>
      )}
    </div>
  );
};

export default LearningContent;
