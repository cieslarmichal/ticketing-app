import nats, { Stan } from 'node-nats-streaming';

class NatsClient {
  private client: Stan;

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this.client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log(`Connected to NATS: ${url}`);

        resolve();
      });

      this.client?.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export const natsClient = new NatsClient();
