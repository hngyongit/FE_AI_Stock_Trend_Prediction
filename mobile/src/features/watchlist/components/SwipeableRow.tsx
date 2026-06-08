import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Pressable,
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
    resetKey?: string;
};

const ACTION_WIDTH = 112;
const DELETE_ICON_SIZE = 12;
const DELETE_ACTION_WIDTH = 28;
const OPEN_THRESHOLD = ACTION_WIDTH * 0.45;
const DELETE_THRESHOLD_RATIO = 0.78;
const DELETE_REVEAL_DURATION = 220;
const DELETE_EXIT_DURATION = 320;
const DELETE_HOLD_DURATION = 180;
const DEFAULT_ROW_WIDTH = 320;
const MAX_SWIPE_RATIO = 0.72;
const FAST_SWIPE_VELOCITY = -1.6;
const CLOSE_SWIPE_VELOCITY = 1.2;
const OPEN_POSITION = -ACTION_WIDTH;
const OVERSHOOT_DISTANCE = 24;
const RIGHT_RESISTANCE = 0.04;
const LEFT_OVERSHOOT_RESISTANCE = 0.2;
const SPRING_CONFIG = {
    damping: 24,
    mass: 0.9,
    stiffness: 280,
    overshootClamping: false,
    restDisplacementThreshold: 0.5,
    restSpeedThreshold: 0.5,
    useNativeDriver: true,
} as const;

