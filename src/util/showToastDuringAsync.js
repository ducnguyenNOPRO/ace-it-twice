import { toast } from 'react-toastify';

export default async function showToastDuringAsync(promise,
    { loadingMessage, successMessage, errorMessage, onClose }) {
  const toastId = toast.info(loadingMessage, {
    autoClose: false,
    closeOnClick: false,
    draggable: false,
  });

  try {
    const result = await promise;
    toast.update(toastId, {
      render: successMessage || "Success!",
      type: "success",
      autoClose: 3000,
      closeOnClick: true,
      draggable: true,
    });
    return result;
  } catch (error) {
    toast.update(toastId, {
      render: errorMessage || "Operation failed.",
      type: "error",
      autoClose: 3000,
      closeOnClick: true,
      draggable: true,
    });
    console.error(errorMessage, error);
  } finally {
      if (typeof onClose === "function") {
          onClose();
      }
  }
}
