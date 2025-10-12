import { useState, useEffect, RefObject } from 'react';

export function useSelection(targetRef: RefObject<HTMLElement>) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!targetRef.current) return;

      const currentSelection = window.getSelection();

      if (currentSelection && currentSelection.rangeCount > 0 && targetRef.current.contains(currentSelection.anchorNode)) {
        const range = currentSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (currentSelection.toString().trim().length > 0 && rect.width > 0 && rect.height > 0) {
          setSelection(currentSelection);
          setSelectionRect(rect);
          setHasSelection(true);
        } else {
          setHasSelection(false);
          setSelectionRect(null);
        }
      } else {
        setHasSelection(false);
        setSelectionRect(null);
      }
    };

    const handleMouseUp = () => {
        // This timeout ensures that the selection has been updated
        setTimeout(handleSelectionChange, 10);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [targetRef]);

  return { selection, selectionRect, hasSelection };
}
