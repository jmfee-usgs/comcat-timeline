import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./App.css";
import { Template } from "./template/Template";
import { Timeline } from "./timeline/Timeline";
import { AppStateForm } from "./AppStateForm";
import { AppState } from "./AppState";
import { EventList } from "./timeline/EventList";

function App() {
  const DEFAULT_HOST = "https://earthquake.usgs.gov";

  const [state, setState] = useState<AppState>({
    eventId: undefined,
    host: DEFAULT_HOST,
  });

  // load state from url
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const eventId = searchParams.get("eventId") || undefined;
    const host = searchParams.get("host") || DEFAULT_HOST;
    setState({ eventId, host });
  }, []);

  // update state in both
  function setParams(newState: AppState) {
    const newParams = new URLSearchParams();
    if (newState.eventId) {
      newParams.set("eventId", newState.eventId);
    }
    if (newState.host !== DEFAULT_HOST) {
      newParams.set("host", newState.host);
    }
    setSearchParams(newParams);
    setState(newState);
  }

  return (
    <Template
      sectionNav={
        <>
          <AppStateForm setState={setParams} state={state} />
          <h3>Significant Events</h3>
          <EventList
            onSelect={(eventId) => setParams({ ...state, eventId })}
            selected={state.eventId}
            url={`${state.host}/earthquakes/feed/v1.0/summary/significant_month.geojson`}
          />
        </>
      }
      title="Event Timeline"
    >
      <Timeline eventId={state.eventId} host={state.host} />
    </Template>
  );
}

export default App;
