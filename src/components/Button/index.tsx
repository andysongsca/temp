import React from "react";
import { Button as AntdButton } from "antd";
import Theme, { ThemeProps } from "../themes";

interface ButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
  type: "text" | "link" | "ghost" | "default" | "primary" | "dashed" | undefined;
  onClick: () => void;
}

const Button = ({ type, children, onClick, disabled = false }: ButtonProps & ThemeProps) => {
  return (
    <Theme>
      <AntdButton type={type} disabled={disabled} onClick={onClick}>
        {children}
      </AntdButton>
    </Theme>
  );
};

export default Button;
