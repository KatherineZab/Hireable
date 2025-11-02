// src/components/Modal.js
import { useEffect, useRef } from 'react';
import './Modal.css';

export default function Modal({ onClose, children, isLocked = false }) {
    const modalRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isLocked) return;
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleEsc = (e) => {
            if (isLocked) return;
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [onClose,isLocked]);

    return (
        <div className="modal-overlay">
            <div ref={modalRef}>
                {children}
            </div>
        </div>
    );
}
