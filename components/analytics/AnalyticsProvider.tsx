import Script from "next/script";

interface AnalyticsProviderProps {
  config?: {
    googleTag?: string;
    metaPixel?: string;
    tiktokPixel?: string;
    hotjarSiteId?: string;
    facebookTag?: string;
    isActive?: boolean;
  };
}

export default function AnalyticsProvider({ config }: AnalyticsProviderProps) {
  if (!config) return null;

  // googleTag: raw.AnalyticsConfig.googleTag ?? null,
  //     facebookTag: raw.AnalyticsConfig.facebookTag ?? null,
  //     hotjarSiteId: raw.AnalyticsConfig.hotjarSiteId ?? null,
  //     isActive: typeof raw.AnalyticsConfig.isActive === 'boolean' ? raw.AnalyticsConfig.isActive : false,
  const { googleTag, metaPixel, tiktokPixel, hotjarSiteId, facebookTag, isActive } = config;

  return (
    <>
      {/* ================= GA4 ================= */}
      {googleTag && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleTag}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleTag}');
            `}
          </Script>
        </>
      )}

      {/* ================= META (Facebook Pixel) ================= */}
      {metaPixel && (
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
            fbq('init', '${metaPixel}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* ================= TikTok Pixel ================= */}
      {tiktokPixel && (
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
              ttq.load('${tiktokPixel}');
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

      {/* ================= Facebook Tag (if separate from Meta Pixel) ================= */}
      {facebookTag && (
        <Script id="facebook-tag" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookTag}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}