import {
    LitElement, nothing, type TemplateResult, unsafeCSS, type PropertyValues,
} from 'lit';
import { html, unsafeStatic } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

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
    type AriaProps,
    type ActionProps,
    type ModalProps,
    type ModalActionType,
    headingLevels,
    positions,
    sizes,
    defaultProps,
    ON_MODAL_BACK_EVENT,
    ON_MODAL_CLOSE_EVENT,
    ON_MODAL_OPEN_EVENT,
    ON_MODAL_LEADING_ACTION_CLICK,
    ON_MODAL_SUPPORTING_ACTION_CLICK,
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
 * @event {CustomEvent} pie-modal-supporting-action-click - when the modal supporting action is clicked.
 */
export class PieModal extends RtlMixin(LitElement) implements ModalProps {
    @property({ type: Object })
    public aria!: AriaProps;

    @property({ type: String })
    @requiredProperty(componentSelector)
    public heading!: string;

    @property()
    @validPropertyValues(componentSelector, headingLevels, defaultProps.headingLevel)
    public headingLevel: ModalProps['headingLevel'] = defaultProps.headingLevel;

    @property({ type: Boolean })
    public hasBackButton = defaultProps.hasBackButton;

    @property({ type: Boolean })
    public hasStackedActions = defaultProps.hasStackedActions;

    @property({ type: Boolean, reflect: true })
    public isDismissible = defaultProps.isDismissible;

    @property({ type: Boolean })
    public isFooterPinned = defaultProps.isFooterPinned;

    @property({ type: Boolean })
    public isFullWidthBelowMid = defaultProps.isFullWidthBelowMid;

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
    public returnFocusAfterCloseSelector?: string;

    @property()
    @validPropertyValues(componentSelector, sizes, defaultProps.size)
    public size: ModalProps['size'] = defaultProps.size;

