import {
    LitElement, nothing, type TemplateResult, type PropertyValues,
} from 'lit';
import { html } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';

import '@justeattakeaway/pie-button';
import {
    requiredProperty,
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
 * @event {CustomEvent} pie-modal-close - when the modal is closed.
 * @event {CustomEvent} pie-modal-back - when the modal back button is clicked.
 * @event {CustomEvent} pie-modal-leading-action-click - when the modal leading action is clicked.
 */
export class PieModal extends LitElement implements ModalProps {
    @property({ type: String })
    @requiredProperty(componentSelector)
    public heading!: string;

    @property({ type: Boolean })
    public isFooterPinned = true;

    @property({ type: Boolean })
    public isOpen = false;

    @property({ type: Object })
    public leadingAction: ModalProps['leadingAction'];

    @property()
    public position: ModalProps['position'] = 'center';

    @property()
    public size: ModalProps['size'] = 'medium';

    private _backButtonClicked = false;

    @query('dialog')
    private _dialog?: HTMLDialogElement;

    constructor () {
        super();
        console.log('isOpen in constructor', this.isOpen);
        console.log('leadingAction in constructor', this.leadingAction);
        console.log('position in constructor', this.position);
        console.log('size in constructor', this.size);
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
        console.log('position in firstUpdated', this.position);
        console.log('size in firstUpdated', this.size);
        super.firstUpdated(changedProperties);

        this._handleModalOpenStateOnFirstRender(changedProperties);
    }

    override updated (changedProperties: PropertyValues<this>) : void {
        super.updated(changedProperties);
        this._handleModalOpenStateChanged(changedProperties);
    }

    // Handles the value of the isOpen property on first render of the component
    private _handleModalOpenStateOnFirstRender (changedProperties: PropertyValues<this>) : void {
        // This ensures if the modal is open on first render, the scroll lock and backdrop are applied
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

    // Handles changes to the modal isOpen property by dispatching any appropriate events
    private _handleModalOpenStateChanged (changedProperties: PropertyValues<this>) : void {
        const wasPreviouslyOpen = changedProperties.get('isOpen');

        if (wasPreviouslyOpen !== undefined) {
            if (wasPreviouslyOpen) {
                if (this._backButtonClicked) {
                    // Reset the flag
                    this._backButtonClicked = false;
                }
            } else {
                dispatchCustomEvent(this, ON_MODAL_OPEN_EVENT, { targetModal: this });
            }
        }
    }

    /**
     * Render leadingAction button depending on prop availability.
     *
     * 1. If the prop `leadingAction` is not provided, the button is not rendered.
     * 2. If the prop `leadingAction` is provided but any of the optional properties
     * are not provided, they fall back to their default values.
     *
     * @private
     */
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

    /**
     * Renders the modal inner content and footer of the modal.
     * @private
     */
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
            heading,
            isFooterPinned,
            leadingAction,
            position = 'center',
            size = 'medium',
        } = this;

        return html`
        <dialog
            id="dialog"
            class="c-modal"
            size="${size}"
            position="${position}"
            ?hasActions=${leadingAction}
            data-test-id="pie-modal">
            <header class="c-modal-header"
            data-test-id="modal-header">
                <h2 class="c-modal-heading">
                    ${heading}
                </h2>
            </header>
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
