import { describe, it } from 'vitest';
import { composeStories } from "../src/index.js";
import { render } from "lit";
import type { IWindow } from 'happy-dom'
import "./Button.js"
declare global {
    interface Window extends IWindow {}
}
import * as stories from './Button.stories.js';
const { Default } = composeStories(stories);
describe("my-button", ()=> {
    it("click", async ()=> {
        const canvasElement = document.createElement("div")
        document.body.appendChild(canvasElement)
        render(Default({}), canvasElement)
        await window.happyDOM.whenAsyncComplete()
        Default.play({ canvasElement })
    })
})