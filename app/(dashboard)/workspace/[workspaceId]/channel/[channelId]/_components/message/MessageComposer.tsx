import { RichTextEditor } from "@/components/rich-text-editor/RIchTextEditor";
import { Button } from "@/components/ui/button";
import { UseAttachmentUploadType } from "@/hooks/use-attachment-upload";
import { ImageIcon, Send } from "lucide-react";
import { ImageUploadModal } from "./ImageUploadModal";
import { AttachmentChip } from "./AttachmentChip";

interface MessageComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  upload: UseAttachmentUploadType;
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  upload,
}: MessageComposerProps) {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button
            type="button"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            <Send className="size-4 mr-1" />
            Send
          </Button>
        }
        footerLeft={
          upload.stagedUrl ? (
            <AttachmentChip url={upload.stagedUrl} onRemove={upload.clear} />
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => upload.setIsOpen(true)}
            >
              <ImageIcon className="size-4 mr-1" />
              Attach
            </Button>
          )
        }
      />
      <ImageUploadModal
        open={upload.isOpen}
        onOpenChange={upload.setIsOpen}
        onUploaded={(url) => upload.onUploaded(url)}
      />
    </>
  );
}
