'use client';

import { useEffect } from 'react';

// Remove DOM injetado pelo widget Glassix (carregado em (public)/layout.tsx)
// quando o usuário entra no portal. O <Script> desmonta no React, mas o
// botão flutuante criado por side-effect persiste — este componente garante
// que ele suma e não volte (MutationObserver).
export function HideWhatsAppWidget() {
  useEffect(() => {
    const SELECTORS = [
      '[id^="glassix"]',
      '[class*="glassix"]',
      '[id*="whatsapp-widget"]',
      '[class*="whatsapp-widget"]',
    ];

    const removeAll = () => {
      for (const sel of SELECTORS) {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      }
    };

    removeAll();

    const observer = new MutationObserver(removeAll);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
