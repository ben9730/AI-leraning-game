import React, { useEffect } from 'react'
import { Pressable, Text, View, StyleSheet, LayoutChangeEvent } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { NodeState } from './useSkillTreeData'

interface SkillTreeNodeProps {
  lessonId: string
  title: string
  state: NodeState
  isCurrent: boolean
  onPress: () => void
  onLayout?: (event: LayoutChangeEvent) => void
}

function LockIcon() {
  return <Text style={styles.icon}>🔒</Text>
}

function PlayIcon() {
  return <Text style={styles.icon}>▶</Text>
}

function CheckIcon() {
  return <Text style={styles.icon}>✓</Text>
}

export function SkillTreeNode({
  title,
  state,
  isCurrent,
  onPress,
  onLayout,
}: SkillTreeNodeProps) {
  const scale = useSharedValue(1)

  useEffect(() => {
    if (isCurrent) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        true,
      )
    } else {
      scale.value = 1
    }
  }, [isCurrent, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const isDisabled = state === 'locked'

  const containerStyle = [
    styles.node,
    state === 'complete' && styles.nodeComplete,
    state === 'unlocked' && styles.nodeUnlocked,
    state === 'locked' && styles.nodeLocked,
    isCurrent && styles.nodeCurrent,
  ]

  return (
    <Animated.View style={animatedStyle} onLayout={onLayout}>
      <Pressable
        style={containerStyle}
        onPress={isDisabled ? undefined : onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        accessibilityLabel={title}
      >
        <View style={styles.row}>
          {state === 'locked' && <LockIcon />}
          {state === 'unlocked' && <PlayIcon />}
          {state === 'complete' && <CheckIcon />}
          <Text style={[styles.title, state === 'locked' && styles.titleLocked]}>
            {title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  node: {
    marginVertical: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F5F5F5',
  },
  nodeComplete: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  nodeUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#6C63FF',
  },
  nodeLocked: {
    backgroundColor: '#EEEEEE',
    borderColor: '#E0E0E0',
  },
  nodeCurrent: {
    borderColor: '#6C63FF',
    borderWidth: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 4,
  },
  icon: {
    fontSize: 18,
    marginEnd: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
  },
  titleLocked: {
    color: '#9E9E9E',
  },
})
