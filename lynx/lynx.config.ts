import { defineConfig } from '@lynx-js/rspeedy';

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';

declare const process: {
    env: Record<string, string | undefined>;
};

const defaultPort = 3000;

function getDevServerPort(): number {
    const port = Number(process.env.LYNX_PORT || defaultPort);

    return Number.isInteger(port) && port > 0 ? port : defaultPort;
}

export default defineConfig({
    server: {
        port: getDevServerPort(),
    },
    plugins: [
        pluginQRCode({
            schema(url) {
                // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
                return `${url}?fullscreen=true`;
            },
        }),
        pluginReactLynx(),
        pluginTypeCheck(),
    ],
});
