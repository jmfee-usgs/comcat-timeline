export interface Catalog {
  features: CatalogEvent[];
  type: "FeatureCollection";
}

export interface CatalogEvent {
  geometry: {
    coordinates: number[];
    type: "Point";
  };
  id: string;
  properties: {
    alert?: string;
    cdi?: number;
    code: string;
    felt?: number;
    ids: string;
    mag?: number;
    magType?: string;
    mmi?: number;
    net: string;
    place: string;
    products: Record<string, CatalogProduct[]>;
    sig: number;
    sources: string;
    status: string;
    time: number;
    title: string;
    type: string;
    types: string;
    updated: number;
    url: string;
  };
  type: "Feature";
}

export interface CatalogProduct {
  code: string;
  id: string;
  indexid: string;
  indexTime: number;
  preferredWeight: number;
  source: string;
  status: string;
  type: string;
  updateTime: number;

  properties: {
    depth?: string;
    eventsource?: string;
    eventsourcecode?: string;
    latitude?: string;
    longitude?: string;
    magnitude?: string;
    time?: string;
    version?: string;
  };
}

export interface EventSummary extends CatalogEvent {
  depth?: number;
  latitude: number;
  longitude: number;
  magnitude?: number;
  time: Date;
  products: ProductSummary[];
}

export interface ProductSummary extends CatalogProduct {
  depth?: number;
  first?: boolean;
  last?: boolean;
  latitude?: number;
  longitude?: number;
  magnitude?: number;
  preferred?: boolean;
  time?: Date;
}

export function summarizeEvent(event: CatalogEvent): EventSummary {
  const [longitude, latitude, depth] = event.geometry.coordinates;
  const magnitude = event.properties.mag;
  const time = new Date(event.properties.time);

  return {
    ...event,
    depth,
    latitude,
    longitude,
    magnitude,
    products: summarizeProducts(event),
    time,
  };
}

export function summarizeProduct(product: CatalogProduct): ProductSummary {
  const props = product.properties;
  return {
    ...product,
    depth: props.depth ? +props.depth : undefined,
    latitude: props.latitude ? +props.latitude : undefined,
    longitude: props.longitude ? +props.longitude : undefined,
    magnitude: props.magnitude ? +props.magnitude : undefined,
    time: props.time ? new Date(props.time) : undefined,
  };
}

export function summarizeProducts(event: CatalogEvent): ProductSummary[] {
  // index by product source+type+code
  const index: { [key: string]: ProductSummary[] } = {};
  Object.entries(event.properties.products).forEach(([type, typeProducts]) => {
    typeProducts.forEach((p, i) => {
      const key = `${p.source}_${p.code}_${p.type}`;
      const summary = summarizeProduct(p);
      if (i === 0) {
        summary.preferred = true;
      }
      if (!index[key]) {
        index[key] = [];
      }
      index[key].push(summary);
      return summary;
    });
  });

  // assign first/last and flatten to array
  const products: ProductSummary[] = [];
  Object.entries(index).forEach(([key, keyProducts]) => {
    keyProducts.sort((a, b) => a.updateTime - b.updateTime);
    keyProducts[0].first = true;
    keyProducts[keyProducts.length - 1].last = true;
    products.push(...keyProducts);
  });

  // sort by updateTime
  products.sort((a, b) => a.updateTime - b.updateTime);

  return products;
}
