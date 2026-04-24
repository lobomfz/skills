---
name: bunmq
description: "BunMQ background jobs. Use when implementing queues, workers, retries, cron schedules, intervals, rate limits, or async job processing."
---

# BunMQ

SQLite-backed job queue.

## Setup

```typescript
export const { Queue, Worker } = new BunMQ({ db: "./jobs.db" });

const emailQueue = new Queue<EmailPayload>("emails");
const emailWorker = new Worker("emails", processEmail);
```

## Adding Jobs

```typescript
const job = emailQueue.add("welcome", { to: "user@example.com" });

const job = emailQueue.add("report", { userId: 123 }, {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
  priority: 10,
  delay: 5000,
});

// Wait for result
const result = await emailQueue.add("sync", payload).waitUntilFinished();
```

## Worker and Events

```typescript
const worker = new Worker<NotificationPayload>("notifications", async (job) => {
  await sendNotification(job.data);

  return { sent: true };
});

worker.on("completed", (job, result) => log("done", job.id));
worker.on("failed", (job, error) => log("failed", job.id, error));
worker.on("retrying", (job, error, info) => log("retry", info.attempt));
worker.on("stalled", (job) => log("stalled", job.id));

// Graceful shutdown
await worker.stop({ graceful: true, timeout: 30000 });
```

## Scheduling

```typescript
// Cron pattern
queue.schedule("daily-report", {
  cron: "0 9 * * *",
  tz: "America/Sao_Paulo",
  data: { type: "daily" },
});

// Fixed interval
queue.schedule("health-check", {
  every: 60000,
  immediately: true,
});
```

## Rate Limiting

```typescript
const worker = new Worker("api-calls", processor, {
  limiter: { max: 100, duration: 60000 },
});
```
