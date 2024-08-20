import { Button } from "@/components/ui/button";
import { Table, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpcReact } from "@/providers/TRPCProvider";
import { readFileSync } from "fs";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

enum Status {
    NOT_SENT,
    SENDING,
    SENT,
}

export default function TableScreen() {
    const [isSending, setIsSending] = useState(false);
    const [sentMap, setSentMap] = useState(new Map<string, Status>());
    const [message, setMessage] = useState("");
    const router = useRouter();
    const { table } = router.query;

    const { data } = trpcReact.readFile.useQuery({ path: table as string });
    const { mutate } = trpcReact.sentText.useMutation({
        onMutate(variables) {
            // @ts-ignore
            const phone = variables.phone;

            console.log("set", phone, "sending");
            sentMap.set(phone, Status.SENDING);
            setSentMap(sentMap);
        },
        onSuccess(data, variables, context) {
            // @ts-ignore
            const phone = variables.phone;
            console.log("set", phone, "sent");
            sentMap.set(phone, Status.SENT);
            setSentMap(sentMap);
            onSentNext();
        },
    });

    const onSentNext = () => {
        const next = (data?.filter((row) => !sentMap.has(row[2])) || [])[0];
        // console.log("Next", next);
        if (!next) {
            setIsSending(false);
            alert("Done");
            return;
        }

        const formattedMessage = message.replaceAll("$name", next[0]);

        mutate({ phone: next[2], message: formattedMessage });
    };

    const onSend = async () => {
        setIsSending(true);
        onSentNext();
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-row border-b">
                <Link href="home">
                    <ChevronLeftIcon />
                </Link>

                {table}
            </div>

            <div className="grid grid-cols-2 h-full">
                <div className="border-r">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isSending}
                    />
                    <Button onClick={onSend} disabled={isSending}>
                        {isSending ? "Sending" : "Send"}
                    </Button>
                </div>
                <div className="h-full overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHeader>
                        {data?.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{row[0]}</TableCell>
                                <TableCell>{row[1]}</TableCell>
                                <TableCell>
                                    <StatusView
                                        status={
                                            sentMap.get(row[2]) ||
                                            Status.NOT_SENT
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        )) || "Loading"}
                    </Table>
                </div>
            </div>
        </div>
    );
}

function StatusView({ status }: { status: Status }) {
    return (
        <div>
            {status == Status.NOT_SENT ? (
                <span className="text-red-600">Not Sent</span>
            ) : status == Status.SENDING ? (
                <span>Sending...</span>
            ) : (
                <span>Sent</span>
            )}
        </div>
    );
}
