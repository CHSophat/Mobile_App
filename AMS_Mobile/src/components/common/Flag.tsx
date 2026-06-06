import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Polygon } from 'react-native-svg';

export type LangCode = 'en' | 'kh' | 'cn';

interface FlagProps {
  code: LangCode;
  size?: number;
}

const Flag: React.FC<FlagProps> = ({ code, size = 24 }) => {
  const width = size;
  const height = Math.round(size * 0.7);

  return (
    <View
      style={[
        styles.frame,
        { width, height, borderRadius: Math.max(2, size / 12) },
      ]}
    >
      {code === 'en' ? <UnionJack width={width} height={height} /> : null}
      {code === 'kh' ? <Cambodia width={width} height={height} /> : null}
      {code === 'cn' ? <China width={width} height={height} /> : null}
    </View>
  );
};

const UnionJack: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => (
  <Svg width={width} height={height} viewBox="0 0 60 30">
    <Rect width={60} height={30} fill="#012169" />
    {/* White diagonals */}
    <Path d="M0 0 L60 30 M60 0 L0 30" stroke="#FFFFFF" strokeWidth={6} />
    {/* Red diagonals */}
    <Path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth={2} />
    {/* White cross */}
    <Rect x={26} width={8} height={30} fill="#FFFFFF" />
    <Rect y={11} width={60} height={8} fill="#FFFFFF" />
    {/* Red cross */}
    <Rect x={28} width={4} height={30} fill="#C8102E" />
    <Rect y={13} width={60} height={4} fill="#C8102E" />
  </Svg>
);

const Cambodia: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => (
  <Svg width={width} height={height} viewBox="0 0 60 30">
    <Rect width={60} height={7.5} fill="#032EA1" />
    <Rect y={7.5} width={60} height={15} fill="#E00025" />
    <Rect y={22.5} width={60} height={7.5} fill="#032EA1" />
    {/* Simplified temple silhouette */}
    <Rect x={26} y={12} width={8} height={6} fill="#FFFFFF" />
    <Rect x={28} y={9} width={4} height={3} fill="#FFFFFF" />
  </Svg>
);

const China: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => (
  <Svg width={width} height={height} viewBox="0 0 60 30">
    <Rect width={60} height={30} fill="#DE2910" />
    {/* Large star */}
    <Polygon
      points="10,4 11.6,8.4 16,8.4 12.4,11 13.8,15.5 10,12.7 6.2,15.5 7.6,11 4,8.4 8.4,8.4"
      fill="#FFDE00"
    />
    {/* Small stars */}
    <Polygon
      points="20,3 20.7,4.7 22.5,4.7 21.1,5.7 21.6,7.4 20,6.4 18.4,7.4 18.9,5.7 17.5,4.7 19.3,4.7"
      fill="#FFDE00"
    />
    <Polygon
      points="24,7 24.5,8.4 26,8.4 24.8,9.3 25.3,10.6 24,9.8 22.7,10.6 23.2,9.3 22,8.4 23.5,8.4"
      fill="#FFDE00"
    />
    <Polygon
      points="24,13 24.5,14.4 26,14.4 24.8,15.3 25.3,16.6 24,15.8 22.7,16.6 23.2,15.3 22,14.4 23.5,14.4"
      fill="#FFDE00"
    />
    <Polygon
      points="20,17 20.7,18.4 22.5,18.4 21.1,19.3 21.6,20.6 20,19.8 18.4,20.6 18.9,19.3 17.5,18.4 19.3,18.4"
      fill="#FFDE00"
    />
  </Svg>
);

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.15)',
  },
});

export default Flag;
