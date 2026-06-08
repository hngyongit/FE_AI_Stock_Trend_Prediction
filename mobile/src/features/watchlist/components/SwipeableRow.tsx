import { useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    PanResponder,
    StyleSheet,
    View,
} from 'react-native';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';

type SwipeableRowProps = {
    children: React.ReactNode;
    onDelete: () => void;
    disabled?: boolean;
};

const ACTION_WIDTH = 96;
const OPEN_THRESHOLD = ACTION_WIDTH / 2;
const SNAP_DURATION = 160;
const DELETE_REVEAL_DURATION = 140;
const DELETE_EXIT_DURATION = 240;
const DELETE_HOLD_DURATION = 140;
const DEFAULT_ROW_WIDTH = 320;

export function SwipeableRow({ children, onDelete, disabled = false }: SwipeableRowProps) {
    const [rowWidth, setRowWidth] = useState(DEFAULT_ROW_WIDTH);
    const translateX = useRef(new Animated.Value(0)).current;
    const offsetRef = useRef(0);
    const isDeletingRef = useRef(false);
    const cardShadowOpacity = translateX.interpolate({
        inputRange: [-ACTION_WIDTH, 0],
        outputRange: [0.18, 0],
        extrapolate: 'clamp',
    });
    const cardScale = translateX.interpolate({
        inputRange: [-ACTION_WIDTH, 0],
        outputRange: [0.985, 1],
        extrapolate: 'clamp',
    });
    const contentOpacity = translateX.interpolate({
        inputRange: [-ACTION_WIDTH, 0],
        outputRange: [0.94, 1],
        extrapolate: 'clamp',
    });
    const revealOpacity = translateX.interpolate({
        inputRange: [-ACTION_WIDTH, -8, 0],
        outputRange: [1, 0.72, 0],
        extrapolate: 'clamp',
    });
    const actionTranslateX = translateX.interpolate({
        inputRange: [-ACTION_WIDTH, 0],
        outputRange: [0, 18],
        extrapolate: 'clamp',
    });
    const actionOpacity = translateX.interpolate({
        inputRange: [-ACTION_WIDTH, -20, 0],
        outputRange: [1, 0.85, 0.35],
        extrapolate: 'clamp',
    });

    const snapTo = (toValue: number) => {
        offsetRef.current = toValue;
        Animated.timing(translateX, {
            duration: SNAP_DURATION,
            toValue,
            useNativeDriver: true,
        }).start();
    };

    const handleDelete = () => {
        if (disabled || isDeletingRef.current) {
            return;
        }

        isDeletingRef.current = true;
        Animated.sequence([
            Animated.timing(translateX, {
                duration: DELETE_REVEAL_DURATION,
                easing: Easing.out(Easing.cubic),
                toValue: -ACTION_WIDTH,
                useNativeDriver: true,
            }),
            Animated.delay(DELETE_HOLD_DURATION),
            Animated.timing(translateX, {
                duration: DELETE_EXIT_DURATION,
                easing: Easing.out(Easing.cubic),
                toValue: -Math.max(rowWidth, ACTION_WIDTH + 24),
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (!finished) {
                isDeletingRef.current = false;
                return;
            }

            onDelete();
        });
    };

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) => {
                    if (disabled) {
                        return false;
                    }

                    const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) + 4;
                    const isLeftSwipe = gestureState.dx < -4;

                    return isHorizontal && isLeftSwipe;
                },
                onMoveShouldSetPanResponderCapture: (_, gestureState) => {
                    if (disabled) {
                        return false;
                    }

                    const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) + 4;
                    const isLeftSwipe = gestureState.dx < -4;

                    return isHorizontal && isLeftSwipe;
                },
                onPanResponderGrant: () => {
                    translateX.stopAnimation((value) => {
                        offsetRef.current = value;
                    });
                },
                onPanResponderMove: (_, gestureState) => {
                    const nextValue = Math.max(-ACTION_WIDTH, Math.min(0, offsetRef.current + gestureState.dx));
                    translateX.setValue(nextValue);
                },
                onPanResponderRelease: (_, gestureState) => {
                    const currentValue = offsetRef.current + gestureState.dx;
                    const shouldOpen = currentValue <= -OPEN_THRESHOLD;

                    if (shouldOpen) {
                        handleDelete();
                        return;
                    }

                    snapTo(0);
                },
                onPanResponderTerminate: () => {
                    snapTo(0);
                },
                onPanResponderTerminationRequest: () => true,
                onShouldBlockNativeResponder: () => false,
            }),
        [disabled, translateX],
    );

    return (
        <View style={styles.container}>
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.actionLayer,
                    {
                        opacity: revealOpacity,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.deleteAction,
                        {
                            opacity: actionOpacity,
                            transform: [{ translateX: actionTranslateX }],
                        },
                    ]}
                >
                    <Text style={styles.deleteText}>X</Text>
                </Animated.View>
            </Animated.View>

            <Animated.View
                {...panResponder.panHandlers}
                onLayout={(event) => {
                    const nextWidth = event.nativeEvent.layout.width;
                    if (nextWidth > 0 && nextWidth !== rowWidth) {
                        setRowWidth(nextWidth);
                    }
                }}
                style={[
                    styles.card,
                    {
                        shadowOpacity: cardShadowOpacity,
                        opacity: contentOpacity,
                        transform: [{ translateX }, { scale: cardScale }],
                    },
                ]}
            >
                <View style={styles.content}>
                    {children}
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        position: 'relative',
    },
    actionLayer: {
        ...StyleSheet.absoluteFill,
        alignItems: 'stretch',
        backgroundColor: palette.negative,
        borderRadius: radius.card,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    deleteAction: {
        alignItems: 'center',
        alignSelf: 'flex-end',
        borderTopLeftRadius: radius.card,
        borderBottomLeftRadius: radius.card,
        justifyContent: 'center',
        minHeight: 76,
        paddingLeft: spacing.md,
        paddingRight: spacing.lg,
        width: ACTION_WIDTH,
    },
    deleteText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 24,
    },
    card: {
        zIndex: 1,
    },
    content: {
        backgroundColor: palette.background,
        borderRadius: radius.card,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowRadius: 16,
        zIndex: 1,
    },
});
