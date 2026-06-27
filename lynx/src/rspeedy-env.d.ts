/// <reference types="@lynx-js/rspeedy/client" />

declare global {
    interface ImportMetaEnv {
        readonly LYNX_API_BASE_URL?: string;
        readonly LYNX_PORT?: string;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

declare module '@lynx-js/types' {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface GlobalProps {
        /**
         * Define your global properties in this interface.
         * These types will be accessible through `lynx.__globalProps`.
         */
    }
}

// This export makes the file a module
export {};
