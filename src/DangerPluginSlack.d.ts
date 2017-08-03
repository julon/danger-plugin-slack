export interface SlackOptions {
  url: string
  text?: string
  username?: string
  iconEmoji?: string
  iconUrl?: string
  channel?: string
}

export interface SlackAttachment {
  color: string
  fallback: string
  title: string
  text: string
}

export interface SlackMessage {
  text: string
  username?: string
  iconEmoji?: string
  iconUrl?: string
  channel?: string
  attachments: SlackAttachment[]
}
