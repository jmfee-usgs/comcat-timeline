import { Fragment, ReactElement } from "react";
import { EventSummary } from "../Catalog";

export interface EventHeaderProps {
  event: EventSummary;
  host: string;
}

export function EventHeader({ event, host }: EventHeaderProps): ReactElement {
  const time = event.time.toISOString();

  return (
    <Fragment>
      <dl className="horizontal">
        <dt>Event ID</dt>
        <dd>{event.id}</dd>

        <dt>Location</dt>
        <dd>{formatLocation(event.latitude, event.longitude)}</dd>

        <dt>Time</dt>
        <dd>
          <time dateTime={time}>{time}</time>
        </dd>

        <dt>Depth</dt>
        <dd>{event.depth}</dd>

        <dt>Magnitude</dt>
        <dd>
          {event.magnitude} {event.properties.magType}
        </dd>

        <dt>Links</dt>
        <dd>
          <a href={event.properties.url} target="blank">
            Event Page
          </a>
        </dd>
        <dd>
          <a
            href={`${host}/earthquakes/feed/v1.0/detail/${event.id}.geojson`}
            target="blank"
          >
            GeoJSON Feed
          </a>
        </dd>
        <dd>
          <a
            href={`${host}/fdsnws/event/1/query?eventid=${event.id}&format=geojson&includesuperseded=true`}
            target="blank"
          >
            GeoJSON (w/ superseded)
          </a>
        </dd>
      </dl>
    </Fragment>
  );
}

function formatLocation(latitude: number, longitude: number): string {
  return (
    `${Math.abs(latitude).toFixed(3)}°${latitude < 0 ? "S" : "N"}` +
    `${Math.abs(longitude).toFixed(3)}°${longitude < 0 ? "W" : "E"}`
  );
}
