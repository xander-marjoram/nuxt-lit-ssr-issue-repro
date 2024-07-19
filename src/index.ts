import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('test-component')
export class TestComponent extends LitElement {
    @property({ type: Boolean })
    testBoolean = false;

    public override render () {
        return html`<p>Hello world</p>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'test-component': TestComponent;
    }
}
