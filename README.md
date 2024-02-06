# Lemmy Webhook Manager

This is a GUI for my [LemmyWebhook](https://github.com/RikudouSage/LemmyWebhook) package.

## Running it:

Using docker compose:

```yaml
services:
  webhooks_ui:
    image: ghcr.io/rikudousage/lemmy-webhook-manager:latest
    ports:
      - 8008:80 # map to whatever port you want
    environment:
      - API_URL=https://api.webhooks.lemmings.world # replace with your api url
```
