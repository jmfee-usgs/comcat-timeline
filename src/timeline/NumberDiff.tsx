import { Fragment, ReactElement } from "react";

interface NumberDiffProps {
  reference?: number;
  value?: number;
}

export function NumberDiff({
  reference,
  value,
}: NumberDiffProps): ReactElement {
  if (!value) {
    return <Fragment>–</Fragment>;
  }

  return (
    <Fragment>
      {formatDiff(reference ? value - reference : undefined)}
      <br />
      <small className="value">{value}</small>
    </Fragment>
  );
}

function formatDiff(diff?: number) {
  if (diff === undefined || isNaN(diff)) {
    return "–";
  }
  return (diff >= 0 ? "+" : "") + diff.toFixed(2);
}
