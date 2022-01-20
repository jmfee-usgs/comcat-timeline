import { ReactElement, Fragment } from "react";

interface TimeDiffProps {
  reference?: Date;
  value?: Date;
}

export function TimeDiff({ reference, value }: TimeDiffProps): ReactElement {
  if (!value) {
    return <Fragment>–</Fragment>;
  }

  const diff = reference
    ? (value.getTime() - reference.getTime()) / 1000
    : undefined;

  return (
    <time dateTime={value.toISOString()}>
      {formatTimeDiff(diff)}
      <br />
      <small className="value">{value.toISOString()}</small>
    </time>
  );
}

function formatTimeDiff(diff?: number): string {
  if (diff === undefined || isNaN(diff)) {
    return "–";
  }

  let seconds = 0;
  let minutes = 0;
  let hours = 0;
  let days = 0;
  let years = 0;

  seconds = Math.abs(diff);
  if (seconds > 60) {
    minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    if (minutes > 60) {
      hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
      if (hours > 24) {
        days = Math.floor(hours / 24);
        hours = hours % 24;
        if (days > 365) {
          years = Math.floor(days / 365);
          days = days % 365;
        }
      }
    }
  }

  var formatted = "";
  if (years != 0) {
    formatted += years + "y";
  }
  if (days != 0) {
    formatted += days + "d";
  }
  if (hours != 0 && years === 0) {
    formatted += hours + "h";
  }
  if (minutes != 0 && years === 0 && days === 0) {
    formatted += minutes + "m";
  }
  if (years === 0 && days === 0 && hours === 0) {
    formatted += seconds.toFixed(1) + "s";
  }
  return (diff > 0 ? "+" : "-") + formatted;
}
