'use client';

import { useState } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listingName: string;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  listingName,
  isLoading = false,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const isConfirmDisabled = confirmText !== listingName || isLoading;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-[350px] shadow-lg border border-gray-200">
        {/* Title */}
        <h2 className="text-base font-semibold text-center text-black mb-1">
          Are you sure?
        </h2>
        
        {/* Message */}
        <p className="text-sm text-gray-500 text-center mb-6">
          Deleting this listing will permanently remove it from the database. This action cannot be undone.
        </p>
        
        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-[#8A1538] text-white font-semibold text-sm py-2.5 rounded-2xl hover:bg-[#6d102d] transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-[#8A1538] font-semibold text-sm py-2.5 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}