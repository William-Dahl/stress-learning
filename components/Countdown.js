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

const Countdown = ({ seconds = 30, finished, timeout, setTime }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const classes = useStyles();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    setTime(seconds - timeLeft);

    if (finished) {
      clearInterval(interval);
      return;
    }

    if (!timeLeft) {
      timeout();
      clearInterval(interval);
      return;
    }

    return () => clearInterval(interval);
  }, [timeLeft, finished]);

  return (
    <div className={timeLeft > 60 ? classes.timeText : classes.timeTextRed}>
      {timeLeft}s
    </div>
  );
};

export default Countdown;
