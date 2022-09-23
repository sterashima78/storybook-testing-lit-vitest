import type { BaseAnnotations, BaseStoryFn as OriginalBaseStoryFn } from '@storybook/addons';
import type { Args } from '@storybook/csf';
import type { WebProjectAnnotations } from '@storybook/preview-web';
import type { StoryFn as OriginalStoryFn, StoryObj, Meta } from '@storybook/web-components';
import { TemplateResult, SVGTemplateResult } from 'lit';
import { StoryContext } from '@storybook/csf';
export { StoryContext } from '@storybook/csf';

export type StoryFnHtmlReturnType = string | Node | TemplateResult | SVGTemplateResult;
export type WebComponentsFramework = {
    component: string;
    storyResult: StoryFnHtmlReturnType;
};
export type BaseStoryFn<Args> = OriginalBaseStoryFn<Args, StoryFnHtmlReturnType> & BaseAnnotations<Args, StoryFnHtmlReturnType>;

/**
 * Object representing the preview.ts module
 *
 * Used in storybook testing utilities.
 * @see [Unit testing with Storybook](https://storybook.js.org/docs/react/workflows/unit-testing)
 */
export type GlobalConfig = WebProjectAnnotations<WebComponentsFramework>;

export type TestingStory<T = Args> = StoryFn<T> | StoryObj<T>;

export type StoryFile = { default: Meta<any>, __esModule?: boolean }

export type TestingStoryPlayContext<T = Args> = Partial<StoryContext<WebComponentsFramework, T>> & Pick<StoryContext, 'canvasElement'>

export type TestingStoryPlayFn<TArgs = Args> = (context: TestingStoryPlayContext<TArgs>) => Promise<void> | void;

export type StoryFn<TArgs = Args> = OriginalStoryFn<TArgs> & { play: TestingStoryPlayFn<TArgs> }
