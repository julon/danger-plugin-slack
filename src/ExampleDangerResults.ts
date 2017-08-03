import { DangerResults } from "../node_modules/danger/distribution/dsl/DangerResults"

export const emptyResults: DangerResults = {
  fails: [],
  warnings: [],
  messages: [],
  markdowns: [],
}

export const failsResultsWithoutMessages: DangerResults = {
  fails: [{} as any, {} as any],
  warnings: [],
  messages: [],
  markdowns: [],
}

export const warnResults: DangerResults = {
  fails: [],
  warnings: [{ message: "Warning message" }],
  messages: [],
  markdowns: [],
}

export const failsResults: DangerResults = {
  fails: [{ message: "Failing message" }],
  warnings: [],
  messages: [],
  markdowns: [],
}

export const summaryResults: DangerResults = {
  fails: [{ message: "Failing message Failing message" }],
  warnings: [{ message: "Warning message Warning message" }],
  messages: [{ message: "message" }],
  markdowns: ["markdown"],
}

export const asyncResults: DangerResults = {
  fails: [],
  warnings: [],
  messages: [],
  markdowns: [],
}
