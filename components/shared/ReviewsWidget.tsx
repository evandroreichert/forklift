'use client';

import Script from 'next/script';

export function ReviewsWidget() {
  return (
    <>
      <div className="elfsight-app-8590a78e-bc30-45e2-954b-269111b57ac4" data-elfsight-app-lazy />
      <Script
        src="https://static.elfsight.com/platform/platform.js"
        strategy="lazyOnload"
        data-use-service-core
      />
    </>
  );
}
