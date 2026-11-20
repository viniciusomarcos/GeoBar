import { type ComponentPropsWithRef, createElement } from 'react'

export type TextTag =
  | 'p'
  | 'span'
  | 'strong'
  | 'small'
  | 'em'
  | 'b'
  | 'i'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'figcaption'
  | 'label'
  | 'legend'
  | 'code'

export type TextProps<Tag extends TextTag = 'p'> = {
  as?: Tag
} & ComponentPropsWithRef<Tag>

export const Text = <Tag extends TextTag = 'p'>({
  as,
  ...props
}: TextProps<Tag>) => createElement(as ?? 'p', props)
