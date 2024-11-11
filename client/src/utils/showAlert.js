import Swal from "sweetalert2";
import "./SweetAlert2Custom.css";
const showAlert = (title, text, icon = "info") => {
  return Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonText: "확인",
    confirmButtonColor: "#3085d6",
    customClass: {
      popup: "custom-alert",
      title: "custom-alert-title",
      content: "custom-alert-content",
      confirmButton: "custom-alert-button",
    },
  });
};

export default showAlert;
