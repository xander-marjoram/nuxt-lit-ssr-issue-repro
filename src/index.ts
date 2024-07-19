import {
    LitElement, nothing, type TemplateResult, type PropertyValues,
} from 'lit';
import { html } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';

import '@justeattakeaway/pie-button';
import {
    defineCustomElement,
    dispatchCustomEvent,
} from '@justeattakeaway/pie-webc-core';

import {
    type ModalProps,
    ON_MODAL_OPEN_EVENT,
} from './defs';

export class PieModal extends LitElement implements ModalProps {

    @property({ type: Boolean })
    public isOpen = false;

    @property({ type: Object })
    public leadingAction: ModalProps['leadingAction'];

    @query('dialog')
    private _dialog?: HTMLDialogElement;

    constructor () {
        super();
        console.log('isOpen in constructor', this.isOpen);
        console.log('leadingAction in constructor', this.leadingAction);
    }

    override connectedCallback () : void {
        super.connectedCallback();
        document.addEventListener(ON_MODAL_OPEN_EVENT, (event) => this._handleModalOpened(<CustomEvent>event));
    }

    override disconnectedCallback () : void {
        super.disconnectedCallback();
        document.removeEventListener(ON_MODAL_OPEN_EVENT, (event) => this._handleModalOpened(<CustomEvent>event));
    }

    override async firstUpdated (changedProperties: PropertyValues<this>) : Promise<void> {
        console.log('isOpen in firstUpdated', this.isOpen);
        console.log('leadingAction in firstUpdated', this.leadingAction);
        super.firstUpdated(changedProperties);

        this._handleModalOpenStateOnFirstRender(changedProperties);
    }

    private _handleModalOpenStateOnFirstRender (changedProperties: PropertyValues<this>) : void {
        const previousValue = changedProperties.get('isOpen');

        if (previousValue === undefined && this.isOpen) {
            dispatchCustomEvent(this, ON_MODAL_OPEN_EVENT, { targetModal: this });
        }
    }

    private _handleModalOpened (event: CustomEvent): void {
        const { targetModal } = event.detail;

        if (targetModal === this) {
            if (this._dialog?.hasAttribute('open') || !this._dialog?.isConnected) {
                return;
            }

            // The ::backdrop pseudoelement is only shown if the modal is opened via JS
            this._dialog?.showModal();
        }
    }

    private renderLeadingAction () : TemplateResult | typeof nothing {
        if (!this.leadingAction) {
            return nothing;
        }

        const { text, variant = 'primary' } = this.leadingAction;

        if (!text) {
            return nothing;
        }

        return html`
            <pie-button
                variant="${variant}"
                type="submit">
                ${text}
            </pie-button>
        `;
    }

    private renderModalContentAndFooter (): TemplateResult {
        const hasFooterLeadingAction = this.leadingAction?.text;

        return html`
            <article>
                <div>
                    <slot></slot>
                </div>
            </article>
            ${hasFooterLeadingAction ? html`
                <footer>
                    ${this.renderLeadingAction()}
                </footer>` : nothing}`;
    }

    public override render () {
        return html`
        <dialog id="dialog">
            ${this.renderModalContentAndFooter()}
        </dialog>`;
    }
}

defineCustomElement('pie-modal', PieModal);

declare global {
    interface HTMLElementTagNameMap {
        'pie-modal': PieModal;
    }
}
