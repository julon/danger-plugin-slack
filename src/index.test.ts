import {
  emptyResults,
  failsResults,
  failsResultsWithoutMessages,
  summaryResults,
  warnResults,
} from "./ExampleDangerResults"
import slack from "./index"
import { SlackOptions } from "./SlackInterfaces"

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

  it("Checks for a that message has been called", () => {
    global.danger = {
      github: { pr: { title: "My Test Title", number: 89 } },
    }
    const options: SlackOptions = {
      url: "https://hooks.slack.com/services/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",
      username: "jacky",
    }
    slack(options)

    expect(global.message).toHaveBeenCalledWith("PR Title: My Test Title")
  })
})
