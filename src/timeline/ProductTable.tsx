import { Fragment } from "react";
import { EventSummary, ProductSummary } from "../Catalog";
import { NumberDiff } from "./NumberDiff";
import { TimeDiff } from "./TimeDiff";
import "./ProductTable.css";

export interface ProductTableProps {
  event: EventSummary;
  getProductLink?: (product: ProductSummary) => string;
}

interface ProductTableRowProps extends ProductTableProps {
  link?: string;
  product: ProductSummary;
}

export function ProductTable({ event, getProductLink }: ProductTableProps) {
  return (
    <Fragment>
      <input type="radio" name="products" id="all-products" defaultChecked />
      <label htmlFor="all-products">All products</label>
      <input type="radio" name="products" id="only-show-first-last" />
      <label htmlFor="only-show-first-last">
        Only show first and last versions
      </label>
      <input type="radio" name="products" id="only-show-preferred" />
      <label htmlFor="only-show-preferred">Only show preferred</label>
      <input type="radio" name="products" id="only-show-origins" />
      <label htmlFor="only-show-origins">Only show origins</label>
      <br /> <input type="checkbox" id="only-show-diffs" defaultChecked />
      <label htmlFor="only-show-diffs">Hide values</label>
      <div className="horizontal-scrolling">
        <table>
          <thead>
            <tr>
              <th>
                <abbr title="Time reported by contributor">Sent</abbr>
              </th>
              <th>
                <abbr title="Time (this server) processed product, relative to Sent">
                  Indexed
                </abbr>
              </th>
              <th>Product</th>
              <th>Event ID</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Event Time</th>
              <th>Magnitude</th>
              <th>Depth</th>
              <th>Version</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {event.products.map((p) => (
              <ProductTableRow
                event={event}
                link={getProductLink ? getProductLink(p) : undefined}
                key={p.id}
                product={p}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="alert info">
        <small>
          * Sent is assigned by contributors, and does not necessarily reflect
          when a product was actually sent via PDL.
        </small>
      </p>
    </Fragment>
  );
}

function ProductTableRow({ event, link, product }: ProductTableRowProps) {
  const id = product.id.replace("urn:usgs-product:", "");
  const indexTime = new Date(product.indexTime);
  const props = product.properties;
  const updateTime = new Date(product.updateTime);

  return (
    <tr
      className={[
        `preferred-${!!product.preferred}`,
        `status-${product.status}`,
        `type-${product.type}`,
        ...(product.first ? ["version-first"] : []),
        ...(product.last ? ["version-last"] : []),
      ].join(" ")}
    >
      <td className="updateTime">
        <TimeDiff reference={event.time} value={updateTime} />
      </td>
      <td className="indexTime">
        <TimeDiff reference={updateTime} value={indexTime} />
      </td>
      <td className="id">{link ? <a href={link}>{id}</a> : id}</td>
      <td className="eventid">
        {props.eventsource} {props.eventsourcecode}
      </td>
      <td className="latitude">
        <NumberDiff reference={event.latitude} value={product.latitude} />
      </td>
      <td className="longitude">
        <NumberDiff reference={event.longitude} value={product.longitude} />
      </td>
      <td className="time">
        <TimeDiff reference={event.time} value={product.time} />
      </td>
      <td className="magnitude">
        <NumberDiff reference={event.magnitude} value={product.magnitude} />
      </td>
      <td className="depth">
        <NumberDiff reference={event.depth} value={product.depth} />
      </td>
      <td className="version">{props.version}</td>
      <td className="statue">{product.status}</td>
    </tr>
  );
}
