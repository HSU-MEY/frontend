// components/KakaoMapWebView.tsx
import { Segment } from '@/api/routes.service';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

type Props = {
  style?: ViewStyle;
  jsKey: string;
  center?: { lat: number; lng: number };
  level?: number;
  segments?: Segment[];
  onReady?: () => void;
  onPress?: (lat: number, lng: number) => void;
  onDragChange?: (active: boolean) => void;
};

export type KakaoMapHandle = {
  /** 중심 이동 (옵션: level 지정) */
  setCenter: (lat: number, lng: number, level?: number) => void;
  /** 단일 마커를 해당 좌표로 표시 (없으면 생성) */
  addMarker: (lat: number, lng: number) => void;
  /** 여러 마커를 추가합니다. */
  addMarkers: (coords: { lat: number, lng: number }[]) => void;
  /** 중심 이동 + 단일 마커 표시 */
  focusTo: (lat: number, lng: number, level?: number) => void;
  /** (확장용) 모든 마커 제거 */
  clearMarkers: () => void;
  /** (확장용) 모든 폴리라인 제거 */
  clearPolylines: () => void;
  /** (확장용) 부드럽게 중심 이동 */
  panTo: (lat: number, lng: number) => void;
  /** (확장용) 현재 위치 마커 표시 */
  setCurrentLocationMarker: (lat: number, lng: number, imageUrl: string) => void;
};

