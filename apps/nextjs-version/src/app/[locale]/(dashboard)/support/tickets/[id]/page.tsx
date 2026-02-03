/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useTicket,
  useTicketMessages,
  useUpdateTicketStatus,
  useAddMessage,
} from "@/hooks/use-support";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { TicketStatus } from "@/types/support";

export default function TicketDetailsPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const { data: ticketData, isLoading: ticketLoading } = useTicket(ticketId);
  const { data: messagesData, isLoading: messagesLoading } =
    useTicketMessages(ticketId);
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateTicketStatus();
  const { mutate: addMessage, isPending: isSendingMessage } = useAddMessage();
  const [newMessage, setNewMessage] = useState("");

  const ticket = ticketData?.data;
  const messages = messagesData?.data || [];

  const handleStatusChange = (value: TicketStatus) => {
    updateStatus({ id: ticketId, status: value });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    addMessage(
      { ticketId, message: newMessage },
      {
        onSuccess: () => {
          setNewMessage("");
        },
      }
    );
  };

  if (ticketLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return <div className="p-8">Ticket not found</div>;
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-4 max-w-5xl mx-auto w-full">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">
              {ticket.subject}
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>Ticket #{ticket.ticketNumber}</span>
              <span>•</span>
              <span className="capitalize">{ticket.category}</span>
              <span>•</span>
              <span>{format(new Date(ticket.createdAt), "PPP")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={ticket.status}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Main Chat Area */}
          <div className="md:col-span-2 space-y-4">
            {/* Original Description */}
            <Card>
              <CardHeader className="py-3 bg-muted/30">
                <CardTitle className="text-base font-medium">
                  Issue Description
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="whitespace-pre-wrap text-sm">{ticket.message}</p>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-150">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-base">Discussion</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  {messagesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                      No messages yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        // Rudimentary check for 'me' vs 'them'.
                        // Ideally, check msg.senderId._id === currentAdminId
                        // But here we might not have current user ID easily.
                        // Assuming if sender role is 'admin', it's right-aligned (or distinct style).
                        const sender =
                          typeof msg.senderId === "object"
                            ? msg.senderId
                            : {
                                _id: msg.senderId,
                                fullName: "Unknown User",
                                role: "user",
                              };
                        const isAdmin = sender.role === "admin";

                        return (
                          <div
                            key={msg._id}
                            className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {sender.fullName
                                  ?.substring(0, 2)
                                  .toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`flex flex-col max-w-4/5 ${isAdmin ? "items-end" : ""}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">
                                  {sender.fullName}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {format(new Date(msg.createdAt), "p")}
                                </span>
                              </div>
                              <div
                                className={`rounded-lg px-3 py-2 text-sm ${isAdmin ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-3 border-t">
                <div className="flex gap-2 w-full">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="min-h-10 resize-none"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isSendingMessage || !newMessage.trim()}
                  >
                    {isSendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">
                  Ticket Details
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <Badge
                    variant={
                      ticket.priority === "high" ? "destructive" : "outline"
                    }
                  >
                    {ticket.priority}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline">{ticket.status}</Badge>
                </div>
                <Separator />
                <div>
                  <span className="text-muted-foreground block mb-1">
                    User Info
                  </span>
                  <div className="font-medium">
                    {(ticket.userId as any).fullName}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {(ticket.userId as any).email}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
