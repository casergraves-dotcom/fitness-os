# Mobile Development

To test Fitness OS on a physical phone:

1. Start the dev server

```bash
npm run dev -- --hostname 0.0.0.0
```

2. Configure `next.config.ts`

```ts
allowedDevOrigins: [
  "http://192.168.1.16:3000",
]
```

3. Visit

```
http://192.168.1.16:3000
```

from a device on the same Wi-Fi.