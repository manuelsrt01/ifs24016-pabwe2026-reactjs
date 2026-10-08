import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../../test-utils";
import * as userAction from "../states/action";
import UsersPage from "./UsersPage";

const sampleUsers = [
  { id: 1, name: "Budi Santoso", email: "budi@mail.com", photo: "budi.jpg" },
  { id: 2, name: "Citra Dewi", email: "citra@mail.com" },
  { id: 3 },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.spyOn(userAction, "asyncFetchUsers").mockReturnValue(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("memanggil asyncFetchUsers saat halaman dimuat", () => {
    renderWithProviders(<UsersPage />, {
      preloadedState: { users: { users: [], isUsers: false } },
    });
    expect(userAction.asyncFetchUsers).toHaveBeenCalled();
  });

  it("menampilkan status memuat saat isUsers true", () => {
    renderWithProviders(<UsersPage />, {
      preloadedState: { users: { users: [], isUsers: true } },
    });
    expect(screen.getByRole("status")).toHaveTextContent(/memuat data pengguna/i);
  });

  it("menampilkan pesan kosong saat tidak ada pengguna", () => {
    renderWithProviders(<UsersPage />, {
      preloadedState: { users: { users: [], isUsers: false } },
    });
    expect(screen.getByText(/tidak ada pengguna yang cocok/i)).toBeInTheDocument();
  });

  it("menampilkan daftar pengguna beserta foto bila ada", () => {
    renderWithProviders(<UsersPage />, {
      preloadedState: { users: { users: sampleUsers, isUsers: false } },
    });
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.getByText("Citra Dewi")).toBeInTheDocument();
    expect(screen.getByAltText("Budi Santoso")).toHaveAttribute("src", "budi.jpg");
  });

  it("mencari berdasarkan nama atau email memfilter daftar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, {
      preloadedState: { users: { users: sampleUsers, isUsers: false } },
    });

    const input = screen.getByPlaceholderText(/cari nama atau email/i);
    await user.type(input, "citra");

    expect(screen.getByText("Citra Dewi")).toBeInTheDocument();
    expect(screen.queryByText("Budi Santoso")).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "budi@mail");
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.queryByText("Citra Dewi")).not.toBeInTheDocument();
  });

  it("menandai pengguna yang sedang login dengan badge Anda", () => {
    renderWithProviders(<UsersPage />, {
      preloadedState: {
        auth: { user: { id: 2 } },
        users: { users: sampleUsers, isUsers: false },
      },
    });
    expect(screen.getByText("Anda")).toBeInTheDocument();
  });

  it("tidak crash saat data dari store bukan array", () => {
    renderWithProviders(<UsersPage />, {
      preloadedState: { users: { users: { users: [] }, isUsers: false } },
    });
    expect(screen.getByText(/tidak ada pengguna yang cocok/i)).toBeInTheDocument();
  });

  it("memakai email atau indeks sebagai key bila id tidak ada", () => {
    renderWithProviders(<UsersPage />, {
      preloadedState: {
        users: { users: [{ name: "A", email: "a@mail.com" }, { name: "B" }], isUsers: false },
      },
    });
    expect(screen.getByText("A", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("B", { selector: "p" })).toBeInTheDocument();
  });
});
