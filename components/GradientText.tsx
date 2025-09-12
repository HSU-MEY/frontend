import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text } from 'react-native';


const GradientText = ({ 
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  children,
  ...rest
}:any) => {
  return (
    <MaskedView maskElement={<Text style={style}>{children}</Text>}> 
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        {...rest}
      >
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
