import payload from "payload";
import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Toolbar,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import HeaderBar from "components/Header.js";
import MultipleChoiceQuestion from "components/questions/MultipleChoiceQuestion.js";
import CodingQuestion from "components/questions/CodingQuestion.js";
import FinalExercise from "components/questions/FinalExercise.js";
import LearningContent from "components/LearningContent.js";

import Link from "next/link";
import { getCookie } from "cookies-next";

// import useStyles from "./styles.js";
import clsx from "clsx";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu.js";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft.js";
import LinearProgress from "@material-ui/core/LinearProgress";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    marginRight: 10,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerOpen: {
    width: drawerWidth,
    paddingLeft: "10px",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    paddingLeft: "10px",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  divider: {
    marginBottom: "20px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
  },
  listModules: {
    display: "flex",
    flexDirection: "column",
    marginRight: 10,
  },
  navLinks: {
    textDecoration: "none",
    color: "#22658A",
  },
  navLinksDisabled: {
    textDecoration: "none",
    color: "#69706b",
    cursor: "not-allowed",
  },
  linkButton: {
    textDecoration: "none",
  },
  linkButton: {
    textDecoration: "none",
  },
  navCurrent: {
    textDecoration: "underline",
    color: "#22658A",
  },
  linkJump: {
    color: "#22658A",
    textDecoration: "underline",
    fontWeight: "bold",
  },
  headingPr: {
    color: "#2b3033",
  },
  progressBar: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

const Module = ({ questionData, allQuestionsData, FeatureFlags }) => {
  const classes = useStyles();

  const [nextButton, setNextButton] = useState(
    questionData.questionType === "learningContent"
  );

  useEffect(() => {
    setNextButton(questionData.questionType === "learningContent");
  }, [questionData]);

  let prevPage = "";
  let nextPage = "";

  //check the module status
  let firstQuestion = questionData.questionNumber === 1;
  let lastQuestion = questionData.questionNumber === allQuestionsData.length;

  let progress = (questionData.questionNumber / allQuestionsData.length) * 100;

  const retry = FeatureFlags.filter(
    (f) => f.feature === "Allow question retry (multiple choice)"
  )[0].on;

  const shortAnswer = FeatureFlags.filter(
    (f) => f.feature === "Multiple choice questions"
  )[0].on;

  const textInstructions = FeatureFlags.filter(
    (f) => f.feature === "Show text form instructional content"
  )[0].on;

  const getQuestionComponent = () => {
    switch (questionData.questionType) {
      case "learningContent":
        return (
          <LearningContent
            moduleInfo={questionData}
            textInstructions={textInstructions}
          />
        );
      case "coding":
        if (questionData.questionNumber === allQuestionsData.length) {
          return (
            <FinalExercise
              moduleInfo={questionData}
              allowNext={() => setNextButton(true)}
            />
          );
        } else {
          return (
            <CodingQuestion
              moduleInfo={questionData}
              allowNext={() => setNextButton(true)}
            />
          );
        }
      case "multipleChoice":
        return (
          <MultipleChoiceQuestion
            key={questionData.questionNumber}
            questionData={questionData}
            allowNext={() => setNextButton(true)}
            retry={retry}
            shortAnswer={!shortAnswer}
            countdown={questionData.countdown}
          />
        );
      default:
        return <div>Question type match error</div>;
    }
  };

  // const [questionComponent, setQuestionComponent] = useState(
  //   calculatedQuestionComponent
  // );

  // not allowing question go back for now
  // const prevButton = !firstQuestion;
  const prevButton = false;

  // set the previous link
  const prev = parseInt(questionData.questionNumber) - 1;
  prevPage = `/module/${prev}`;

  // set the next link
  const next = parseInt(questionData.questionNumber) + 1;
  nextPage = `/module/${next}`;

  // Open the table of contents
  const [open, setOpen] = React.useState(true);

  // create the table of contents sidebar
  const sideBar = allQuestionsData.map((q) => {
    const hasBeenDone = q.questionNumber < questionData.questionNumber;
    const isCurrentQuestion = q.questionNumber === questionData.questionNumber;
    return (
      // change to link if go back is allowed
      <div
        key={q.questionNumber}
        className={
          isCurrentQuestion
            ? classes.navCurrent
            : hasBeenDone
            ? classes.navLinks
            : classes.navLinksDisabled
        }
      >
        <Typography paragraph>
          <FormControlLabel
            id={q.questionNumber}
            control={<Checkbox checked={hasBeenDone} name="checkedC" />}
          />
          {q.pageTitle}
        </Typography>
      </div>
    );
  });

  return (
    <div>
      <HeaderBar />
      <div className={classes.root}>
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
        >
          <Toolbar />
          <div className={classes.toolbar}>
            <div
              className={clsx({
                [classes.hide]: !open,
              })}
            >
              <Typography variant="h6" className={classes.headingPr}>
                {" "}
                Overall Progress{" "}
              </Typography>
              <div className={classes.progressBar}>
                <Box display="flex" alignItems="center">
                  <Box width="100%" mr={1}>
                    <LinearProgress variant="determinate" value={progress} />
                  </Box>
                  <Box minWidth={15}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                    >{`${Math.round(progress)}%`}</Typography>
                  </Box>
                </Box>
              </div>
            </div>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
              edge="start"
              className={clsx(classes.menuButton, {
                [classes.hide]: open,
              })}
            >
              <MenuIcon />
            </IconButton>

            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(false)}
              edge="start"
              className={clsx(classes.menuButton, {
                [classes.hide]: !open,
              })}
            >
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider className={classes.divider} />
          <div
            className={clsx(classes.listModules, {
              [classes.hide]: !open,
            })}
          >
            {sideBar}
          </div>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.buttonGroup}>
            {prevButton ? (
              <Link href={prevPage} className={classes.linkButton}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.progressButton}
                >
                  Prev
                </Button>
              </Link>
            ) : (
              <div></div>
            )}
            {/* {!nextButton ? <div></div> : <></>} */}
            {lastQuestion && nextButton && !firstQuestion ? (
              <Link href="/endScreen" className={classes.linkButton}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.progressButton}
                >
                  Finish
                </Button>
              </Link>
            ) : (
              <></>
            )}
            {nextButton && !lastQuestion && (
              <Link href={nextPage} className={classes.linkButton}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.progressButton}
                >
                  Next
                </Button>
              </Link>
            )}
          </div>
          {getQuestionComponent()}
        </main>
      </div>
    </div>
  );
};

