"use client";
import React, { useEffect, useRef, useState } from "react";

export type NumericInputProps = {
  value?: number | null;
  onCommit: (n: number | null) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  allowNegative?: boolean;
  allowDecimal?: boolean;
  // If true, commas will be accepted as decimal separator and converted to dot
  acceptComma?: boolean;
  // Optional aria-label
  ariaLabel?: string;
};

function normalizeText(
  t: string,
  { allowNegative, allowDecimal, acceptComma }: { allowNegative?: boolean; allowDecimal?: boolean; acceptComma?: boolean }
): string {
  let s = t;
  if (acceptComma) s = s.replace(/,/g, ".");
  // Remove invalid characters, keep digits, optional leading '-', and one '.'
  // Allow empty string during editing
  // Build a dynamic regex
  const sign = allowNegative ? "-?" : "";
  const dec = allowDecimal ? "(?:\\.\\d*)?" : "";
  const re = new RegExp(`^${sign}\\d*${dec}$`);
  if (s === "" || re.test(s)) return s;
  // If not valid, try to coerce by removing invalid chars
  let out = "";
  let hasDot = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch >= "0" && ch <= "9") { out += ch; continue; }
    if (allowDecimal && ch === "." && !hasDot) { out += ch; hasDot = true; continue; }
    if (allowNegative && ch === "-" && out === "") { out += ch; continue; }
  }
  return out;
}

function valueToText(v: number | null | undefined): string {
  if (v === null || v === undefined) return "";
  if (!Number.isFinite(v)) return "";
  return String(v);
}

export default function NumericInput({
  value,
  onCommit,
  className,
  placeholder,
  disabled,
  inputMode = "decimal",
  allowNegative = true,
  allowDecimal = true,
  acceptComma = true,
  ariaLabel,
}: NumericInputProps) {
  const [text, setText] = useState<string>(valueToText(value));
  const [focused, setFocused] = useState(false);
  const lastPropValue = useRef<number | null | undefined>(value);

  // Sync when external value changes (and not actively editing)
  useEffect(() => {
    if (!focused && lastPropValue.current !== value) {
      setText(valueToText(value));
      lastPropValue.current = value;
    }
  }, [value, focused]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const next = normalizeText(raw, { allowNegative, allowDecimal, acceptComma });
    setText(next);
  };

  const commit = () => {
    const s = normalizeText(text.trim(), { allowNegative, allowDecimal, acceptComma });
    if (s === "" || s === "-" || s === "." || s === "-." ) {
      onCommit(null);
      setText("");
      return;
    }
    const n = Number(s);
    if (Number.isNaN(n)) {
      onCommit(null);
      setText("");
    } else {
      onCommit(n);
      setText(String(n)); // normalize
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commit();
    } else if (e.key === "Escape") {
      // Revert to external value
      setText(valueToText(value));
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="text"
      className={className}
      value={text}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={() => { commit(); setFocused(false); }}
      onFocus={() => setFocused(true)}
      onKeyDown={onKeyDown}
      disabled={disabled}
      inputMode={inputMode}
      aria-label={ariaLabel}
      // Helps mobile keyboards show numeric keypad with decimals
      pattern={allowNegative ? "-?\\d*(?:[.,]\\d*)?" : "\\d*(?:[.,]\\d*)?"}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
    />
  );
}
