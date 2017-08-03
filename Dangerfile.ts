// Import the feedback functions
import { fail, markdown, message, warn } from "danger"
import slack from "./src/index"
import { SlackOptions } from "./src/SlackInterfaces"

fail("hello")

message("*Message* to everyone")

warn("warning you about something")

const options: SlackOptions = {
  url: "https://hooks.slack.com/services/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",
  username: "jacky",
}
slack(options)