const KakaoMapWebView = forwardRef<KakaoMapHandle, Props>(function KakaoMapWebView(
  {
    style, jsKey,
    center = { lat: 37.5665, lng: 126.9780 },
    level = 4,
    segments,
    onReady, onPress, onDragChange }: Props,
  ref
) {
  const webRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

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

        // 마커/폴리라인 핸들
        window._markers = [];
        window._polylines = [];
        window._currentLocationMarker = null;

        window.__api = {
          setCenter: function(lat, lng, level){
            var pos = new kakao.maps.LatLng(lat, lng);
            _kmap.setCenter(pos);
            if (typeof level === 'number') _kmap.setLevel(level);
          },
          addMarker: function(lat, lng){
            var pos = new kakao.maps.LatLng(lat, lng);
            var marker = new kakao.maps.Marker({ map: _kmap, position: pos });
            window._markers.push(marker);
          },
          addMarkers: function(coords) {
            window.__api.clearMarkers();
            if (!Array.isArray(coords)) return;
            var bounds = new kakao.maps.LatLngBounds();
            coords.forEach(function(c) {
              var pos = new kakao.maps.LatLng(c.lat, c.lng);
              var marker = new kakao.maps.Marker({ map: _kmap, position: pos });
              window._markers.push(marker);
              bounds.extend(pos);
            });
            if (window._markers.length > 0) {
              _kmap.setBounds(bounds);
            }
          },
          focusTo: function(lat, lng, level){
            var pos = new kakao.maps.LatLng(lat, lng);
            window.__api.clearMarkers();
            var marker = new kakao.maps.Marker({ map: _kmap, position: pos });
            window._markers.push(marker);
            _kmap.setCenter(pos);
            if (typeof level === 'number') _kmap.setLevel(level);
          },
          clearMarkers: function(){
            window._markers.forEach(function(m) { m.setMap(null); });
            window._markers = [];
          },
          drawPolylines: function(segments) {
            // 기존 폴리라인 제거
            window._polylines.forEach(p => p.setMap(null));
            window._polylines = [];

            if (!segments || !Array.isArray(segments)) return;

            segments.forEach(seg => {
              if (!seg.steps || !Array.isArray(seg.steps)) return;

              seg.steps.forEach(step => {
                if (!step.polyline || !Array.isArray(step.polyline)) return;

                var linePath = step.polyline.map(p => new kakao.maps.LatLng(p.lat, p.lng));
                if(linePath.length < 2) return;

                var color = '#FF0000'; // default color
                switch(step.mode) {
                  case 'WALK':
                    color = '#888888';
                    break;
                  case 'BUS':
                    color = '#0000FF'; // default blue
                    if (step.lineName) {
                      if (step.lineName.includes('마을')) color = '#FFFF00';
                      else if (step.lineName.includes('시내/간선')) color = '#0000FF';
                      else if (step.lineName.includes('지선')) color = '#008000';
                      else if (step.lineName.includes('광역')) color = '#f32f2f';
                    }
                    break;
                  case 'SUBWAY':
                    color = '#FFA500'; // default orange
                    if (step.lineName) {
                      if (step.lineName === '수도권1호선') color = '#00498B';
                      else if (step.lineName === '수도권2호선') color = '#009246';
                      else if (step.lineName === '수도권3호선') color = '#F36630';
                      else if (step.lineName === '수도권4호선') color = '#00A2D1';
                      else if (step.lineName === '수도권5호선') color = '#A664A3';
                      else if (step.lineName === '수도권6호선') color = '#9E4510';
                      else if (step.lineName === '수도권7호선') color = '#5D6519';
                      else if (step.lineName === '수도권8호선') color = '#D6406A';
                      else if (step.lineName === '수도권9호선') color = '#8E764B';
                      else if (step.lineName === '경강선') color = '#003DA5';
                      else if (step.lineName === '경춘선') color = '#0C8E72';
                      else if (step.lineName === '수인분당선') color = '#E0A134';
                      else if (step.lineName === '경의중앙선') color = '#2ABFD0';
                      else if (step.lineName === '신분당선') color = '#BB1834';
                      else if (step.lineName === '인천1호선') color = '#6E98BB';
                      else if (step.lineName === '인천2호선') color = '#ED8B00';
                      else if (step.lineName === '에버라인') color = '#6CBB5A';
                      else if (step.lineName === '의정부경전철') color = '#B0B0B0';
                      else if (step.lineName === '우이신설경전철') color = '#FF7F00';
                    }
                    break;
                }

                var polyline = new kakao.maps.Polyline({
                  path: linePath,
                  strokeWeight: 5,
                  strokeColor: color,
                  strokeOpacity: 0.9,
                  strokeStyle: 'solid'
                });

                polyline.setMap(_kmap);
                window._polylines.push(polyline);
              });
            });
          },
          clearPolylines: function(){
            window._polylines.forEach(p => p.setMap(null));
            window._polylines = [];
          },
          panTo: function(lat, lng) {
            var moveLatLon = new kakao.maps.LatLng(lat, lng);
            _kmap.panTo(moveLatLon);
          },
          setCurrentLocationMarker: function(lat, lng, imageUrl) {
            var pos = new kakao.maps.LatLng(lat, lng);
            if (window._currentLocationMarker) {
              window._currentLocationMarker.setPosition(pos);
            } else {
              var imageSrc = imageUrl;
              var imageSize = new kakao.maps.Size(32, 32);
              var imageOption = {offset: new kakao.maps.Point(16, 32)};
              var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

              window._currentLocationMarker = new kakao.maps.Marker({
                position: pos,
                image: markerImage
              });
              window._currentLocationMarker.setMap(_kmap);
            }
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

  useEffect(() => {
    if (isMapReady && segments) {
      const segmentsJson = JSON.stringify(segments);
      call(`window.__api && window.__api.drawPolylines(${segmentsJson})`);
    }
  }, [isMapReady, segments]);

  // Ref 메서드 노출
  useImperativeHandle(ref, () => ({
    setCenter(lat, lng, lvl) {
      call(`window.__api && window.__api.setCenter(${lat}, ${lng}, ${typeof lvl === 'number' ? lvl : 'undefined'})`);
    },
    addMarker(lat, lng) {
      call(`window.__api && window.__api.addMarker(${lat}, ${lng})`);
    },
    addMarkers(coords) {
      const coordsJson = JSON.stringify(coords);
      call(`window.__api && window.__api.addMarkers(${coordsJson})`);
    },
    focusTo(lat, lng, lvl) {
      call(`window.__api && window.__api.focusTo(${lat}, ${lng}, ${typeof lvl === 'number' ? lvl : 'undefined'})`);
    },
    clearMarkers() {
      call(`window.__api && window.__api.clearMarkers()`);
    },
    clearPolylines() {
      call(`window.__api && window.__api.clearPolylines()`);
    },
    panTo(lat, lng) {
      call(`window.__api && window.__api.panTo(${lat}, ${lng})`);
    },
    setCurrentLocationMarker(lat, lng, imageUrl) {
      call(`window.__api && window.__api.setCurrentLocationMarker(${lat}, ${lng}, '${imageUrl}')`);
    }
  }));

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'ready') {
        onReady?.();
        setIsMapReady(true);
      }
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
