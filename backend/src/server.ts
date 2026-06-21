import { createApp } from './app';
import { env } from './configs/env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Life OS API listening on port ${env.port} (${env.nodeEnv})`);
});
