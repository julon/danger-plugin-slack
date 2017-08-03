import { GitHubPRDSL, Violation } from "../node_modules/danger/distribution/danger"
import { emptyResults, failsResults, failsResultsWithoutMessages, summaryResults, warnResults } from "./danger-mock"
import slack from "./index"
import {
  createAttachment,
  createMarkdownAttachment,
  createMessage,
  getDynamicEmoji,
  SlackAttachment,
  SlackOptions,
} from "./index"

declare const global: any

describe("slack()", () => {
  beforeEach(() => {
    global.warn = jest.fn()
    global.message = jest.fn()
    global.fail = jest.fn()
    global.markdown = jest.fn()
  })

  afterEach(() => {
    global.warn = undefined
    global.message = undefined
    global.fail = undefined
    global.markdown = undefined
  })
})

describe("createMessage()", () => {
  let pr: any
  let options: SlackOptions
  let expectedText: string

  beforeEach(() => {
    pr = {
      html_url: "custom_url",
      number: 10,
      title: "super PR",
      body: "Some text in body",
      user: {
        login: "julon",
        html_url: "julon_url",
      },
    }

    options = {
      webhookUrl: "url",
      text: "text",
      username: "username",
      iconEmoji: "iconEmoji",
      iconUrl: "iconUrl",
      channel: "#channel",
    }

    expectedText = "<custom_url|*PR#10* - super PR> by <julon_url|julon>\nSome text in body"
  })

  it("should output the correct options (text, username, iconEmoji, iconUrl, channel) when set", () => {
    const result = createMessage(pr, summaryResults, options)
    expect(result.text).toBe(`text`)
    expect(result.username).toBe("username")
    expect(result.iconEmoji).toBe("iconEmoji")
    expect(result.iconUrl).toBe("iconUrl")
    expect(result.channel).toBe("#channel")
  })

  it("should output the report text when no text is set", () => {
    const result = createMessage(pr, summaryResults, { webhookUrl: "" })
    expect(result.text).toBe(expectedText)
  })

  it("should output no attachment and append a message saying nothing to show when results is empty", () => {
    const result = createMessage(pr, emptyResults, { webhookUrl: "" })
    expect(result.text).toBe(`${expectedText}\nNo output to show.`)
  })

  it("should output one fail attachment when results contains a fail", () => {
    const result = createMessage(pr, failsResults, { webhookUrl: "" })
    expect(result.attachments[0]).toEqual({
      color: "danger",
      fallback: "Fails (1)",
      title: "Fails (1)",
      text: "• Failing message",
      mrkdwn_in: ["text"],
    })
  })
})

describe("getDynamicEmoji()", () => {
  it("should return an angry emoji if there is at least a fail", () => {
    const { fails, warnings } = failsResults
    const result = getDynamicEmoji(fails, warnings)
    expect(result).toBe(":rage:")
  })

  it("should return an neutral face emoji if there is no fail and at least a warning", () => {
    const { fails, warnings } = warnResults
    const result = getDynamicEmoji(fails, warnings)
    expect(result).toBe(":neutral_face:")
  })

  it("should return an happy face emoji if there is no fail and no warning", () => {
    const { fails, warnings } = emptyResults
    const result = getDynamicEmoji(fails, warnings)
    expect(result).toBe(":blush:")
  })

  it("should return an angry emoji if there is at least a fail and some warning", () => {
    const { fails, warnings } = summaryResults
    const result = getDynamicEmoji(fails, warnings)
    expect(result).toBe(":rage:")
  })
})

describe("createAttachment()", () => {
  it("should return an attachment with a title, a black color and one violation", () => {
    const violations: Violation[] = [{ message: "This is a violation" }]
    const result: SlackAttachment = createAttachment("title", "#000000", violations)
    expect(result).toEqual({
      color: "#000000",
      fallback: "title (1)",
      title: "title (1)",
      text: "• This is a violation",
      mrkdwn_in: ["text"],
    })
  })
})

describe("createMarkdownAttachment()", () => {
  it("should return an attachment with a title, a black color and one violation", () => {
    const markdowns: string[] = ["This is markdown"]
    const result: SlackAttachment = createMarkdownAttachment("title", "#000000", markdowns)
    expect(result).toEqual({
      color: "#000000",
      fallback: "title",
      title: "title",
      text: "This is markdown",
      mrkdwn_in: ["text"],
    })
  })
})
