// components/KakaoMapWebView.tsx
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

type Props = {
  style?: ViewStyle;
  jsKey: string;
  center?: { lat: number; lng: number };
  level?: number;
  onReady?: () => void;
  onPress?: (lat: number, lng: number) => void;
  onDragChange?: (active: boolean) => void;
};

export type KakaoMapHandle = {
  /** 중심 이동 (옵션: level 지정) */
  setCenter: (lat: number, lng: number, level?: number) => void;
  /** 단일 마커를 해당 좌표로 표시 (없으면 생성) */
  addMarker: (lat: number, lng: number) => void;
  /** 중심 이동 + 단일 마커 표시 */
  focusTo: (lat: number, lng: number, level?: number) => void;
  /** (확장용) 모든 마커 제거 */
  clearMarkers: () => void;
};

const KakaoMapWebView = forwardRef<KakaoMapHandle, Props>(function KakaoMapWebView(
  { style, jsKey, center = { lat: 37.5665, lng: 126.9780 }, level = 4, onReady, onPress, onDragChange }: Props,
  ref
) {
  const webRef = useRef<WebView>(null);

  const html = useMemo(
    () =>
      `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <style>
      html, body { height:100%; margin:0; padding:0; }
      #map { width:100%; height:100%; }
    </style>
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      (function(){
        function post(msg){ window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }

        var mapContainer = document.getElementById('map');
        var mapOption = {
          center: new kakao.maps.LatLng(${center.lat}, ${center.lng}),
          level: ${level}
        };
        window._kmap = new kakao.maps.Map(mapContainer, mapOption);

        // drag start/end
        kakao.maps.event.addListener(_kmap, 'dragstart', function(){ post({ type: 'drag', active: true }); });
        kakao.maps.event.addListener(_kmap, 'dragend', function(){ post({ type: 'drag', active: false }); });

        // click → RN callback
        kakao.maps.event.addListener(_kmap, 'click', function(mouseEvent){
          var latlng = mouseEvent.latLng;
          post({ type: 'press', lat: latlng.getLat(), lng: latlng.getLng() });
        });

        // 단일 마커 핸들
        window._singleMarker = null;

        window.__api = {
          setCenter: function(lat, lng, level){
            var pos = new kakao.maps.LatLng(lat, lng);
            _kmap.setCenter(pos);
            if (typeof level === 'number') _kmap.setLevel(level);
          },
          addMarker: function(lat, lng){
            var pos = new kakao.maps.LatLng(lat, lng);
            if (!window._singleMarker) {
              window._singleMarker = new kakao.maps.Marker({ map: _kmap, position: pos });
            } else {
              window._singleMarker.setPosition(pos);
              if (!window._singleMarker.getMap()) window._singleMarker.setMap(_kmap);
            }
          },
          focusTo: function(lat, lng, level){
            var pos = new kakao.maps.LatLng(lat, lng);
            if (!window._singleMarker) {
              window._singleMarker = new kakao.maps.Marker({ map: _kmap, position: pos });
            } else {
              window._singleMarker.setPosition(pos);
              if (!window._singleMarker.getMap()) window._singleMarker.setMap(_kmap);
            }
            _kmap.setCenter(pos);
            if (typeof level === 'number') _kmap.setLevel(level);
          },
          clearMarkers: function(){
            if (window._singleMarker) { window._singleMarker.setMap(null); }
          }
        };

        // ready
        setTimeout(function(){ post({ type: 'ready' }); }, 0);
      })();
    </script>
  </body>
</html>
      `.trim(),
    [jsKey, center.lat, center.lng, level]
  );

  // RN -> Web
  const call = (code: string) => webRef.current?.injectJavaScript(code + ';true;');

  // Ref 메서드 노출
  useImperativeHandle(ref, () => ({
    setCenter(lat, lng, lvl) {
      call(`window.__api && window.__api.setCenter(${lat}, ${lng}, ${typeof lvl === 'number' ? lvl : 'undefined'})`);
    },
    addMarker(lat, lng) {
      call(`window.__api && window.__api.addMarker(${lat}, ${lng})`);
    },
    focusTo(lat, lng, lvl) {
      call(`window.__api && window.__api.focusTo(${lat}, ${lng}, ${typeof lvl === 'number' ? lvl : 'undefined'})`);
    },
    clearMarkers() {
      call(`window.__api && window.__api.clearMarkers()`);
    },
  }));

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'ready') onReady?.();
      if (msg.type === 'press') onPress?.(msg.lat, msg.lng);
      if (msg.type === 'drag' && typeof msg.active === 'boolean') onDragChange?.(msg.active);
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
      style={[{ flex: 1 }, style]}
    />
  );
});

export default KakaoMapWebView;
