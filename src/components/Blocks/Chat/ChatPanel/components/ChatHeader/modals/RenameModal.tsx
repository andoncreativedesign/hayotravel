import { Input, Modal } from "antd";
import { useState, useEffect } from "react";

interface RenameModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (title: string) => void;
  confirmLoading: boolean;
  initialTitle?: string;
}

export function RenameModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading,
  initialTitle = "New Trip",
}: RenameModalProps) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
    }
  }, [open, initialTitle]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title.trim());
    setTitle("");
  };

  const handleCancel = () => {
    onCancel();
    setTitle("");
  };

  return (
    <Modal
      title="Edit chat name"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okText="Save name"
      cancelText="Cancel">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onPressEnter={handleSubmit}
        placeholder="Enter chat title"
        maxLength={100}
      />
    </Modal>
  );
}
