import type { StoryObj } from '@storybook/web-components';
import type { TestingStory } from './types.js';
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { html } from "lit";

// export const globalRender: StoryObj = (args, { parameters }) => {
//   if (!parameters.component) {
//     throw new Error(`
//       Could not render story due to missing 'component' property in Meta.
//       Please refer to https://github.com/storybookjs/testing-react#csf3
//     `);
//   }

//   const tag = parameters.component;
//   return {
//     render: ()=> html`${unsafeHTML(`<${tag} ${Object.entries(args).map(([key, val])}></${tag}>`)}`
//   }
// };

const invalidStoryTypes = new Set(['string', 'number', 'boolean', 'symbol']);

export const isInvalidStory = (story?: any) => (!story || Array.isArray(story) || invalidStoryTypes.has(typeof story))

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];
export function objectEntries<T extends object>(t: T): Entries<T>[] {
  return Object.entries(t) as any;
}

export const getStoryName = (story: TestingStory) => {
  if(story.storyName) {
    return story.storyName
  }

  if(typeof story !== 'function' && story.name) {
    return story.name
  }

  return undefined
}