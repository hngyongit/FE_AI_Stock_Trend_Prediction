import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { Text } from '@/shared/ui';
import { palette, radius } from '@/shared/design/tokens';

const DELETE_WIDTH = 88;
const THRESHOLD = -60;
const OVERSHOOT_DELETE = -DELETE_WIDTH - 30; // swipe past this → auto-delete

type SwipeableRowProps = {
    children: React.ReactNode;
    symbol: string;
    onDelete: (symbol: string) => void;
};

export function SwipeableRow({ children, symbol, onDelete }: SwipeableRowProps) {
    const translateX = useSharedValue(0);
    const startTranslateX = useSharedValue(0);
    const deletingRef = useRef(false);

    // Runs on JS thread via runOnJS bridge
    const commitDelete = useCallback(() => {
        if (deletingRef.current) return;
        deletingRef.current = true;

        // Animate back closed first, then remove
        translateX.value = withSpring(0, { damping: 20 });
        setTimeout(() => {
            onDelete(symbol);
        }, 250);
    }, [symbol, onDelete, translateX]);

    // All gesture callbacks run on the UI thread by default.
    // runOnJS bridges to JS thread for state/callback calls.
    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onStart(() => {
            startTranslateX.value = translateX.value;
        })
        .onUpdate((event) => {
            const next = startTranslateX.value + event.translationX;
            // Allow overshoot past DELETE_WIDTH so overswipe can be detected
            translateX.value = Math.max(Math.min(next, 0), -(DELETE_WIDTH + 40));
        })
        .onEnd((event) => {
            const endX = startTranslateX.value + event.translationX;
            if (endX < OVERSHOOT_DELETE) {
                // Overswiped → auto-delete without button press
                translateX.value = withSpring(0, { damping: 20 });
                commitDelete();
            } else if (endX < THRESHOLD) {
                // Reveal delete — snap open
                translateX.value = withSpring(-DELETE_WIDTH, { damping: 20 });
            } else {
                // Snap closed
                translateX.value = withSpring(0, { damping: 20 });
            }
        })
        .runOnJS(true);

    const onDeletePress = useCallback(() => {
        commitDelete();
    }, [symbol, commitDelete]);

    const rowAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={styles.wrapper}>
            {/* Delete action — sits behind the row */}
            <View style={styles.deleteContainer}>
                <Pressable
                    onPress={onDeletePress}
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.deletePressed]}
                >
                    <Text style={styles.deleteLabel}>Delete</Text>
                </Pressable>
            </View>

            {/* Sliding row */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.row, rowAnimatedStyle]}>
                    {children}
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: palette.negative,
    },
    deleteContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: DELETE_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: palette.negative,
        borderRadius: radius.card,
        alignItems: 'center',
        justifyContent: 'center',
        width: DELETE_WIDTH - 8,
        height: '80%',
    },
    deletePressed: {
        opacity: 0.8,
    },
    deleteLabel: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 13,
    },
    row: {
        backgroundColor: palette.surface,
    },
});

