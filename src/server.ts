import 'dotenv/config';

import { createApp } from './app';
import { getEnv } from './config/env';

const env = getEnv();
const port = env.PORT;
const app = createApp();

app.listen(port, () => {
  console.log(`Listening on :${port}`);
});
