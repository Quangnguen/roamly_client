import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface TypingIndicatorProps {
  isVisible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  const user = useSelector((state: RootState) => state.auth);
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isVisible) {
      const createAnimation = (dotOpacity: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(dotOpacity, {
              toValue: 1,
              duration: 500,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(dotOpacity, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animation1 = createAnimation(dot1Opacity, 0);
      const animation2 = createAnimation(dot2Opacity, 200);
      const animation3 = createAnimation(dot3Opacity, 400);

      animation1.start();
      animation2.start();
      animation3.start();

      return () => {
        animation1.stop();
        animation2.stop();
        animation3.stop();
      };
    }
  }, [isVisible, dot1Opacity, dot2Opacity, dot3Opacity]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: user.profile?.profilePic || 'https://randomuser.me/api/portraits/men/10.jpg',
        }}
        style={styles.profilePic}
      />
      <View style={styles.bubble}>
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  profilePic: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  bubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginHorizontal: 1,
  },
});

export default TypingIndicator;