// This gets called on every request
export async function getServerSideProps({ params, res, req }) {
  // get specific question data
  const questionAPIResponse = await payload.find({
    collection: "questions",
    limit: 1,
    where: {
      questionNumber: {
        equals: params.id,
      },
    },
  });
  const questionData = questionAPIResponse.docs[0];

  if (questionData.questionType === "multipleChoice") {
    // split the values from database and make separate options
    const answerOptions = questionData.answerOptions.split(" || ");
    for (let i = answerOptions.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [answerOptions[i], answerOptions[j]] = [
        answerOptions[j],
        answerOptions[i],
      ];
    }
    questionData.answerOptions = answerOptions;
  }

  const userId = getCookie("userId", { req, res });

  // const questionsDoneData = await payload.find({
  //   collection: "userAnswers",
  //   limit: 50,
  //   where: {
  //     userId: {
  //       equals: userId,
  //     },
  //   },
  // });

  // let questionsDone = [];
  // if (questionsDoneData.totalDocs !== 0) {
  //   questionsDone = questionsDoneData.docs.map((q) => {
  //     return Number(q.questionNumber);
  //   });

  //   console.log(questionsDone.sort());

  //   // const max = Math.max(...questionsDone);
  // }

  const allquestionsAPIResponse = await payload.find({
    collection: "questions",
    limit: 50,
  });

  const allQuestionsData = allquestionsAPIResponse.docs;

  // TODO: pretty sure this sorting isn't needed
  //sort res by questions number in ascending order
  allQuestionsData.sort((q1, q2) =>
    q1.questionNumber < q2.questionNumber
      ? -1
      : q1.questionNumber > q2.questionNumber
      ? 1
      : 0
  );

  const FeatureFlagsAPIResponse = await payload.find({
    collection: "featureFlags",
    limit: 10,
  });

  const FeatureFlags = FeatureFlagsAPIResponse.docs;

  // Pass data to the page via props
  return {
    props: { questionData, allQuestionsData, FeatureFlags },
  };
}

export default Module;
