import { type ComponentDefaultProps } from '@justeattakeaway/pie-webc-core';

import { type Variant } from '@justeattakeaway/pie-button/src/defs';

export const sizes = ['small', 'medium', 'large'] as const;
export const positions = ['top', 'center'] as const;

export type ActionProps = {
        /**
         * The text to display inside the button.
         */
        text: string;

        /**
         * The button variant.
         */
        variant?: Variant;
};

export type ModalProps = {

    /**
     * The text to display in the modal's heading.
     */
    heading: string;

    /**
     * When true, the modal will be open.
     */
    isOpen?: boolean;

    /**
     * When false, the modal footer will scroll with the content inside the modal body.
     */
    isFooterPinned?: boolean;

    /**
     * When true, displays a loading spinner in the modal.
     */
    isLoading?: boolean;

    /**
     * The leading action configuration for the modal.
     */
    leadingAction?: ActionProps;

    /*
     * The position of the modal; this controls where it will appear on the page.
     */
    position?: typeof positions[number];

    /**
     * The size of the modal; this controls how wide it will appear on the page.
     */
    size?: typeof sizes[number];
};

/**
 * Event name for when the modal is opened.
 *
 * @constant
 */
export const ON_MODAL_OPEN_EVENT = 'pie-modal-open';

/**
 * Event name for when the modal leading action is clicked.
 *
 * @constant
 */
export const ON_MODAL_LEADING_ACTION_CLICK = 'pie-modal-leading-action-click';

export type ModalActionType = 'leading';

export type DefaultProps = ComponentDefaultProps<ModalProps, keyof Omit<ModalProps, 'heading' | 'leadingAction'>>;

export const defaultProps: DefaultProps = {
    isOpen: false,
    isFooterPinned: true,
    isLoading: false,
    position: 'center',
    size: 'medium',
};
