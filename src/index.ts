import { IncomingWebhook } from "@slack/client"
import { BitBucketServerPRDSL, GitHubPRDSL, Violation } from "../node_modules/danger/distribution/danger"
import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL"
import { DangerResults } from "../node_modules/danger/distribution/dsl/DangerResults"

export type SlackPRDSLType = "github" | "bitbucket_server"

export interface SlackOptions {
  webhookUrl: string
  text?: string
  username?: string
  iconEmoji?: string
  iconUrl?: string
  channel?: string
  prdsl?: SlackPRDSLType
}

export interface SlackAttachment {
  color: string
  fallback: string
  title: string
  text: string
  mrkdwn_in?: string[]
}

export interface SlackMessage {
  text: string
  username?: string
  iconEmoji?: string
  iconUrl?: string
  channel?: string
  attachments: SlackAttachment[]
}

export interface SlackJoinedPRDSLUser {
  login: string
  html_url: string
}

export interface SlackJoinedPRDSL {
  number: string | number
  body: string
  title: string
  user: SlackJoinedPRDSLUser
}

/**
 * Current instance of Danger data
 */
declare var danger: DangerDSLType

/**
 * Current results of Danger run instance
 */
declare var results: DangerResults

export function convertToSlackPRDSL(pr: any, type: SlackPRDSLType) {
  if (type === "bitbucket_server") {
    return {
      html_url: (pr as any).links.self[0].href,
      body: (pr as BitBucketServerPRDSL).description,
      number: (pr as BitBucketServerPRDSL).id,
      title: (pr as BitBucketServerPRDSL).title,
      user: {
        login: (pr as BitBucketServerPRDSL).author.user.name,
        html_url: (pr as BitBucketServerPRDSL).author.user.emailAddress
          ? "mailto: " + (pr as BitBucketServerPRDSL).author.user.emailAddress
          : "",
      },
    } as SlackJoinedPRDSL
  } else {
    return (pr as any) as SlackJoinedPRDSL
  }
}

/**
 * Report to Slack the result of Danger
 */
export default function slack(options: SlackOptions) {
  const webhook = new IncomingWebhook(options.webhookUrl)

  if (!options.prdsl) {
    options.prdsl = "github"
  }
  const msg: SlackMessage = createMessage(
    convertToSlackPRDSL(danger[options.prdsl].pr, options.prdsl),
    results,
    options
  )
  webhook.send(msg)
}

export function createMessage(pr: SlackJoinedPRDSL, resultLists: DangerResults, options: SlackOptions): SlackMessage {
  const msg: SlackMessage = {
    text: "",
    username: options.username || "DangerJS",
    iconEmoji: options.iconEmoji || ":open_mouth:",
    attachments: [],
  }

  // custom iconUrl if set
  if (options.iconUrl) {
    msg.iconUrl = options.iconUrl
  }

  // custom channel if set
  if (options.channel) {
    msg.channel = options.channel
  }

  // send only a custom text
  if (options.text) {
    msg.text = `${options.text}`
  } else {
    // send only the report

    const fails = resultLists.fails
    const warnings = resultLists.warnings
    const messages = resultLists.messages
    const markdowns = resultLists.markdowns

    // temporary wild cast to retrieve url
    // TODO: replace by proper html url property from danger type
    const prInfo: string = `<${(pr as any).html_url}|*PR#${pr.number}* - ${pr.title}>`
    const prAuthor: string = `<${(pr.user as any).html_url}|${pr.user.login}>`

    msg.iconEmoji = getDynamicEmoji(fails, warnings)
    msg.text = `${prInfo} by ${prAuthor}\n${pr.body}`

    // add violations as slack attachments
    if (!fails.length && !warnings.length && !messages.length) {
      msg.text += "\nNo output to show."
    } else {
      if (fails.length > 0) {
        msg.attachments.push(createAttachment("Fails", "danger", fails))
      }

      if (warnings.length > 0) {
        msg.attachments.push(createAttachment("Warnings", "warning", warnings))
      }

      if (messages.length > 0) {
        msg.attachments.push(createAttachment("Messages", "#999", messages))
      }

      if (markdowns.length > 0) {
        msg.attachments.push(
          createMarkdownAttachment(
            "Comments",
            "#EEE",
            markdowns.map((result: Violation) => {
              return result.message
            })
          )
        )
      }
    }
  }

  return msg
}

export function getDynamicEmoji(errors: Violation[], warnings: Violation[]) {
  const emojiError: string = ":rage:"
  const emojiWarning: string = ":neutral_face:"
  const emojiHealthy: string = ":blush:"

  if (errors.length > 0) {
    return emojiError
  } else if (warnings.length > 0) {
    return emojiWarning
  } else {
    return emojiHealthy
  }
}

export function createAttachment(title: string, color: string, violations: Violation[]): SlackAttachment {
  const titleWithCount: string = `${title} (${violations.length})`
  const textContent: string = violations.map(violation => `• ${violation.message}`).join("\n")

  return {
    color,
    fallback: titleWithCount,
    title: titleWithCount,
    text: textContent,
    mrkdwn_in: ["text"],
  }
}

export function createMarkdownAttachment(title: string, color: string, comments: string[]): SlackAttachment {
  return {
    color,
    fallback: title,
    title,
    text: comments.join("\n"),
    mrkdwn_in: ["text"],
  }
}
