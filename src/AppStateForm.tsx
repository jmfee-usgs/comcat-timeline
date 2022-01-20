import { ChangeEvent, FormEvent, Fragment, useState } from "react";
import { AppState } from "./AppState";

export interface AppStateFormProps {
  setState: (data: AppState) => void;
  state: AppState;
}

/**
 * Choose host and/or event.
 *
 * @param props.setState
 *        callback to change host and event.
 * @param props.state
 *        current application state.
 * @returns
 */
export function AppStateForm({ setState, state }: AppStateFormProps) {
  const [formState, setFormState] = useState<AppState>(state);

  // set form state when inputs change
  function onFormChange(e: ChangeEvent<HTMLInputElement>) {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  }

  // set state when form submitted
  function onFormSubmit(e: FormEvent<HTMLFormElement>) {
    setState(formState);
    e.preventDefault();
  }

  return (
    <Fragment>
      <form className="site-search" onSubmit={onFormSubmit}>
        <label>
          Host
          <input
            defaultValue={state.host}
            name="host"
            onChange={onFormChange}
            type="text"
          />
        </label>
        <label>
          Event ID
          <input
            defaultValue={state.eventId}
            name="eventId"
            onChange={onFormChange}
            type="text"
          />
        </label>
        <button>Update</button>
      </form>
    </Fragment>
  );
}
