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

const componentSelector = 'pie-modal';

/**
 * @tagname pie-modal
 * @event {CustomEvent} pie-modal-open - when the modal is opened.
 */
export class PieModal extends LitElement implements ModalProps {
    @property({ type: Boolean })
    public isFooterPinned = true;

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
                type="submit"
                data-test-id="modal-leading-action">
                ${text}
            </pie-button>
        `;
    }

    private renderModalContentAndFooter (): TemplateResult {
        const hasFooterLeadingAction = this.leadingAction?.text;

        return html`
            <article class="c-modal-scrollContainer c-modal-content c-modal-content--scrollable ${hasFooterLeadingAction ? 'c-modal-hasFooterActions' : ''}">
                <div class="c-modal-contentInner"
                     data-test-id="modal-content-inner">
                    <slot></slot>
                </div>
            </article>
            ${hasFooterLeadingAction ? html`
                <footer class="c-modal-footer"
                        data-test-id="pie-modal-footer">
                    ${this.renderLeadingAction()}
                </footer>` : nothing}`;
    }

    public override render () {
        const {
            isFooterPinned,
            leadingAction,
        } = this;

        return html`
        <dialog
            id="dialog"
            class="c-modal"
            ?hasActions=${leadingAction}
            data-test-id="pie-modal">
            ${
            // We need to wrap the remaining content in a shared scrollable container if the footer is not pinned
            isFooterPinned
                ? this.renderModalContentAndFooter()
                : html`
                        <div class="c-modal-scrollContainer">
                            ${this.renderModalContentAndFooter()}
                        </div>
                        `
            }
        </dialog>`;
    }
}

defineCustomElement(componentSelector, PieModal);

declare global {
    interface HTMLElementTagNameMap {
        [componentSelector]: PieModal;
    }
}
