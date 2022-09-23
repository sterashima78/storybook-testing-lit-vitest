import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("my-button")
export class MyButton extends LitElement {
    @property()
    label = ""

    override render() {
        return html`<button @click=${()=> this.dispatchEvent(new CustomEvent("my-click"))}>${this.label}</button>`
    }
}

export type MyButtonProps = {
    label: string
}