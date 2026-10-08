// SweetAlert2 dimuat hanya saat dialog pertama kali dibutuhkan,
// sehingga tidak ikut membebani bundel awal halaman.
async function loadSwal() {
  const module = await import("sweetalert2");
  return module.default;
}

export async function showSuccessDialog(message) {
  const Swal = await loadSwal();
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    confirmButtonColor: "#4f46e5",
  });
}

export async function showErrorDialog(message) {
  const Swal = await loadSwal();
  return Swal.fire({
    icon: "error",
    title: "Terjadi Kesalahan",
    text: message,
    confirmButtonColor: "#4f46e5",
  });
}

export async function showConfirmDialog(message) {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    icon: "warning",
    title: "Apakah kamu yakin?",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#e11d48",
  });
  return result.isConfirmed;
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}