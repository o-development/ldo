export abstract class RequesterResult {
  readonly uri: string;
  abstract readonly type: string;
  constructor(uri: string) {
    this.uri = uri;
  }
}