    @property({ type: Object })
    public supportingAction!: ActionProps;

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
        this.addEventListener('click', (event) => this._handleDialogLightDismiss(event));
        document.addEventListener(ON_MODAL_OPEN_EVENT, (event) => this._handleModalOpened(<CustomEvent>event));
        document.addEventListener(ON_MODAL_CLOSE_EVENT, (event) => this._handleModalClosed(<CustomEvent>event));
        document.addEventListener(ON_MODAL_BACK_EVENT, (event) => this._handleModalClosed(<CustomEvent>event));
    }

    override disconnectedCallback () : void {
        document.removeEventListener(ON_MODAL_OPEN_EVENT, (event) => this._handleModalOpened(<CustomEvent>event));
        document.removeEventListener(ON_MODAL_CLOSE_EVENT, (event) => this._handleModalClosed(<CustomEvent>event));
        document.removeEventListener(ON_MODAL_BACK_EVENT, (event) => this._handleModalClosed(<CustomEvent>event));
        super.disconnectedCallback();
    }

    override async firstUpdated (changedProperties: PropertyValues<this>) : Promise<void> {
        console.log('isOpen in firstUpdated', this.isOpen);
        console.log('leadingAction in firstUpdated', this.leadingAction);
        console.log('position in firstUpdated', this.position);
        console.log('size in firstUpdated', this.size);
        super.firstUpdated(changedProperties);

        if (this._dialog) {
            const dialogPolyfill = await import('dialog-polyfill').then((module) => module.default);
            dialogPolyfill.registerDialog(this._dialog);
            this._dialog.addEventListener('cancel', (event) => this._handleDialogCancelEvent(event));
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
            const modalScrollContainer = this._dialog?.querySelector('.c-modal-scrollContainer');

            if (modalScrollContainer) {
                // Hack to prevent Safari rendering the modal outside the viewport
                // when the body scroll lock is active
                if ('scrollTo' in window) window.scrollTo(0, 0);

                disableBodyScroll(modalScrollContainer);
            }

            if (this._dialog?.hasAttribute('open') || !this._dialog?.isConnected) {
                return;
            }

            // The ::backdrop pseudoelement is only shown if the modal is opened via JS
            this._dialog?.showModal();
        }
    }

    /**
     * Closes the dialog element and re-enables page scrolling
     */
    private _handleModalClosed (event: CustomEvent): void {
        const { targetModal } = event.detail;

        if (targetModal === this) {
            const modalScrollContainer = this._dialog?.querySelector('.c-modal-scrollContainer');

            if (modalScrollContainer) {
                enableBodyScroll(modalScrollContainer);
            }

            this._dialog?.close();
            this._returnFocus();
        }
    }

    /**
     * Prevents the user from dismissing the dialog via the `cancel`
     * event (ESC key) when `isDismissible` is set to false.
     *
     * @param {Event} event - The event object.
     */
    private _handleDialogCancelEvent = (event: Event) : void => {
        if (!this.isDismissible) {
            event.preventDefault();
        }
    };

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
                    dispatchCustomEvent(this, ON_MODAL_BACK_EVENT, { targetModal: this });
                } else {
                    dispatchCustomEvent(this, ON_MODAL_CLOSE_EVENT, { targetModal: this });
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
        } else if (actionType === 'supporting') {
            this._dialog?.close('supporting');
            dispatchCustomEvent(this, ON_MODAL_SUPPORTING_ACTION_CLICK, { targetModal: this });
        }
    }

    /**
     * Return focus to the specified element, providing the selector is valid
     * and the chosen element can be found.
     */
    private _returnFocus () : void {
        const selector = this.returnFocusAfterCloseSelector?.trim();

        if (selector) {
            (document.querySelector(selector) as HTMLElement)?.focus();
        }
    }

    /**
     * Template for the close button element. Called within the
     * main render function.
     *
     * @private
     */
    private renderCloseButton (): TemplateResult {
        return html`
            <pie-icon-button
                @click="${() => { this.isOpen = false; }}"
                variant="ghost-secondary"
                class="c-modal-closeBtn"
                aria-label="${this.aria?.close || nothing}"
                data-test-id="modal-close-button">
                <icon-close></icon-close>
            </pie-icon-button>`;
    }

    /**
     * Template for the back button element. Called within the
     * main render function.
     *
     * @private
     */
    private renderBackButton () : TemplateResult {
        return html`
            <pie-icon-button
                @click="${() => { this._backButtonClicked = true; this.isOpen = false; }}"
                variant="ghost-secondary"
                class="c-modal-backBtn"
                aria-label="${this.aria?.back || nothing}"
                data-test-id="modal-back-button">
                ${this.isRTL ? html`<icon-chevron-right></icon-chevron-right>` : html`<icon-chevron-left></icon-chevron-left>`}
            </pie-icon-button>
        `;
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
                aria-label="${ariaLabel || nothing}"
                type="submit"
                ?isFullWidth="${this.hasStackedActions}"
                @click="${() => this._handleActionClick('leading')}"
                data-test-id="modal-leading-action">
                ${text}
            </pie-button>
        `;
    }

    /**
     * Render supportingAction button depending on prop availability.
     *
     * 1. If the prop `supportingAction` is not provided, the button is not rendered.
     * 2. If the prop `supportingAction` is provided but any of the optional properties
     * are not provided, they fall back to their default values.
     * 3. If `supportingAction` is provided but not `leadingAction`, log a warning and do
     * not render `supportingAction`.
     *
     * @private
     */
    private renderSupportingAction (): TemplateResult | typeof nothing {
        const { text, variant = 'ghost', ariaLabel } = this.supportingAction;

        if (!text) {
            return nothing;
        }

        if (!this.leadingAction) {
            console.warn('Use `leadingAction` instead of `supportingAction`. `supportingAction` is being ignored.');
            return nothing;
        }

        return html`
            <pie-button
                variant="${variant}"
                aria-label="${ariaLabel || nothing}"
                type="reset"
                ?isFullWidth="${this.hasStackedActions}"
                @click="${() => this._handleActionClick('supporting')}"
                data-test-id="modal-supporting-action">
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
                    ${this.supportingAction?.text ? this.renderSupportingAction() : nothing}
                </footer>` : nothing}`;
    }

    public override render () {
        const {
            aria,
            hasBackButton,
            hasStackedActions,
            heading,
            headingLevel = 'h2',
            isDismissible,
            isFooterPinned,
            isFullWidthBelowMid,
            isLoading,
            leadingAction,
            position,
            size,
            supportingAction,
        } = this;

        const headingTag = unsafeStatic(headingLevel);

        return html`
        <dialog
            id="dialog"
            class="c-modal"
            size="${size || defaultProps.size}"
            position="${position || defaultProps.position}"
            ?hasActions=${leadingAction || supportingAction}
            ?hasBackButton=${hasBackButton}
            ?hasStackedActions=${hasStackedActions}
            ?isDismissible=${isDismissible}
            ?isFooterPinned=${isFooterPinned}
            ?isFullWidthBelowMid=${isFullWidthBelowMid}
            ?isLoading=${isLoading}
            aria-busy="${isLoading ? 'true' : 'false'}"
            aria-label="${(isLoading && aria?.loading) || nothing}"
            data-test-id="pie-modal">
            <header class="c-modal-header"
            data-test-id="modal-header">
                ${hasBackButton ? this.renderBackButton() : nothing}
                <${headingTag} class="c-modal-heading">
                    ${heading}
                </${headingTag}>
                ${isDismissible ? this.renderCloseButton() : nothing}
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

    /**
     * Dismisses the modal on backdrop click if `isDismissible` is `true`.
     * @param {MouseEvent} event - the click event targetting the modal/backdrop
     */
    private _handleDialogLightDismiss = (event: MouseEvent) : void => {
        if (!this.isDismissible) {
            return;
        }

        const rect = this._dialog?.getBoundingClientRect();

        const {
            top = 0, bottom = 0, left = 0, right = 0,
        } = rect || {};

        // This means the dialog is not open due to clicking the close button so
        // we want to escape early
        if (top === 0 && bottom === 0 && left === 0 && right === 0) {
            return;
        }

        const isClickOutsideDialog = event.clientY < top ||
            event.clientY > bottom ||
            event.clientX < left ||
            event.clientX > right;

        if (isClickOutsideDialog) {
            this.isOpen = false;
        }
    };
}

defineCustomElement(componentSelector, PieModal);

declare global {
    interface HTMLElementTagNameMap {
        [componentSelector]: PieModal;
    }
}
