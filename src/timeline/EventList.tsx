import { Fragment } from "react";
import { Catalog } from "../Catalog";
import { useFetch } from "../useFetch";
import "./EventList.css";

export interface EventListProps {
  onSelect?: (eventId: string) => void;
  selected?: string;
  url: string;
}

export function EventList({ onSelect, selected, url }: EventListProps) {
  const catalog = useFetch<Catalog>({ url });

  function onClick(eventId: string) {
    if (onSelect) {
      onSelect(eventId);
    }
  }

  if (catalog.loading) {
    return <p className="alert info">Loading...</p>;
  } else if (catalog.error) {
    return (
      <p className="alert error">
        Error loading:
        <br />
        {"" + catalog.error}
      </p>
    );
  } else {
    return (
      <Fragment>
        <ul className="no-style EventList">
          {catalog.data?.features.map((eq) => {
            return (
              <li key={eq.id}>
                <a
                  className={selected === eq.id ? "selected" : ""}
                  onClick={() => onClick(eq.id)}
                >
                  {eq.properties.title}
                </a>
              </li>
            );
          })}
        </ul>
      </Fragment>
    );
  }
}
