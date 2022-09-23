import { Story, Meta } from "@storybook/web-components";
import type { MyButtonProps } from "./Button.js";
import { html } from "lit";
import { expect } from '@storybook/jest';
import { within, userEvent } from '@storybook/testing-library';
import "./Button.js"

export default {
    title: "my-button",
    component: "my-button",
    argTypes: {
        onClick: { action: true },
    },
    render(args){
        return html`<my-button @my-click=${args.onClick} label=${args.label}></my-button>`
    }
} as Meta<MyButtonProps & {onClick: Function}>

export const Default: Story<MyButtonProps & {onClick: Function}> = {
    args: {
        label: "default",
    },
    async play({ canvasElement, args }){
        const canvas = within(canvasElement.querySelector("my-button")?.shadowRoot as unknown as HTMLElement);
        await userEvent.click(canvas.getByRole('button'));
        expect(args.onClick).toHaveBeenCalled()
    }
}