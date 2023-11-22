import React, { useEffect } from 'react';

export function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the clicked element is not a button and is outside of the ref element
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        (event.target as HTMLElement).nodeName !== 'BUTTON'
      ) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}
