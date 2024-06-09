const STATE_EVENTS_PAYLOAD = (input: string) => {
  return `nodes: {
      "event": "payload",
      "type": "stateEvents",
      "id": "mini",
      "payload": ${input}
    }`;
};

export const messages = {
  INITIAL_LIST_EVENT: () => 'nodes: {"event": "list"}',
  SET_STATE: (stateId: string) => STATE_EVENTS_PAYLOAD(`{"event": "set", "state": "${stateId}"}`),
  CALL_STATE_THUMB: (state: { id: string }) => STATE_EVENTS_PAYLOAD(`{"event": "thumb", "state": "${state.id}"}`),
  LIST_STATES: () => STATE_EVENTS_PAYLOAD('{"event": "list"}'),
};
