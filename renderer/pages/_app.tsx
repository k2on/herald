import React from "react";
import type { AppProps } from "next/app";

import "../styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCProvider } from "@/providers/TRPCProvider";
import { useIsClient } from "usehooks-ts";

function MyApp({ Component, pageProps }: AppProps) {
    const isClient = useIsClient();
    if (!isClient) return null;

    return (
        <TRPCProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <Component {...pageProps} />
            </ThemeProvider>
        </TRPCProvider>
    );
}

export default MyApp;
