import {
    LitElement, nothing, type TemplateResult, type PropertyValues,
} from 'lit';
import { html, unsafeStatic } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';

import '@justeattakeaway/pie-button';
import '@justeattakeaway/pie-icon-button';
import {
    requiredProperty,
    RtlMixin,
    validPropertyValues,
    defineCustomElement,
    dispatchCustomEvent,
} from '@justeattakeaway/pie-webc-core';
import '@justeattakeaway/pie-icons-webc/dist/IconClose.js';
import '@justeattakeaway/pie-icons-webc/dist/IconChevronLeft.js';
import '@justeattakeaway/pie-icons-webc/dist/IconChevronRight.js';
import '@justeattakeaway/pie-spinner';

import {
    type ModalProps,
    type ModalActionType,
    headingLevels,
    positions,
    sizes,
    defaultProps,
    ON_MODAL_OPEN_EVENT,
    ON_MODAL_LEADING_ACTION_CLICK,
} from './defs';

// Valid values available to consumers
export * from './defs';

const componentSelector = 'pie-modal';

export interface ModalEventDetail {
    targetModal: PieModal;
}

/**
 * @tagname pie-modal
 * @event {CustomEvent} pie-modal-open - when the modal is opened.
 * @event {CustomEvent} pie-modal-close - when the modal is closed.
 * @event {CustomEvent} pie-modal-back - when the modal back button is clicked.
 * @event {CustomEvent} pie-modal-leading-action-click - when the modal leading action is clicked.
 */
export class PieModal extends RtlMixin(LitElement) implements ModalProps {
    @property({ type: String })
    @requiredProperty(componentSelector)
    public heading!: string;

    @property()
    @validPropertyValues(componentSelector, headingLevels, defaultProps.headingLevel)
    public headingLevel: ModalProps['headingLevel'] = defaultProps.headingLevel;

    @property({ type: Boolean })
    public isFooterPinned = defaultProps.isFooterPinned;

    @property({ type: Boolean, reflect: true })
    public isLoading = defaultProps.isLoading;

    @property({ type: Boolean })
    public isOpen = defaultProps.isOpen;

    @property({ type: Object })
    public leadingAction: ModalProps['leadingAction'];

    @property()
    @validPropertyValues(componentSelector, positions, defaultProps.position)
    public position: ModalProps['position'] = defaultProps.position;

    @property()
    @validPropertyValues(componentSelector, sizes, defaultProps.size)
    public size: ModalProps['size'] = defaultProps.size;

    @query('dialog')
    private _dialog?: HTMLDialogElement;

    private _backButtonClicked = false;

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
        document.removeEventListener(ON_MODAL_OPEN_EVENT, (event) => this._handleModalOpened(<CustomEvent>event));
        super.disconnectedCallback();
    }

    override async firstUpdated (changedProperties: PropertyValues<this>) : Promise<void> {
        console.log('isOpen in firstUpdated', this.isOpen);
        console.log('leadingAction in firstUpdated', this.leadingAction);
        console.log('position in firstUpdated', this.position);
        console.log('size in firstUpdated', this.size);
        super.firstUpdated(changedProperties);

        if (this._dialog) {
            this._dialog.addEventListener('close', () => {
                this.isOpen = false;
            });
        }

        this._handleModalOpenStateOnFirstRender(changedProperties);
    }

    override updated (changedProperties: PropertyValues<this>) : void {
        super.updated(changedProperties);
        this._handleModalOpenStateChanged(changedProperties);
    }

    /**
     * Opens the dialog element and disables page scrolling
     */
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

    // Handles the value of the isOpen property on first render of the component
    private _handleModalOpenStateOnFirstRender (changedProperties: PropertyValues<this>) : void {
        // This ensures if the modal is open on first render, the scroll lock and backdrop are applied
        const previousValue = changedProperties.get('isOpen');

        if (previousValue === undefined && this.isOpen) {
            dispatchCustomEvent(this, ON_MODAL_OPEN_EVENT, { targetModal: this });
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

    private _handleActionClick (actionType: ModalActionType) : void {
        if (actionType === 'leading') {
            this._dialog?.close('leading');
            dispatchCustomEvent(this, ON_MODAL_LEADING_ACTION_CLICK, { targetModal: this });
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

        const { text, variant = 'primary', ariaLabel } = this.leadingAction;

        if (!text) {
            return nothing;
        }

        return html`
            <pie-button
                variant="${variant}"
                type="submit"
                @click="${() => this._handleActionClick('leading')}"
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
                ${this.isLoading ? html`<pie-spinner size="xlarge" variant="secondary"></pie-spinner>` : nothing}
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
            headingLevel = 'h2',
            isFooterPinned,
            leadingAction,
            position,
            size,
        } = this;

        const headingTag = unsafeStatic(headingLevel);

        return html`
        <dialog
            id="dialog"
            class="c-modal"
            size="${size || defaultProps.size}"
            position="${position || defaultProps.position}"
            ?hasActions=${leadingAction}
            data-test-id="pie-modal">
            <header class="c-modal-header"
            data-test-id="modal-header">
                <${headingTag} class="c-modal-heading">
                    ${heading}
                </${headingTag}>
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
