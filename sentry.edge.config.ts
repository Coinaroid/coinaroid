// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://aae2f69e7b9cdbb03bb5ba58ba359cbf@o4509270755049472.ingest.us.sentry.io/4509270756163584",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
