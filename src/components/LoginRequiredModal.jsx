import ConfirmDialog from "./ConfirmDialog";

export default function LoginRequiredModal({ isOpen, onClose, onLogin }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      variant="loginRequired"
      cancelTone="main"
      onCancel={onLogin}
      onConfirm={onClose}
      onDismiss={onClose}
    />
  );
}
