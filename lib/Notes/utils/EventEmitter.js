const EventEmitter = {
  events: {},
  dispatch(event, data) {
    if (!this.events[event]) return;

    this.events[event](data);
  },
  subscribe(event, callback) {
    this.events[event] = callback;
  },
  unsubscribe(event) {
    if (!this.events[event]) return;

    delete this.events[event];
  },
};

export default EventEmitter;
