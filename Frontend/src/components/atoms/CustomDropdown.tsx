"use client";
import React, { useState, useRef, useEffect } from "react";

export interface DropdownProps {
  options: { label: string; value: string }[];
  selected: string | string[];
  onSelect?: (value: string) => void;
  onSelectMulti?: (values: string[]) => void;
  multi?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const CustomDropdown: React.FC<DropdownProps> = ({
  options,
  selected,
  onSelect,
  onSelectMulti,
  multi = false,
  placeholder,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = multi
    ? (selected as string[]).length > 0
      ? `${(selected as string[]).length} selected`
      : placeholder || "Select..."
    : options.find((o) => o.value === selected)?.label ||
      placeholder ||
      "Select...";

  const handleSelect = (value: string) => {
    if (disabled) return;
    if (multi && onSelectMulti) {
      let newSelected: string[] = Array.isArray(selected) ? [...selected] : [];
      if (newSelected.includes(value)) {
        newSelected = newSelected.filter((v) => v !== value);
      } else {
        newSelected.push(value);
      }
      onSelectMulti(newSelected);
    } else if (!multi && onSelect) {
      onSelect(value);
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className="w-full px-3.5 py-2.5 sm:py-2 bg-white text-gray-900 border border-gray-300 rounded-lg flex justify-between items-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.99] md:active:scale-100 transition-transform duration-100"
      >
        <span className="truncate pr-2">{selectedLabel}</span>
        <span
          className={`ml-auto text-gray-400 text-xs transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        >
          &#9662;
        </span>
      </button>

      {open && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 sm:max-h-40 overflow-y-auto divide-y divide-gray-50">
          {options.length > 0 ? (
            options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-3.5 py-3 sm:py-2.5 hover:bg-blue-50/80 text-gray-700 hover:text-blue-700 text-xs sm:text-sm cursor-pointer flex items-center select-none transition-colors duration-150 ${
                  !multi && selected === option.value
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : multi &&
                        Array.isArray(selected) &&
                        selected.includes(option.value)
                      ? "bg-blue-50/50 font-medium text-blue-600"
                      : ""
                }`}
              >
                {multi && (
                  <input
                    type="checkbox"
                    readOnly
                    checked={
                      Array.isArray(selected) && selected.includes(option.value)
                    }
                    className="mr-2.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 accent-blue-600 shrink-0 pointer-events-none"
                  />
                )}
                <span className="truncate">{option.label}</span>
              </li>
            ))
          ) : (
            <li className="px-3.5 py-4 text-center text-gray-400 italic text-xs sm:text-sm select-none">
              No options available
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
