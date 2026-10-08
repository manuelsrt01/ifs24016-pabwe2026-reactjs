import { useState, useCallback } from "react";

export default function useInput(defaultValue = "") {
  const [value, setValue] = useState(defaultValue);

  const onChange = useCallback((event) => {
    const { type, checked, value: inputValue } = event.target;
    setValue(type === "checkbox" ? checked : inputValue);
  }, []);

  const reset = useCallback(() => setValue(defaultValue), [defaultValue]);

  return [value, onChange, setValue, reset];
}
