import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  HelpCircle,
  MessageCircle,
  MessageSquare,
  Plus,
  Send,
  X,
  XCircle,
} from "lucide-react-native";
import * as React from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AccountActionHeader } from "@/components/account/account-action-header";
import { AccountDetailScreen } from "@/components/account/account-detail-screen";
import {
  getStatusColor,
  getStatusLabel,
} from "@/components/account/support-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddTicketMessage,
  useCreateTicket,
  useFAQs,
  useTicket,
  useTicketMessages,
  useTickets,
} from "@/hooks/use-support";
import { cn } from "@/lib/utils";
import type {
  FAQ,
  SupportTicket,
  TicketMessage,
  TicketPriority,
} from "@/services/support.service";

export default function CustomerServiceScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = React.useState("faq");
  const newTicketSheetRef = React.useRef<BottomSheetModal>(null);
  const ticketDetailSheetRef = React.useRef<BottomSheetModal>(null);
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(
    null,
  );

  const handleOpenNewTicket = React.useCallback(() => {
    newTicketSheetRef.current?.present();
  }, []);

  const handleOpenTicket = React.useCallback((ticketId: string) => {
    setSelectedTicketId(ticketId);
    ticketDetailSheetRef.current?.present();
  }, []);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.3}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <AccountDetailScreen
      header={<AccountActionHeader title="Customer Service" />}
    >
      <View className="flex-1">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 gap-6"
        >
          <TabsList className="h-12 w-full flex-row rounded-full bg-muted/50 p-1">
            <TabsTrigger
              value="faq"
              className="flex-1 rounded-full border-0 py-2 shadow-none"
            >
              <Text className="font-semibold">Help Center</Text>
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="flex-1 rounded-full border-0 py-2 shadow-none"
            >
              <Text className="font-semibold">My Tickets</Text>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="flex-1">
            <FaqSection />
          </TabsContent>

          <TabsContent value="tickets" className="flex-1">
            <TicketSection
              onOpenTicket={handleOpenTicket}
              onNewTicket={handleOpenNewTicket}
            />
          </TabsContent>
        </Tabs>
      </View>

      <NewTicketSheet
        ref={newTicketSheetRef}
        renderBackdrop={renderBackdrop}
        insets={insets}
      />

      <TicketDetailSheet
        ref={ticketDetailSheetRef}
        ticketId={selectedTicketId}
        onDismiss={() => setSelectedTicketId(null)}
        renderBackdrop={renderBackdrop}
        insets={insets}
      />
    </AccountDetailScreen>
  );
}

// --- SUB-COMPONENTS ---

