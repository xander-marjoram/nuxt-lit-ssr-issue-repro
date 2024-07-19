import { type Variant } from '@justeattakeaway/pie-button/src/defs';

type ActionProps = {
    text: string;
    variant?: Variant;
};

export type ModalProps = {
    isOpen?: boolean;
    isFooterPinned?: boolean;
    leadingAction?: ActionProps;
};

export const ON_MODAL_OPEN_EVENT = 'pie-modal-open';
