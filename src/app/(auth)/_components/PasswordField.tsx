"use client";

import { useState } from "react";
import { passwordStrength, STRENGTH_LABELS, MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { FieldLabel, inputClass } from "./ui";

const STRENGTH_COLORS = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-lime-400", "bg-emerald-400"];

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  showStrength = false,
  disabled,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  showStrength?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const strength = passwordStrength(value);
  const hintId = `${id}-hint`;

  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={showStrength ? hintId : undefined}
          minLength={autoComplete === "new-password" ? MIN_PASSWORD_LENGTH : undefined}
          className={`${inputClass} pr-20`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute inset-y-1.5 right-1.5 rounded-lg px-3 text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:text-indigo-200/70 dark:hover:bg-white/10 dark:hover:text-white"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {showStrength && (
        <div id={hintId} className="mt-2" aria-live="polite">
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`h-1.5 flex-1 rounded-full ${
                  value && strength >= step ? STRENGTH_COLORS[strength] : "bg-neutral-200 dark:bg-white/10"
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-indigo-200/50">
            {value ? (
              <>
                Strength: <span className="font-medium">{STRENGTH_LABELS[strength]}</span>.{" "}
              </>
            ) : null}
            At least {MIN_PASSWORD_LENGTH} characters; mixing upper and lower case, numbers and symbols makes it
            stronger.
          </p>
        </div>
      )}
    </div>
  );
}