function FaqSection() {
  const { data: faqs, isLoading, isError, error, refetch } = useFAQs();

  if (isLoading) {
    return (
      <View className="py-20">
        <ActivityIndicator color="#6A4A36" />
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Unable to load FAQs"
        description={error?.message}
        variant="error"
        centered
        actionLabel="Try again"
        onAction={() => refetch()}
      />
    );
  }

  if (!faqs || faqs.length === 0) {
    return (
      <EmptyState
        title="No FAQs found"
        description="We'll add some helpful guides soon."
        centered
        icon={HelpCircle}
      />
    );
  }

  // Group by category
  const categories = [...new Set(faqs.map((faq) => faq.category))];

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="gap-6 pb-10">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">
            How can we help?
          </Text>
          <Text className="text-sm leading-6 text-muted-foreground">
            Search our frequently asked questions or browse by category.
          </Text>
        </View>

        {categories.map((category) => (
          <View key={category} className="gap-3">
            <Text className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">
              {category}
            </Text>
            <View className="gap-3">
              {faqs
                .filter((f) => f.category === category)
                .map((faq) => (
                  <FaqItem key={faq.id} faq={faq} />
                ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function FaqItem({ faq }: { faq: FAQ }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="overflow-hidden rounded-[24px] border border-border bg-card py-0">
      <Collapsible onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Pressable className="flex-row items-center justify-between px-5 py-5 active:opacity-70">
            <Text className="flex-1 text-base font-semibold text-foreground">
              {faq.question}
            </Text>
            <View
              className={cn(
                "rounded-full bg-muted p-1 transition-transform",
                isOpen && "rotate-180",
              )}
            >
              <Icon as={ChevronDown} size={18} className="text-foreground" />
            </View>
          </Pressable>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <View className="px-5 pb-5 pt-1 border-t border-border/50">
            <Text className="text-sm leading-7 text-muted-foreground">
              {faq.answer}
            </Text>
          </View>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function TicketSection({
  onOpenTicket,
  onNewTicket,
}: {
  onOpenTicket: (id: string) => void;
  onNewTicket: () => void;
}) {
  const { data, isLoading, isError, error, refetch } = useTickets();
  const tickets = data?.tickets ?? [];

  if (isLoading) {
    return (
      <View className="py-20">
        <ActivityIndicator color="#6A4A36" />
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Unable to load tickets"
        description={error?.message}
        variant="error"
        centered
        actionLabel="Try again"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between pb-4 px-1">
        <Text className="text-lg font-bold text-foreground">Support Requests</Text>
        <Pressable
          onPress={onNewTicket}
          className="flex-row items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 active:opacity-70"
        >
          <Icon as={Plus} size={16} className="text-primary" />
          <Text className="text-sm font-semibold text-primary">New Ticket</Text>
        </Pressable>
      </View>

      {tickets.length === 0 ? (
        <EmptyState
          title="No active tickets"
          description="Create a new ticket if you need help with an order or have a general inquiry."
          centered
          icon={MessageSquare}
          actionLabel="Contact Support"
          onAction={onNewTicket}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="gap-3 pb-10">
            {tickets.map((ticket) => (
              <TicketItem
                key={ticket.id}
                ticket={ticket}
                onPress={() => onOpenTicket(ticket.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function TicketItem({
  ticket,
  onPress,
}: {
  ticket: SupportTicket;
  onPress: () => void;
}) {
  const statusColor = getStatusColor(ticket.status);

  return (
    <Pressable onPress={onPress} className="active:opacity-90">
      <Card className="rounded-[24px] border border-border bg-card py-0">
        <CardContent className="gap-4 px-5 py-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 gap-1">
              <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                {ticket.subject}
              </Text>
              <Text className="text-xs text-muted-foreground uppercase tracking-wider">
                Ref: #{ticket.id.slice(-6).toUpperCase()} • {ticket.category}
              </Text>
            </View>
            <Badge className={cn("rounded-full border px-2.5 py-1", statusColor)}>
              <Text className="text-[11px] font-bold uppercase">
                {getStatusLabel(ticket.status)}
              </Text>
            </Badge>
          </View>

          <View className="flex-row items-center justify-between border-t border-border/50 pt-3">
            <View className="flex-row items-center gap-2">
              <Icon as={Clock} size={14} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">
                Updated {format(new Date(ticket.updatedAt), "MMM d, h:mm a")}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-xs font-semibold text-primary">View</Text>
              <Icon as={ChevronRight} size={14} className="text-primary" />
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

// --- SHEET COMPONENTS ---

const NewTicketSheet = React.forwardRef<
  BottomSheetModal,
  { renderBackdrop: any; insets: any }
>(({ renderBackdrop, insets }, ref) => {
  const createMutation = useCreateTicket();
  const [subject, setSubject] = React.useState("");
  const [category, setCategory] = React.useState("General");
  const [priority, setPriority] = React.useState<TicketPriority>("medium");
  const [message, setMessage] = React.useState("");

  const handleSubmit = async () => {
    if (!subject || !message) return;

    try {
      await createMutation.mutateAsync({
        subject,
        category,
        priority,
        message,
      });
      setSubject("");
      setMessage("");
      (ref as any).current?.dismiss();
    } catch (error) {
      console.error("Failed to create ticket", error);
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={["85%"]}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: "#D1C4B8", width: 44 }}
      backgroundStyle={{ backgroundColor: "#F8F5F2" }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView className="flex-1 px-5 pt-2">
        <View className="flex-row items-center justify-between pb-4">
          <Text className="text-xl font-bold text-foreground">New Request</Text>
          <Pressable
            onPress={() => (ref as any).current?.dismiss()}
            className="rounded-full bg-muted/50 p-1.5"
          >
            <Icon as={X} size={20} className="text-foreground" />
          </Pressable>
        </View>

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="gap-6">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground ml-1">
                Subject
              </Text>
              <BottomSheetTextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Brief summary of your issue"
                className="h-14 rounded-2xl border border-border bg-white px-4 text-base"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-foreground ml-1">
                  Category
                </Text>
                <Select
                  value={{ label: category, value: category }}
                  onValueChange={(v) => v && setCategory(v.value)}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-border bg-white px-4">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Order" label="Order Issue" />
                      <SelectItem value="Payment" label="Payment" />
                      <SelectItem value="App" label="App Technical" />
                      <SelectItem value="General" label="General" />
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </View>

              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-foreground ml-1">
                  Priority
                </Text>
                <Select
                  value={{
                    label: priority.charAt(0).toUpperCase() + priority.slice(1),
                    value: priority,
                  }}
                  onValueChange={(v) => v && setPriority(v.value as any)}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-border bg-white px-4">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="low" label="Low" />
                      <SelectItem value="medium" label="Medium" />
                      <SelectItem value="high" label="High" />
                      <SelectItem value="urgent" label="Urgent" />
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground ml-1">
                Message
              </Text>
              <BottomSheetTextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue in detail..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className="min-h-[160px] rounded-2xl border border-border bg-white p-4 text-base"
              />
            </View>

            <Button
              className="h-14 rounded-2xl shadow-none mt-4"
              onPress={handleSubmit}
              disabled={createMutation.isPending || !subject || !message}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-bold">Submit Request</Text>
              )}
            </Button>
          </View>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const TicketDetailSheet = React.forwardRef<
  BottomSheetModal,
  { ticketId: string | null; onDismiss: () => void; renderBackdrop: any; insets: any }
>(({ ticketId, onDismiss, renderBackdrop, insets }, ref) => {
  const { data: ticket, isLoading: isTicketLoading } = useTicket(ticketId!);
  const { data: messages, isLoading: isMessagesLoading } = useTicketMessages(
    ticketId!,
  );
  const addMessageMutation = useAddTicketMessage(ticketId!);
  const [reply, setReply] = React.useState("");
  const flatListRef = React.useRef<FlatList>(null);

  const handleReply = async () => {
    if (!reply.trim()) return;

    try {
      await addMessageMutation.mutateAsync({ message: reply });
      setReply("");
    } catch (error) {
      console.error("Failed to add message", error);
    }
  };

  const renderMessage = ({ item }: { item: TicketMessage }) => {
    const senderRole =
      typeof item.senderId === "object" ? item.senderId.role : "user";
    const isUser = senderRole !== "admin";
    return (
      <View
        className={cn(
          "mb-4 max-w-[85%] rounded-2xl px-4 py-3",
          isUser
            ? "self-end bg-primary rounded-tr-none"
            : "self-start bg-white border border-border rounded-tl-none",
        )}
      >
        {!isUser && (
          <Text className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">
            Support Agent
          </Text>
        )}
        <Text
          className={cn(
            "text-base leading-6",
            isUser ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {item.message}
        </Text>
        <Text
          className={cn(
            "mt-1 self-end text-[10px]",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {format(new Date(item.createdAt), "h:mm a")}
        </Text>
      </View>
    );
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={["92%"]}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      onDismiss={onDismiss}
      handleIndicatorStyle={{ backgroundColor: "#D1C4B8", width: 44 }}
      backgroundStyle={{ backgroundColor: "#F8F5F2" }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView className="flex-1">
        {/* Header */}
        <View className="border-b border-border/50 px-5 pb-4 pt-2">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-4">
              {isTicketLoading ? (
                <View className="h-6 w-32 bg-muted rounded animate-pulse" />
              ) : (
                <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
                  {ticket?.subject}
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => (ref as any).current?.dismiss()}
              className="rounded-full bg-muted/50 p-1.5"
            >
              <Icon as={X} size={18} className="text-foreground" />
            </Pressable>
          </View>
          {ticket && (
            <View className="flex-row items-center gap-3">
              <Badge
                className={cn(
                  "rounded-full border px-2 py-0.5",
                  getStatusColor(ticket.status),
                )}
              >
                <Text className="text-[10px] font-bold uppercase">
                  {getStatusLabel(ticket.status)}
                </Text>
              </Badge>
              <Text className="text-xs text-muted-foreground">
                Ticket #{ticket.id.slice(-6).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Chat List */}
        <View className="flex-1 bg-muted/10">
          {isMessagesLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#6A4A36" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />
          )}
        </View>

        {/* Input Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <View
            className="border-t border-border/50 bg-white px-4 py-4 flex-row items-end gap-3"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <View className="flex-1 rounded-2xl border border-border bg-muted/30 px-4 py-2 min-h-[50px] justify-center">
              <BottomSheetTextInput
                value={reply}
                onChangeText={setReply}
                placeholder="Type your message..."
                multiline
                className="text-base text-foreground"
                style={{ maxHeight: 120 }}
              />
            </View>
            <Pressable
              onPress={handleReply}
              disabled={!reply.trim() || addMessageMutation.isPending}
              className={cn(
                "h-[50px] w-[50px] items-center justify-center rounded-2xl bg-primary",
                (!reply.trim() || addMessageMutation.isPending) && "opacity-50",
              )}
            >
              {addMessageMutation.isPending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Icon as={Send} size={20} className="text-white" />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
