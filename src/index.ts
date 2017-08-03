import { IncomingWebhook } from "@slack/client"
import { Violation } from "../node_modules/danger/distribution/danger"
import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL"
import { DangerResults } from "../node_modules/danger/distribution/dsl/DangerResults"
import { SlackAttachment, SlackMessage, SlackOptions } from "./DangerPluginSlack"

/**
 * Current instance of Danger data
 */
declare var danger: DangerDSLType

/**
 * Current results of Danger run instance
 */
declare var results: DangerResults

/**
 * Report to Slack the result of Danger
 */
export default async function slack(options: SlackOptions) {
  if (!options.url) {
    throw Error("You forgot to set the webhook url")
  }

  const webhook = new IncomingWebhook(options.url)
  const msg: SlackMessage = buildDangerMessage(results, options)

  webhook.send(msg, (err, header, statusCode, body) => {
    if (err) {
      throw err
    }
  })
}

function buildDangerMessage(resultLists: DangerResults, options: SlackOptions): SlackMessage {
  const { fails, warnings, messages, markdowns } = resultLists
  const pr = danger.github.pr

  // temporary wild cast to retrieve url
  const prInfo: string = `<${(pr as any).html_url}|*PR#${pr.number}* - ${pr.title}>`
  const prAuthor: string = `<${(pr.user as any).html_url}|${pr.user.login}>`

  // override dynamic emoji if options.iconEmoji is set
  const currentEmoji: string = options.iconEmoji || getDynamicEmoji(fails, warnings)

  const msg: SlackMessage = {
    iconEmoji: currentEmoji,
    text: `${prInfo} by ${prAuthor}\n ${pr.body}`,
    attachments: [],
  }

  // prefix text if set
  if (options.text) {
    msg.text = `${options.text}\n${msg.text}`
  }

  // custom username if set
  if (options.username) {
    msg.username = options.username
  }

  // custom iconUrl if set
  if (options.iconUrl) {
    msg.iconUrl = options.iconUrl
  }

  // custom channel if set
  if (options.channel) {
    msg.channel = options.channel
  }

  // add messages as attachments
  if (!fails.length && !warnings.length && !messages.length) {
    msg.text += "\nNo output to show."
  } else {
    if (fails.length > 0) {
      msg.attachments.push(formatSlackAttachment("Fails", "danger", fails))
    }

    if (warnings.length > 0) {
      msg.attachments.push(formatSlackAttachment("Warnings", "warning", warnings))
    }

    if (messages.length > 0) {
      msg.attachments.push(formatSlackAttachment("Messages", "#999", messages))
    }
  }

  return msg
}

function getDynamicEmoji(errors: Violation[], warnings: Violation[]) {
  const emojiError = ":rage:"
  const emojiWarning = ":neutral_face:"
  const emojiHealthy = ":blush:"

  if (errors.length > 0) {
    return emojiError
  } else if (warnings.length > 0) {
    return emojiWarning
  } else {
    return emojiHealthy
  }
}

function formatSlackAttachment(
  title: string,
  color: string,
  violations: Violation[],
  isMarkdown?: boolean
): SlackAttachment {
  const titleWithCount: string = `${title} (${violations.length})`
  const textContent = violations.map(violation => `• ${violation.message}\n`).join()

  return {
    color,
    fallback: titleWithCount,
    title: titleWithCount,
    text: textContent,
  }
}
