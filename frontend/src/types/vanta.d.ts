declare global {
    interface Window {
        VANTA: VantaAPI;
    }
}

interface VantaEffect {
    destroy(): void;
}

interface VantaOptions {
    el?: HTMLElement | string;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    color1?: number;
    color2?: number;
    size?: number;
    backgroundColor?: number
}

interface VantaAPI {
    GLOBE: (options: VantaOptions) => VantaEffect;
    current?: VantaEffect;
}

declare var VANTA: VantaAPI;