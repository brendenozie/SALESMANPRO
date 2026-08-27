// DeleteFeeItemModal.tsx
"use client";

export default function DeleteFeeItemModal({
  isOpen,
  itemName,
  onClose,
  onConfirm,
  isSubmitting,
}: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
        <h3 className="font-bold mb-2">Delete Fee Item</h3>
        <p className="text-sm text-gray-400 mb-6">
          Are you sure you want to delete <b>{itemName}</b>?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-xs">
            Cancel
          </button>
          <button
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 rounded-xl text-xs font-bold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
