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
  LIST_STATES: () => STATE_EVENTS_PAYLOAD('{"event": "list"}'),
  PEEK_STATE: () => STATE_EVENTS_PAYLOAD('{"event": "peek"}'),
  LISTEN: (token: string) => STATE_EVENTS_PAYLOAD(`{"event": "listen", "token": "${token}"}`),
  UNLISTEN: (token: string) => STATE_EVENTS_PAYLOAD(`{"event": "unlisten", "token": "${token}"}`),
  SET_STATE: (stateId: string) => STATE_EVENTS_PAYLOAD(`{"event": "set", "state": "${stateId}"}`),
  PUSH_STATE: (stateId: string) => STATE_EVENTS_PAYLOAD(`{"event": "push", "state": "${stateId}"}`),
  POP_STATE: (stateId: string) => STATE_EVENTS_PAYLOAD(`{"event": "pop", "state": "${stateId}"}`),
  CALL_STATE_THUMB: (state: { id: string }) => STATE_EVENTS_PAYLOAD(`{"event": "thumb", "state": "${state.id}"}`),
};
