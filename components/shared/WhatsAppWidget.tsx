'use client';

import Script from 'next/script';

export function WhatsAppWidget() {
  return (
    <Script id="glassix-whatsapp" strategy="lazyOnload">
      {`
        var glassixWidgetOptions = { "numbers": [{ "number": "554791926463", "name": "Fabiano Bratti", "subtitle": "" }], "left": false, "ltr": true, "popupText": "", "title": "Olá!", "subTitle": "Clique abaixo para iniciar uma conversa" };
        !function (t) { var e = function () { window.requirejs && !window.whatsAppWidgetClient && (requirejs.config({ paths: { GlassixWhatsAppWidgetClient: "https://cdn.glassix.com/clients/whatsapp.widget.1.2.min.js" } }), require(["GlassixWhatsAppWidgetClient"], function (t) { window.whatsAppWidgetClient = new t(window.glassixWidgetOptions), whatsAppWidgetClient.attach() })), window.GlassixWhatsAppWidgetClient && "function" == typeof window.GlassixWhatsAppWidgetClient ? (window.whatsAppWidgetClient = new GlassixWhatsAppWidgetClient(t), whatsAppWidgetClient.attach()) : i() }, i = function () { a.onload = e, a.src = "https://cdn.glassix.net/clients/whatsapp.widget.1.2.min.js", s && s.parentElement && s.parentElement.removeChild(s), n.parentNode.insertBefore(a, n) }, n = document.getElementsByTagName("script")[0], s = document.createElement("script"); s.async = !0, s.type = "text/javascript", s.crossorigin = "anonymous", s.id = "glassix-whatsapp-widget-script"; var a = s.cloneNode(); s.onload = e, s.src = "https://cdn.glassix.com/clients/whatsapp.widget.1.2.min.js", !document.getElementById(s.id) && document.body && (n.parentNode.insertBefore(s, n), s.onerror = i) }(glassixWidgetOptions);
      `}
    </Script>
  );
}
