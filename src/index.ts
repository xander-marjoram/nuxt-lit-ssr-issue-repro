import {
    LitElement, nothing
} from 'lit';
import { html } from 'lit/static-html.js';
import { customElement, property } from 'lit/decorators.js';

type ComponentProps = {
    propObject?: {
        type?: 'submit' | 'reset' | 'button';
    };
};

@customElement('test-component')
export class TestComponent extends LitElement implements ComponentProps {
    @property({ type: Object })
    public propObject: ComponentProps['propObject'];

    override firstUpdated () {
        console.log('Hydration succeeded!'); // You won't see this :(
    }

    public override render () {
        console.log('propObject in render', this.propObject);
        if (!this.propObject) {
            return nothing;
        }

        const { type = 'submit' } = this.propObject;

        return html`
            <button type="${type}">
                Hello World
            </button>
        `;
    }
}
