import React, { useState, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import defaultTheme from "./default";
import darkTheme from "./dark";

export interface ThemeProps {
  themeName?: string;
}

const getThemeObj = (name: string | undefined) => {
  if (name === "default") {
    return defaultTheme;
  } else if (name === "dark") {
    return darkTheme;
  }
};

const Theme = ({ themeName, children }: ThemeProps & { children?: React.ReactNode }) => {
  const [theme, setTheme] = useState<any>(getThemeObj(themeName));
  useEffect(() => {
    setTheme(getThemeObj(themeName));
  }, [themeName]);
  // @ts-ignore
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

Theme.defaultProps = {
  themeName: "default",
};

export default Theme;
