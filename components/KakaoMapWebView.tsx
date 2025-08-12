// KakaoMapWebView.tsx
import React, { useMemo, useRef } from 'react';
import { ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

type Props = {
  style?: ViewStyle;
  jsKey: string;                 // JavaScript Key for Kakao Maps API
  center?: { lat: number; lng: number };
  level?: number;                // Zoom Level
  onReady?: () => void;
  onPress?: (lat: number, lng: number) => void;
  onDragChange?: (active: boolean) => void;
};

export default function KakaoMapWebView({
  style,
  jsKey,
  center = { lat: 37.5665, lng: 126.9780 },
  level = 4,
  onReady,
  onPress,
  onDragChange,
}: Props) {
  const webRef = useRef<WebView>(null);

  const html = useMemo(() => `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          body { height:100%; margin:0; padding:0; }
          html { height: 100%; }
          #map { width:100%; height:100%; }
        </style>
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}"></script>
      </head>
      <body>
        <div id="map">map</div>
        <script>
          window.onload = function() {
            if (typeof kakao !== 'undefined' && kakao.maps) {
              const mapContainer = document.getElementById('map');
              const mapOption = {
                center: new kakao.maps.LatLng(${center.lat}, ${center.lng}),
                level: ${level},
              };
              const map = new kakao.maps.Map(mapContainer, mapOption);

              // Ready event
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));

              // Map click event
              kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                const latlng = mouseEvent.latLng;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'press',
                  lat: latlng.getLat(),
                  lng: latlng.getLng(),
                }));
              });

              // Expose API to RN
              window.__api = {
                setCenter: function(lat, lng, level) {
                  const center = new kakao.maps.LatLng(lat, lng);
                  map.setCenter(center);
                  if (level) map.setLevel(level);
                },
                addMarker: function(lat, lng) {
                  const markerPosition  = new kakao.maps.LatLng(lat, lng);
                  const marker = new kakao.maps.Marker({
                    position: markerPosition,
                  });
                  marker.setMap(map);
                },
              };
            } else {
              console.error("Kakao Maps is not available.");
            }
          };
        </script>
      </body>
    </html>
  `.trim(), [jsKey, center.lat, center.lng, level]);

  // RN -> Web: Helper
  const call = (code: string) => webRef.current?.injectJavaScript(code + ';true;');

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'ready') onReady?.();
      if (msg.type === 'press') onPress?.(msg.lat, msg.lng);
    } catch {}
  };

  return (
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1 }}
      />
  );
}

// 사용 예시에서 이렇게 제어:
// call(`window.__api.setCenter(${lat}, ${lng}, ${level})`)
// call(`window.__api.addMarker(${lat}, ${lng})`)
