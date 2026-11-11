import React, { Fragment } from "react";

// Text with line breaks: "line one\nline two" -> line one<br />line two
export function MultiLine({ text }) {
  const lines = String(text || "").split("\n");

  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}

// Section heading: lines + a highlighted <em> word at the end.
// accentNewLine = put the highlighted word on its own line.
export function SectionTitle({ lines, accent, accentNewLine }) {
  const textLines = (Array.isArray(lines) ? lines : []).filter(
    (line) => typeof line === "string"
  );

  return (
    <>
      {textLines.map((line, index) => {
        const isLast = index === textLines.length - 1;

        return (
          <Fragment key={index}>
            {index > 0 && <br />}
            {line}
            {isLast && accent && !accentNewLine && (
              <>
                {line ? " " : ""}
                <em>{accent}</em>
              </>
            )}
          </Fragment>
        );
      })}

      {accent && (accentNewLine || textLines.length === 0) && (
        <>
          {textLines.length > 0 && <br />}
          <em>{accent}</em>
        </>
      )}
    </>
  );
}
