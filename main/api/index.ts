import { ResponseTables } from "@/types/db";
import { t } from "./trpc";
import * as z from "zod";
import { readFileSync } from "fs";
import { parse } from "csv-parse";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const router = t.router({
    ping: t.procedure.query(() => {
        console.log("hi");
        return "pong";
    }),
    readFile: t.procedure
        .input(z.object({ path: z.string() }))

        .query(async ({ input }) => {
            const content = readFileSync(input.path, "utf-8");
            const rows = await parse(content, { bom: true }).toArray();
            rows.splice(0, 1);
            return rows;
        }),

    sentText: t.procedure
        .input(z.object({ phone: z.string(), message: z.string() }))
        .mutation(async ({ input }) => {
            const phone = input.phone;
            const message = input.message;
            const appleScript = `
                
            tell application "Messages"
                set targetService to 1st service whose service type = iMessage
                set targetBuddy to buddy "${phone}" of targetService

                if (exists targetBuddy) then
                    send "${message}" to targetBuddy
                else
                    set targetService to 1st service whose service type = SMS
                    set targetBuddy to buddy "+1234567890" of targetService
                    send "${message}" to targetBuddy
                end if
            end tell

            `;

            try {
                const { stdout, stderr } = await execAsync(
                    `osascript -e '${appleScript}'`
                );

                if (stderr) {
                    console.error(`Stderr: ${stderr}`);
                    return false;
                }
                return true;
            } catch (error) {
                console.error(`Error: ${error.message}`);

                return false;
            }
        }),
});

function sleep(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export type AppRouter = typeof router;
