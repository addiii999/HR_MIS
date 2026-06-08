import React from 'react';
import { X } from 'lucide-react';

/**
 * Accessible glassmorphism modal dialog.
 * Clicking the overlay closes the modal. Propagation is stopped on the inner panel.
 *
 * @param {string} title - Modal heading
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Called when the user cancels or clicks outside
 * @param {function} onSave - Called when the primary action button is clicked
 * @param {ReactNode} children - Modal body content
 * @param {string} [saveText='Save'] - Label for the primary action button
 * @param {'md'|'lg'} [size='md'] - Controls max-width of the dialog
 */
export default function Modal({ title, isOpen, onClose, onSave, children, saveText = 'Save', size = 'md' }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="btn-ghost" style={{ padding: 4 }} onClick={onClose}><X size={20} /></button>
        </div>
        {children}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>{saveText}</button>
        </div>
      </div>
    </div>
  );
}
