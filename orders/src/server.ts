import http, { RequestListener } from 'http';

export class Server {
  public instance: http.Server;

  public constructor(listener: RequestListener) {
    this.instance = http.createServer(listener);
  }

  public listen() {
    const httpPort = 3000;

    this.instance.listen(httpPort);
  }

  public close() {
    this.instance.close();
  }
}
