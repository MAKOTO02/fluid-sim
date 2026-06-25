import type { Component } from "./component";
import type { StreamSource } from "../fluid/streamSource";

export class StreamSourceComponent implements Component {
  enabled = true;
  readonly source: StreamSource;

  constructor(source: StreamSource) {
    this.source = source;
  }
}
