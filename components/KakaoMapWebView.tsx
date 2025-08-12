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
};

export default function KakaoMapWebView({
  style,
  jsKey,
  center = { lat: 37.5665, lng: 126.9780 },
  level = 4,
  onReady,
  onPress,
}: Props) {
  const webRef = useRef<WebView>(null);

  const html = useMemo(() => `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          html, body, #map { height:100%; margin:0; padding:0; }
        </style>
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${jsKey}"></script>
      </head>
      <body>
        <div id="map">MAP POSITION</div>
        <script>

          function post(msg){window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg));}


            const container = document.getElementById('map');
            const center = new kakao.maps.LatLng(${center.lat}, ${center.lng});
            const map = new kakao.maps.Map(container, { center, level: ${level} });
            window.__map = map;

            // 클릭 이벤트 → RN으로 좌표 전송
            kakao.maps.event.addListener(map, 'click', function(mouseEvent){
              const latlng = mouseEvent.latLng;
              post({ type: 'press', lat: latlng.getLat(), lng: latlng.getLng() });
            });

            post({ type: 'ready' });
          });

          // RN → Web 제어용 API
          window.__api = {
            setCenter(lat, lng, level){
              if(!window.__map) return;
              window.__map.setCenter(new kakao.maps.LatLng(lat, lng));
              if(typeof level === 'number'){ window.__map.setLevel(level); }
            },
            addMarker(lat, lng){
              if(!window.__map) return;
              new kakao.maps.Marker({
                position: new kakao.maps.LatLng(lat, lng),
                map: window.__map
              });
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
      style={style}
    />
  );
}

// 사용 예시에서 이렇게 제어:
// call(`window.__api.setCenter(${lat}, ${lng}, ${level})`)
// call(`window.__api.addMarker(${lat}, ${lng})`)
