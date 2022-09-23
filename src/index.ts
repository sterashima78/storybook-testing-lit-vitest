import { defaultDecorateStory, combineParameters } from '@storybook/client-api';
import addons, { applyHooks, HooksContext, mockChannel } from '@storybook/addons';
import type { Meta } from '@storybook/web-components';
import { isExportStory } from '@storybook/csf'
import { fn } from "jest-mock";
import type { GlobalConfig, StoryFile, TestingStory, TestingStoryPlayContext, WebComponentsFramework, StoryContext } from './types.js';
import { getStoryName, isInvalidStory, objectEntries } from './utils.js';

// Some addons use the channel api to communicate between manager/preview, and this is a client only feature, therefore we must mock it.
addons.setChannel(mockChannel());

let globalStorybookConfig = {};

const decorateStory = applyHooks(defaultDecorateStory);

const isValidStoryExport = (storyName: string, nonStoryExportsConfig = {}) =>
  isExportStory(storyName, nonStoryExportsConfig) && storyName !== '__namedExportsOrder'

export function setGlobalConfig(config: GlobalConfig) {
  globalStorybookConfig = config;
}

export function composeStory<GenericArgs>(
  story: TestingStory<GenericArgs>,
  meta: Meta<GenericArgs | any>,
  globalConfig: GlobalConfig = globalStorybookConfig
) {

  if (isInvalidStory(story)) {
    throw new Error(
      `Cannot compose story due to invalid format. expected a function/object but received ${typeof story} instead.`
    );
  }

  if (story.story !== undefined) {
    throw new Error(
      `StoryFn.story object-style annotation is not supported. expects hoisted CSF stories.
       https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#hoisted-csf-annotations`
    );
  }

  const renderFn = typeof story === 'function' ? story : story.render ?? meta.render;
  const finalStoryFn = (context: StoryContext<WebComponentsFramework, GenericArgs>) => {
    if(!renderFn) {
      throw new Error("render is not found.")
    }
    return renderFn(context.args, context);
  };

  const combinedDecorators = [
    ...(story.decorators || []),
    ...(meta?.decorators || []),
    ...(globalConfig.decorators || []),
  ];


  const decorated = decorateStory<WebComponentsFramework>(
    // @ts-expect-error
    finalStoryFn,
    combinedDecorators
  );

  const defaultGlobals = Object.entries(
    (globalConfig.globalTypes || {}) as Record<string, { defaultValue: any }>
  ).reduce((acc, [arg, { defaultValue }]) => {
    if (defaultValue) {
      acc[arg] = defaultValue;
    }
    return acc;
  }, {} as Record<string, { defaultValue: any }>);

  const combinedParameters = combineParameters(
    globalConfig.parameters || {},
    meta?.parameters || {},
    story.parameters || {},
    { component: meta?.component }
  )

  const combinedArgType = globalConfig.argTypes || meta.argTypes || {}

  const combinedArgs = {
    ...meta?.args,
    ...story.args,
    ...Object.fromEntries(Object.entries(combinedArgType)
        .map(([key, val])=> [key, val && val.action && fn()])
        .filter(([_, val]) => !!val)
        ),
  } as GenericArgs

  const context = {
    componentId: '',
    kind: '',
    title: '',
    id: '',
    name: '',
    story: '',
    argTypes: combinedArgType,
    globals: defaultGlobals,
    parameters: combinedParameters,
    initialArgs: combinedArgs,
    args: combinedArgs,
    viewMode: 'story',
    originalStoryFn: renderFn,
    hooks: new HooksContext(),
  } as StoryContext<WebComponentsFramework, GenericArgs>;

  const composedStory = (extraArgs: Partial<GenericArgs> = {}) => {
    // @ts-expect-error
    return decorated({
      ...context,
      args: {
        ...combinedArgs,
        ...extraArgs
      }
    })
  }

  const boundPlay = ({ ...extraContext }: TestingStoryPlayContext<GenericArgs>) => {
    // @ts-expect-error
    return story.play?.({ ...context, ...extraContext });
  }

  composedStory.storyName = story.storyName || story.name
  composedStory.args = combinedArgs
  composedStory.play = boundPlay;
  composedStory.decorators = combinedDecorators
  composedStory.parameters = combinedParameters

  return composedStory
}

/**
 * @param storiesImport - e.g. (import * as stories from './Button.stories')
 * @param [globalConfig] - e.g. (import * as globalConfig from '../.storybook/preview') this can be applied automatically if you use `setGlobalConfig` in your setup files.
 */

type ComposedStories<TModule extends StoryFile> = Record<Exclude<keyof TModule, "default" | "__esModule">, ReturnType<typeof composeStory>>
export function composeStories<
  TModule extends StoryFile
>(storiesImport: TModule, globalConfig?: GlobalConfig) {
  const { default: meta, __esModule, ...stories } = storiesImport;

  return objectEntries(stories).reduce<ComposedStories<TModule>>(
    (storiesMap, [key, _story]) => {
      const storyName = String(key)
      // filter out non-story exports
      if (!isValidStoryExport(storyName, meta)) {
        return storiesMap;
      }

      const story = _story as TestingStory
      story.storyName = getStoryName(story) || storyName
      const result = Object.assign(storiesMap, {
        [key]: composeStory(story, meta, globalConfig)
      });
      return result;
    },
    {} as ComposedStories<TModule>
  );
}