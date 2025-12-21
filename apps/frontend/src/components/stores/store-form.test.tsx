import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StoreForm } from "./store-form";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Mock dependencies
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

vi.mock("@/lib/api", () => ({
    api: {
        stores: {
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock next/image
vi.mock("next/image", () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} width={100} height={100} />
    ),
}));

// Mock FileDropzone since it relies on DOM APIs that might be tricky or uninteresting for this int test
vi.mock("@/components/shared/dropzone", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FileDropzone: ({ handleFileSelect }: any) => (
        <div data-testid="file-dropzone">
            <input
                type="file"
                data-testid="file-input"
                onChange={(e) =>
                    handleFileSelect && handleFileSelect(e.target.files!)
                }
            />
        </div>
    ),
}));

vi.mock("@hugeicons/react", () => ({
    HugeiconsIcon: () => <div data-testid="huge-icon" />,
}));

vi.mock("@/components/ui/input-group", () => ({
    InputGroup: ({ children, ...props }: { children: React.ReactNode }) => (
        <div {...props}>{children}</div>
    ),
    InputGroupInput: (props: { children: React.ReactNode }) => (
        <input {...props} />
    ),
    InputGroupAddon: ({
        children,
        ...props
    }: {
        children: React.ReactNode;
    }) => <div {...props}>{children}</div>,
    InputGroupButton: ({
        children,
        onClick,
        ...props
    }: {
        children: React.ReactNode;
        onClick: () => void;
    }) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

vi.mock("@/components/shared/file-list", () => ({
    FileList: () => <div data-testid="file-list" />,
}));

vi.mock("@/components/ui/button", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Button: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
    ),
}));

vi.mock("@/components/ui/input", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Input: (props: any) => <input {...props} />,
}));

vi.mock("@/components/ui/textarea", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Textarea: (props: any) => <textarea {...props} />,
}));

vi.mock("@/components/ui/switch", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Switch: (props: any) => <input type="checkbox" role="switch" {...props} />,
}));

vi.mock("@/components/ui/checkbox", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Checkbox: (props: any) => <input type="checkbox" {...props} />,
}));

vi.mock("@/components/ui/card", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Card: ({ children }: any) => <div>{children}</div>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CardHeader: ({ children }: any) => <div>{children}</div>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CardTitle: ({ children }: any) => <div>{children}</div>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CardDescription: ({ children }: any) => <div>{children}</div>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

describe("StoreForm", () => {
    const mockRouter = {
        push: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
            mockRouter
        );
    });

    it("renders create form correctly", () => {
        render(<StoreForm />);

        expect(screen.getByText("Store Details")).toBeInTheDocument();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Create Store/i })
        ).toBeInTheDocument();
        expect(screen.queryByText("Current Logo")).not.toBeInTheDocument();
    });

    it("renders edit form correctly with initial data", () => {
        const initialData = {
            id: "123",
            name: "Test Store",
            slug: "test-store",
            description: "Test Description",
            phone: "012345678",
            email: "test@example.com",
            address: "123 Test St",
            city: "Test City",
            state: "Test State",
            country: "Cambodia",
            postalCode: "12345",
            latitude: 11.5,
            longitude: 104.9,
            isActive: true,
            imageUrl: "http://example.com/logo.png",
            features: {
                parking: true,
                wifi: false,
                outdoorSeating: true,
                driveThrough: false,
            },
            openingHours: {},
            createdAt: "2023-01-01",
            updatedAt: "2023-01-01",
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<StoreForm initialData={initialData as any} />);

        expect(screen.getByDisplayValue("Test Store")).toBeInTheDocument();
        expect(screen.getByDisplayValue("test-store")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Update Store/i })
        ).toBeInTheDocument();
        expect(screen.getByText("Current Logo")).toBeInTheDocument();
    });

    it("validates required fields", async () => {
        render(<StoreForm />);

        const submitButton = screen.getByRole("button", {
            name: /Create Store/i,
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getAllByText("Store name is required").length
            ).toBeGreaterThan(0);
            expect(
                screen.getAllByText("Slug is required").length
            ).toBeGreaterThan(0);
        });
    });

    it("generates slug from name", async () => {
        render(<StoreForm />);

        const nameInput = screen.getByLabelText(/Name/i);
        fireEvent.change(nameInput, { target: { value: "New Coffee Shop" } });

        const generateSlugButton = screen.getByTitle("Generate");
        fireEvent.click(generateSlugButton);

        await waitFor(() => {
            expect(
                screen.getByDisplayValue("new-coffee-shop")
            ).toBeInTheDocument();
        });
    });

    it("calls api.stores.create on successful submission", async () => {
        (
            api.stores.create as unknown as ReturnType<typeof vi.fn>
        ).mockResolvedValue({});

        render(<StoreForm />);

        fireEvent.change(screen.getByLabelText(/Name/i), {
            target: { value: "My Store" },
        });
        fireEvent.change(screen.getByTestId("slug-input"), {
            target: { value: "my-store" },
        });
        fireEvent.change(screen.getByLabelText(/Phone/i), {
            target: { value: "012345678" },
        });
        fireEvent.change(screen.getByLabelText(/Address/i), {
            target: { value: "123 St" },
        });
        fireEvent.change(screen.getByLabelText(/City/i), {
            target: { value: "PP" },
        });
        fireEvent.change(screen.getByLabelText(/State/i), {
            target: { value: "PP" },
        });
        fireEvent.change(screen.getByLabelText(/Country/i), {
            target: { value: "Cambodia" },
        });
        fireEvent.change(screen.getByLabelText(/Latitude/i), {
            target: { value: "11.0" },
        });
        fireEvent.change(screen.getByLabelText(/Longitude/i), {
            target: { value: "104.0" },
        });

        const submitButton = screen.getByRole("button", {
            name: /Create Store/i,
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.stores.create).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith(
                "Store created successfully"
            );
            expect(mockRouter.push).toHaveBeenCalledWith("/stores");
        });
    });

    it("calls api.stores.update on successful update submission", async () => {
        (
            api.stores.update as unknown as ReturnType<typeof vi.fn>
        ).mockResolvedValue({});

        const initialData = {
            id: "123",
            name: "Existing Store",
            slug: "existing-store",
            phone: "012345678",
            address: "Old Addr",
            city: "Old City",
            state: "Old State",
            country: "Cambodia",
            latitude: 10,
            longitude: 100,
            isActive: true,
            features: {},
            imageUrl: "http://example.com/logo.png", // Added imageUrl
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<StoreForm initialData={initialData as any} />);

        // Change name
        fireEvent.change(screen.getByLabelText(/Name/i), {
            target: { value: "Updated Store" },
        });

        const submitButton = screen.getByRole("button", {
            name: /Update Store/i,
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.stores.update).toHaveBeenCalledWith(
                "123",
                expect.any(FormData)
            );
            expect(toast.success).toHaveBeenCalledWith(
                "Store updated successfully"
            );
        });
    });
});
