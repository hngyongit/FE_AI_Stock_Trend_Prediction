import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Text } from '@/shared/ui';
import { palette, radius, spacing } from '@/shared/design/tokens';

type SwipeableRowProps = {
    children: React.ReactNode;
    onDelete: () => void;
};

function RightAction({
    progress,
    onDelete,
}: {
    progress: SharedValue<number>;
    onDelete: () => void;
}) {
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ scale: progress.value }],
    }));

    return (
        <Animated.View style={[styles.rightActionContainer, animatedStyle]}>
            <Text style={styles.rightActionText} onPress={onDelete}>
                Delete
            </Text>
        </Animated.View>
    );
}

export function SwipeableRow({ children, onDelete }: SwipeableRowProps) {
    const swipeableRef = useRef<SwipeableMethods>(null);

    const handleDelete = () => {
        swipeableRef.current?.close();
        onDelete();
    };

    return (
        <ReanimatedSwipeable
            ref={swipeableRef}
            enableTrackpadTwoFingerGesture
            friction={2}
            rightThreshold={40}
            overshootRight={false}
            renderRightActions={(progress) => (
                <RightAction progress={progress} onDelete={handleDelete} />
            )}
        >
            {children}
        </ReanimatedSwipeable>
    );
}

const styles = StyleSheet.create({
    rightActionContainer: {
        alignItems: 'center',
        backgroundColor: palette.negative,
        borderRadius: radius.card,
        justifyContent: 'center',
        marginVertical: spacing.xs,
        width: 80,
    },
    rightActionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});
