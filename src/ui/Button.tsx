import React from "react";

import classes from "./Button.module.css";

export default function Button({ text, icon, ...props }) {
  return (
    <button className={classes.button} {...props}>
      {icon}
      <span className={classes.text}>{text}</span>
    </button>
  );
}
