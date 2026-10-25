"use client";

import { useId, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { matchSkills } from "@/lib/skillSearch";
import { useSkillOptions } from "@/lib/useSkillOptions";

// Keyword box that doubles as a skills dropdown: tapping it lists every skill,
// typing narrows the list to the skills the text means ("chikdcare" → Child Care).
export function SkillSearchBox({
  value,
  onValueChange,
  onSearch,
  onPickSkill,
  placeholder,
  ariaLabel,
  barClassName,
  inputClassName,
  buttons,
}: {
  value: string;
  onValueChange: (value: string) => void;
  // Runs the typed text as a search; only called with non-empty text.
  onSearch: () => void;
  onPickSkill: (skill: string) => void;
  placeholder: string;
  ariaLabel: string;
  barClassName: string;
  inputClassName: string;
  // Search button(s) for the end of the bar; give them type="submit".
  buttons: React.ReactNode;
}) {
  const skillOptions = useSkillOptions();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const typed = value.trim();
  // An empty box, or one that already holds a skill name, lists every skill
  // rather than only that one.
  const browsing =
    !typed || skillOptions.some((s) => s.toLowerCase() === typed.toLowerCase());
  const suggestions = browsing ? skillOptions : matchSkills(value, skillOptions);
  const title = browsing ? "All skills" : "Matching skills";

  function pick(skill: string) {
    onValueChange(skill);
    setOpen(false);
    onPickSkill(skill);
  }

  // An empty search opens the list instead of searching for nothing.
  function submit() {
    setOpen(false);
    if (!typed) {
      inputRef.current?.focus();
      setOpen(true);
      return;
    }
    onSearch();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && suggestions[active]) pick(suggestions[active]);
      else submit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <form
        role="search"
        className={barClassName}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className={inputClassName}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          suppressHydrationWarning
        />
        <button
          type="button"
          aria-label={open ? "Hide skills" : "Show all skills"}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (open) return setOpen(false);
            inputRef.current?.focus();
            setOpen(true);
          }}
          className="shrink-0 px-2 text-dark/50 cursor-pointer"
        >
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </button>
        {buttons}
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label={title}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-gray-100 bg-white py-1 text-left shadow-[0px_19px_40px_0px_rgba(0,0,0,0.10)]"
        >
          <li
            role="presentation"
            className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted"
          >
            {title}
          </li>
          {suggestions.map((s, index) => (
            <li
              key={s}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(s)}
              className={`mx-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark tracking-[0.25px] active:bg-primary-50 ${
                index === active ? "bg-primary-50" : ""
              }`}
            >
              <Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={2} />
              <span className="flex-1 truncate">{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
