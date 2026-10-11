import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Ellipse, Path, Rect, Circle } from 'react-native-svg';
import type { Language } from '@lingua/core';
// Ilustração vetorial com volume: contrato visual para substituir por um asset 3D.
export function LanguageScene({ language }: { language: Language }) {
  return (
    <View
      accessible
      accessibilityLabel={
        language === 'ko'
          ? 'Ilustração de uma casa Hanok'
          : language === 'ja'
            ? 'Ilustração de um Torii e Monte Fuji'
            : 'Ilustração da Torre Eiffel'
      }
      style={{ width: 180, height: 170 }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 220 190">
        <Defs>
          <LinearGradient id="roof" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#46796D" />
            <Stop offset="1" stopColor="#234D49" />
          </LinearGradient>
          <LinearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#AFBEC8" />
          </LinearGradient>
        </Defs>
        <Ellipse cx="115" cy="163" rx="86" ry="13" fill="#123D44" opacity="0.12" />
        {language === 'ko' ? (
          <>
            <Circle cx="162" cy="43" r="23" fill="#FBF5D8" />
            <Path d="M30 148 L103 116 L193 143 L123 178 Z" fill="#61A994" />
            <Path d="M123 178 L193 143 L193 151 L123 184 L30 155 L30 148 Z" fill="#3F8B75" />
            <Path d="M53 95 L118 69 L170 88 L170 144 L117 164 L53 143 Z" fill="#F4E8CB" />
            <Path d="M117 109 L170 88 L170 144 L117 164 Z" fill="#D9C6A1" />
            <Path
              d="M24 96 Q46 88 57 63 L115 36 Q142 62 193 77 L172 98 L119 121 L53 101 Z"
              fill="url(#roof)"
            />
            <Path d="M26 96 L119 121 L192 78 L192 88 L120 131 L27 105 Z" fill="#244841" />
            <Path d="M56 64 L115 36 L171 75 L119 104 Z" fill="#55887B" />
            <Rect x="65" y="116" width="32" height="29" rx="2" fill="#715B47" />
            <Path
              d="M75 116 V145 M86 116 V145 M65 127 H97 M65 136 H97"
              stroke="#CEB78C"
              strokeWidth="2"
            />
            <Path d="M129 123 L154 113 L154 144 L129 154 Z" fill="#6A6450" />
            <Path d="M141 119 V150 M129 135 L154 125" stroke="#D7C291" strokeWidth="2" />
            <Circle cx="34" cy="136" r="14" fill="#348C70" />
          </>
        ) : language === 'ja' ? (
          <>
            <Circle cx="169" cy="37" r="23" fill="#F1A2A9" />
            <Path d="M42 140 L112 38 L192 140 Z" fill="#93A8B7" />
            <Path d="M112 38 L79 86 L104 76 L116 84 L129 75 L148 88 Z" fill="url(#snow)" />
            <Rect x="58" y="82" width="13" height="82" fill="#C0404F" />
            <Rect x="153" y="80" width="13" height="84" fill="#A52D41" />
            <Path d="M30 64 Q110 88 194 64 L193 76 Q111 99 32 77 Z" fill="#C83C4B" />
            <Rect x="44" y="101" width="138" height="10" fill="#AB2F40" />
            <Rect x="105" y="81" width="10" height="25" fill="#C9404E" />
            <Path d="M20 155 Q30 102 17 67" stroke="#875667" strokeWidth="5" fill="none" />
            {[
              [18, 62],
              [27, 86],
              [13, 102],
              [34, 110],
              [8, 78],
            ].map(([x, y], i) => (
              <Circle key={i} cx={x} cy={y} r="10" fill="#F8AFC4" />
            ))}
          </>
        ) : (
          <>
            <Circle cx="166" cy="43" r="25" fill="#FFFFFF" opacity="0.6" />
            <Path
              d="M107 24 L115 24 L120 74 L142 116 L173 164 L142 164 Q111 105 78 164 L50 164 L81 116 L101 74 Z"
              fill="#315B92"
            />
            <Path
              d="M113 24 L120 74 L142 116 L173 164 L158 164 L130 115 L113 74 Z"
              fill="#244878"
            />
            <Path d="M89 88 H132 M77 114 H145 M64 140 H161" stroke="#7495BE" strokeWidth="6" />
            <Path
              d="M108 42 L97 90 L133 115 M115 42 L126 90 L84 115 M82 117 L149 147 M142 117 L71 147"
              stroke="#A3B8D5"
              strokeWidth="2"
              fill="none"
            />
            <Rect x="84" y="158" width="62" height="6" fill="#F2F5FD" />
            <Rect x="145" y="158" width="18" height="6" fill="#D15E71" />
          </>
        )}
      </Svg>
    </View>
  );
}
