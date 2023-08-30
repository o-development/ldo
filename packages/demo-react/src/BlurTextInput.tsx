import React, { FunctionComponent, useState } from "react";

interface BlurTextInputProps {
  value: string;
  onBlurText: (text: string) => void;
}

const BlurTextInput: FunctionComponent<BlurTextInputProps> = ({
  value,
  onBlurText,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(value);

  return (
    <input
      type="text"
      value={isFocused ? text : value}
      onChange={(e) => setText(e.target.value)}
      onFocus={() => {
        setIsFocused(true);
        setText(value);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        if (e.target.value !== value) {
          onBlurText(e.target.value);
        }
      }}
    />
  );
};

export default BlurTextInput;
