// components/ClippedImage.tsx

import MaskedView from '@react-native-masked-view/masked-view';
import React from 'react';
import { Image } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';

interface ClippedImageProps {
    source: any;
    width: number;
    height: number;
}

export default function ClippedImage({ source, width, height }: ClippedImageProps) {
    const r = 5;        // 라운드 정도
    const depth = 7;   // 잘리는 깊이

    const clipPath = `
  M0,${r}
  Q0,0 ${r},0
  L${width - depth},0
  L${width},${depth}
  L${width},${height - depth}
  L${width - depth},${height}
  L${r},${height}
  Q0,${height} 0,${height - r}
  Z
`;


    return (
        <MaskedView
            style={{ width, height }}
            maskElement={
                <Svg width={width} height={height}>
                    <Defs>
                        <ClipPath id="clip">
                            <Path d={clipPath} />
                        </ClipPath>
                    </Defs>
                    <Rect width={width} height={height} fill="black" clipPath="url(#clip)" />
                </Svg>
            }
        >
            <Image source={source} style={{ width, height, resizeMode: 'cover' }} />
        </MaskedView>
    );
}
