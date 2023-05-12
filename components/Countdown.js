import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  timeText: {
    color: "#a6a6a6",
  },
  timeTextRed: {
    color: "red",
  },
}));

const Countdown = ({ seconds = 30, finished, timeout }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const classes = useStyles();

  useEffect(() => {
    console.log("test");
    if (!timeLeft) {
      timeout();
      return;
    }
    if (finished) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, finished]);

  return (
    <div className={timeLeft > 60 ? classes.timeText : classes.timeTextRed}>
      {timeLeft}s
    </div>
  );
};

export default Countdown;
