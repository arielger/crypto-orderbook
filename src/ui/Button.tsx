import React from "react";

import classes from "./Button.module.css";

export default function Button({
  text,
  icon,
  type = "main",
  ...props
}: {
  text: string;
  icon?: JSX.Element;
  type?: "main" | "danger";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}): JSX.Element {
  return (
    <button className={`${classes.button} ${classes[type]}`} {...props}>
      {icon}
      <span className={classes.text}>{text}</span>
    </button>
  );
}
