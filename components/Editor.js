import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

const useStyles = makeStyles(() => ({
  htmlControl: {
    flexGrow: 1,
    overflow: "hidden",
    borderRadius: "10px",
  },
}));

export default function Editor(props) {
  const classes = useStyles();
  const { value, onChange } = props;
  return (
    <CodeMirror
      className={classes.htmlControl}
      value={value}
      height="100%"
      theme="dark"
      extensions={[html({ matchClosingTags: false, autoCloseTags: false })]}
      onChange={onChange}
    />
  );
}
