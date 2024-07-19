import { LitElement, html, nothing, type TemplateResult, isServer } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('test-component')
export class TestComponent extends LitElement {
    @property({ type: Boolean })
    testBoolean = false;

    constructor() {
        super();
        console.log('testBoolean in constructor =', this.testBoolean);
    }

    override firstUpdated () {
        console.log('testBoolean in firstUpdated =', this.testBoolean);
    }

    private renderTestElement () : TemplateResult | typeof nothing {
        if (!this.testBoolean) {
            return nothing;
        }
        return html`
            <p>
                Render this element when testBoolean is true
            </p>
        `;
    }

    override render () {
        console.log('render running on', isServer ? 'server' : 'client');
        return html`<dialog
            :open="testBoolean">
            <p>Hello world</p>
            <slot></slot>
            ${this.renderTestElement()}
        </dialog>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'test-component': TestComponent;
    }
}
