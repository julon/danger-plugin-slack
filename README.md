# danger-plugin-slack

[![Build Status](https://travis-ci.org/julon/danger-plugin-slack.svg?branch=master)](https://travis-ci.org/julon/danger-plugin-slack)
[![npm version](https://badge.fury.io/js/danger-plugin-slack.svg)](https://badge.fury.io/js/danger-plugin-slack)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/julon/danger-plugin-slack.svg)](https://greenkeeper.io/)

> Report to Slack the result of Danger

## Usage

Install:

```sh
yarn add danger-plugin-slack --dev
```

To send the Danger report to slack:

```js
// dangerfile.js
import slack from 'danger-plugin-slack'

const options = {
  webhookUrl: "YOUR_SLACK_WEBHOOK_URL" // only the webhook URL is required
}

slack(options) // to invoke at the end of the dangerfile to get the full report
```

To send a specific message:

```js
// dangerfile.js
import slack from 'danger-plugin-slack'

const options = {
  webhookUrl: "YOUR_SLACK_WEBHOOK_URL",
  text: "Hello world!", // A custom message to send instead of the report (optional, default: null)
  username: "Jacky", // A custom sender name (optional, default: "DangerJS")
  iconEmoji: ":sunglasses:", // A custom emoji (optional, default: ":open_mouth:")
  iconUrl: "http://path/custom/icon/url", // A custom iconUrl (optional, default: null)
  channel: "#general", // A custom channel (optional)
}

slack(options)
```


## Incoming Webhook
To get a new incoming webhook url, you will have to [click here](https://my.slack.com/services/new/incoming-webhook/).
Keep in mind that optional parameters such as channel or emoji doesn't work with integrations declared as Slack Apps. So it's better to create a simple incoming webhook.

## Changelog

See the GitHub [release history](https://github.com/julon/danger-plugin-slack/releases).

## Contributing

See [CONTRIBUTING.md](contributing.md).
