import React from "react";
import Head from "next/head";
import { Input } from "@/components/ui/input";
import { trpcReact } from "@/providers/TRPCProvider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import router from "next/router";

export default function HomePage() {
    const { data } = trpcReact.ping.useQuery();

    return (
        <React.Fragment>
            <Head>
                <title>Herald</title>
            </Head>
            <div className="relative flex min-h-screen flex-col bg-background">
                <div className="min-h-screen flex items-center justify-center">
                    <div>
                        <Input
                            onChange={(e) => {
                                const path = e.target.files[0].name;
                                if (!path) return;
                                router.push(path);
                            }}
                            type="file"
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
