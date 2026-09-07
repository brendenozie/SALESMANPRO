import Script from "next/script";

interface AnalyticsProviderProps {
  config?: {
    googleAnalyticsId?: string | null;
    googleAdsId?: string | null;
    facebookPixelId?: string | null;
    tiktokPixelId?: string | null;
    hotjarSiteId?: string | null;
    isActive?: boolean;
  };
}

function sanitizeTrackingId(id?: string | null): string | null {
  if (!id || typeof id !== "string") return null;
  const trimmed = id.trim();
  if (!/^[a-zA-Z0-9_\-\.]+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function sanitizeNumericId(id?: string | null): string | null {
  if (!id || typeof id !== "string") return null;
  const trimmed = id.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export default function AnalyticsProvider({ config }: AnalyticsProviderProps) {
  // Master killswitch: If config is missing or tracking is disabled, inject nothing.
  if (!config || !config.isActive) return null;

  const googleAnalyticsId = sanitizeTrackingId(config.googleAnalyticsId);
  const googleAdsId = sanitizeTrackingId(config.googleAdsId);
  const facebookPixelId = sanitizeNumericId(config.facebookPixelId);
  const tiktokPixelId = sanitizeTrackingId(config.tiktokPixelId);
  const hotjarSiteId = sanitizeNumericId(config.hotjarSiteId);

  return (
    <>
      {/* ================= Google Analytics & Google Ads ================= */}
      {(googleAnalyticsId || googleAdsId) && (
        <>
          {/* Initialize gtag with whichever ID exists first */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId || googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${googleAnalyticsId ? `gtag('config', '${googleAnalyticsId}');` : ''}
              ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
            `}
          </Script>
        </>
      )}

      {/* ================= META (Facebook Pixel) ================= */}
      {facebookPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* ================= TikTok Pixel ================= */}
      {tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;
              var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++) ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){var e=ttq._i[t]||[];return e};
              ttq.load=function(e,n){
                var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                ttq._i=ttq._i||{};
                ttq._i[e]=[];
                ttq._i[e]._u=i;
                ttq._t=ttq._t||{};
                ttq._t[e]=+new Date;
                ttq._o=ttq._o||{};
                ttq._o[e]=n||{};
                var o=d.createElement("script");
                o.type="text/javascript";
                o.async=!0;
                o.src=i+"?sdkid="+e+"&lib="+t;
                var a=d.getElementsByTagName("script")[0];
                a.parentNode.insertBefore(o,a)
              };
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {/* ================= Hotjar ================= */}
      {hotjarSiteId && (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${hotjarSiteId},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}
    </>
  );
}