export function SwipeableRow({ children, onDelete, disabled = false, resetKey }: SwipeableRowProps) {
    const [rowWidth, setRowWidth] = useState(DEFAULT_ROW_WIDTH);
    const [isOpen, setIsOpen] = useState(false);
    const [translateX] = useState(() => new Animated.Value(0));
    const offsetRef = useRef(0);
    const isDeletingRef = useRef(false);
    const isOpenRef = useRef(false);
    const cardScale = translateX.interpolate({
        inputRange: [-ACTION_WIDTH * 1.4, 0],
        outputRange: [0.95, 1],
        extrapolate: 'clamp',
    });
    const contentOpacity = translateX.interpolate({
        inputRange: [-ACTION_WIDTH * 1.4, 0],
        outputRange: [0.92, 1],
        extrapolate: 'clamp',
    });
    const revealOpacity = translateX.interpolate({
        inputRange: [-ACTION_WIDTH * 1.4, -20, 0],
        outputRange: [1, 0.86, 0],
        extrapolate: 'clamp',
    });
    const actionTranslateX = translateX.interpolate({
        inputRange: [-rowWidth * DELETE_THRESHOLD_RATIO, -ACTION_WIDTH, -24, 0],
        outputRange: [-Math.max(ACTION_WIDTH * 0.72, rowWidth * 0.22), -28, 10, 24],
        extrapolate: 'clamp',
    });
    const actionOpacity = translateX.interpolate({
        inputRange: [-rowWidth * DELETE_THRESHOLD_RATIO, -ACTION_WIDTH * 0.35, -14, -4, 0],
        outputRange: [1, 1, 1, 0.55, 0],
        extrapolate: 'clamp',
    });
    const actionScale = translateX.interpolate({
        inputRange: [-rowWidth * DELETE_THRESHOLD_RATIO, -ACTION_WIDTH * 0.45, 0],
        outputRange: [1, 1, 0.96],
        extrapolate: 'clamp',
    });
    const backgroundScale = translateX.interpolate({
        inputRange: [-ACTION_WIDTH * 1.4, 0],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        translateX.stopAnimation();
        translateX.setValue(0);
        offsetRef.current = 0;
        isDeletingRef.current = false;
        isOpenRef.current = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(false);
    }, [resetKey, translateX]);

    const snapTo = useCallback((toValue: number) => {
        offsetRef.current = toValue;
        isOpenRef.current = toValue <= OPEN_POSITION + 2;
        setIsOpen(isOpenRef.current);
        Animated.spring(translateX, {
            toValue,
            ...SPRING_CONFIG,
        }).start();
    }, [translateX]);

    const handleDelete = useCallback(() => {
        if (disabled || isDeletingRef.current) {
            return;
        }

        isDeletingRef.current = true;
        const exitDistance = -Math.max(rowWidth + 32, ACTION_WIDTH * 1.8);
        const revealDistance = -Math.max(ACTION_WIDTH * 1.28, rowWidth * DELETE_THRESHOLD_RATIO);

        Animated.sequence([
            Animated.timing(translateX, {
                duration: DELETE_REVEAL_DURATION,
                easing: Easing.out(Easing.cubic),
                toValue: revealDistance,
                useNativeDriver: true,
            }),
            Animated.delay(DELETE_HOLD_DURATION),
            Animated.timing(translateX, {
                duration: DELETE_EXIT_DURATION,
                easing: Easing.in(Easing.cubic),
                toValue: exitDistance,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (!finished) {
                isDeletingRef.current = false;
                return;
            }

            onDelete();
        });
    }, [disabled, onDelete, rowWidth, translateX]);

    /* eslint-disable react-hooks/refs */
    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) => {
                    if (disabled) {
                        return false;
                    }

                    const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) + 4;
                    const isLeftSwipe = gestureState.dx < -4;
                    const isRightToClose = isOpenRef.current && gestureState.dx > 4;

                    return isHorizontal && (isLeftSwipe || isRightToClose);
                },
                onMoveShouldSetPanResponderCapture: (_, gestureState) => {
                    if (disabled) {
                        return false;
                    }

                    const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) + 4;
                    const isLeftSwipe = gestureState.dx < -4;
                    const isRightToClose = isOpenRef.current && gestureState.dx > 4;

                    return isHorizontal && (isLeftSwipe || isRightToClose);
                },
                onPanResponderGrant: () => {
                    translateX.stopAnimation((value) => {
                        offsetRef.current = value;
                    });
                },
                onPanResponderMove: (_, gestureState) => {
                    const maxSwipeDistance = Math.max(ACTION_WIDTH * 1.35, rowWidth * MAX_SWIPE_RATIO);
                    const rawValue = offsetRef.current + gestureState.dx;
                    let nextValue = rawValue;

                    if (rawValue > 0) {
                        nextValue = rawValue * RIGHT_RESISTANCE;
                    } else if (rawValue < -maxSwipeDistance) {
                        const overshoot = rawValue + maxSwipeDistance;
                        nextValue = -maxSwipeDistance + overshoot * LEFT_OVERSHOOT_RESISTANCE;
                    }

                    nextValue = Math.max(
                        -maxSwipeDistance - OVERSHOOT_DISTANCE,
                        Math.min(OVERSHOOT_DISTANCE * RIGHT_RESISTANCE, nextValue),
                    );
                    translateX.setValue(nextValue);
                },
                onPanResponderRelease: (_, gestureState) => {
                    const currentValue = offsetRef.current + gestureState.dx;
                    const projectedValue = currentValue + gestureState.vx * 42;
                    const openThreshold = Math.max(OPEN_THRESHOLD, ACTION_WIDTH * 0.42);
                    const deleteThreshold = Math.max(rowWidth * DELETE_THRESHOLD_RATIO, ACTION_WIDTH * 1.45);
                    const isClosingGesture = isOpenRef.current && (gestureState.dx > 0 || gestureState.vx > 0);
                    const shouldDelete =
                        projectedValue <= -deleteThreshold ||
                        (gestureState.vx <= FAST_SWIPE_VELOCITY && currentValue <= -ACTION_WIDTH * 1.25);

                    if (shouldDelete) {
                        handleDelete();
                        return;
                    }

                    if (isClosingGesture) {
                        snapTo(0);
                        return;
                    }

                    const shouldClose =
                        projectedValue >= -openThreshold * 0.55 ||
                        (gestureState.vx >= CLOSE_SWIPE_VELOCITY && currentValue > OPEN_POSITION * 0.9);

                    if (shouldClose) {
                        snapTo(0);
                        return;
                    }

                    snapTo(OPEN_POSITION);
                },
                onPanResponderTerminate: () => {
                    snapTo(isOpenRef.current ? OPEN_POSITION : 0);
                },
                onPanResponderTerminationRequest: () => true,
                onShouldBlockNativeResponder: () => false,
            }),
        [disabled, handleDelete, rowWidth, snapTo, translateX],
    );
    /* eslint-enable react-hooks/refs */

    return (
        <View style={styles.container}>
            <Animated.View
                pointerEvents={isOpen ? 'auto' : 'none'}
                style={[
                    styles.actionLayer,
                    {
                        opacity: revealOpacity,
                        transform: [{ scaleX: backgroundScale }],
                    },
                ]}
            >
                <Pressable
                    accessibilityLabel="Delete watchlist item"
                    accessibilityRole="button"
                    onPress={handleDelete}
                    style={styles.deleteActionPressable}
                >
                    <Animated.View
                        style={[
                            styles.deleteAction,
                            {
                                opacity: actionOpacity,
                                transform: [{ translateX: actionTranslateX }, { scale: actionScale }],
                            },
                        ]}
                    >
                        <Text style={styles.deleteText}>X</Text>
                    </Animated.View>
                </Pressable>
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
        width: DELETE_ACTION_WIDTH,
    },
    deleteActionPressable: {
        alignItems: 'flex-end',
        flex: 1,
        justifyContent: 'center',
        paddingRight: spacing.md,
    },
    deleteText: {
        color: '#FFFFFF',
        fontSize: DELETE_ICON_SIZE,
        fontWeight: '800',
        letterSpacing: 0.2,
        lineHeight: 14,
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
