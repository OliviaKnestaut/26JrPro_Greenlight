import { Typography } from "antd";
import React from "react";

const { Text } = Typography;

type FieldLabelProps = {
  children: React.ReactNode;
  required?: boolean;
  secondary?: boolean;
  subtitle?: string;
  style?: React.CSSProperties;
};

/**
 * A reusable component for form field labels that displays
 * an asterisk (*) for required fields to improve accessibility
 */
export function FieldLabel({ children, required = false, secondary = false, subtitle, style }: FieldLabelProps) {
  return (
    <>
      <Text type={secondary ? "secondary" : undefined} style={{ display: "block", ...style }}>
        {children}
        {required && <span style={{ color: "var(--red-5)", marginLeft: 4 }}>*</span>}
      </Text>
      {subtitle && (
        <Text type="secondary" style={{ display: "block", marginTop: 4, marginBottom: 8 }}>
          {subtitle}
        </Text>
      )}
    </>
  );
}

export default FieldLabel;
