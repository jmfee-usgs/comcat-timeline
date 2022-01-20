import { Fragment, ReactElement } from "react";
import { CatalogEvent, ProductSummary, summarizeEvent } from "../Catalog";
import { EventHeader } from "./EventHeader";
import { ProductTable } from "./ProductTable";
import { useFetch } from "../useFetch";

export interface TimelineProps {
  eventId?: string;
  host?: string;
}

export function Timeline({
  eventId,
  host = "http://earthquake.usgs.gov",
}: TimelineProps): ReactElement {
  const url = eventId
    ? `${host}/fdsnws/event/1/query?` +
      [`eventid=${eventId}`, "format=geojson", "includesuperseded=true"].join(
        "&"
      )
    : undefined;
  const catalog = useFetch<CatalogEvent>({ url });

  function getProductLink(p: ProductSummary) {
    return `${host}/product/${p.type}/${p.code}/${p.source}/${p.updateTime}/pdl_product.json`;
  }

  if (catalog.loading) {
    return <p className="alert info">Loading event {eventId}</p>;
  } else if (catalog.error) {
    return (
      <p className="alert error">
        Error loading event {eventId}:
        <br />
        {"" + catalog.error}
      </p>
    );
  } else if (!catalog.data) {
    return <p className="alert info">Select an Event</p>;
  } else {
    // have event
    const summary = summarizeEvent(catalog.data);
    return (
      <Fragment>
        <h2>{summary.properties.title}</h2>
        <EventHeader event={summary} host={host}></EventHeader>

        <h3>Products</h3>
        <ProductTable event={summary} getProductLink={getProductLink} />
      </Fragment>
    );
  }
}
