// components/TicketCard.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ClippedImage from './ClippedImage';

interface TicketCardProps {
    title: string;
    location: string;
    startDate: string;
    progress: number;
    imageSource: any; // 공연 이미지
    onDelete?: () => void; // 삭제 콜백 (선택적)
}

export default function TicketCard({
    title,
    location,
    startDate,
    progress,
    imageSource,
    onDelete,
}: TicketCardProps) {
    return (
        <ImageBackground
            source={require('@/assets/images/ticket-frame.png')}
            style={styles.container}
            imageStyle={{ resizeMode: 'stretch' }} // 이미지 프레임 늘려서 꽉 채움
        >
            <View style={styles.content}>
                {/* 왼쪽 이미지 */}
                <ClippedImage
                    source={imageSource}
                    width={115}
                    height={90}
                />

                {/* 오른쪽 텍스트 영역 */}
                <View style={styles.info}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.location}>{location}</Text>
                    <Text style={styles.date}>{startDate} ~</Text>
                    <Text style={styles.progressText}>진행도 {progress}%</Text>

                    <View style={styles.progressBar}>
                        <LinearGradient
                            colors={['#53BDFF', '#0080FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${progress}%` }]}
                        />
                    </View>
                </View>

                {onDelete ? (
                    <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                        <Image
                            source={require('@/assets/images/icons/delete.png')}
                            style={styles.deleteIcon}
                        />
                    </TouchableOpacity>
                ) : null}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 100,
        width: 324,
        marginHorizontal: 0,
        marginVertical: 0,
        padding: 0,
    },
    content: {
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center',
    },
    leftImage: {
        width: 120,
        height: '100%',
        resizeMode: 'cover',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
        //backgroundColor: 'black',
        marginHorizontal: 14,
        marginVertical: 10
    },
    title: {
        fontSize: 14,
        fontFamily: 'Pretendard-SemiBold'
    },
    location: {
        fontSize: 12,
        color: '#333333',
        fontFamily: 'Pretendard-Medium'
    },
    date: {
        fontSize: 11,
        color: '#333333',
        fontFamily: 'Pretendard-Medium'
    },
    progressText: {
        fontSize: 11,
        color: '#333333',
        fontFamily: 'Pretendard-Medium',
        marginTop: 4
    },
    progressBar: {
        height: 8,
        width: 140,
        backgroundColor: '#eee',
        borderRadius: 100,
        marginTop: 1,
        overflow: 'hidden',
    },
    progressFill: {
        height: 8,
        //backgroundColor: '#3B82F6',
        borderRadius: 1000
    },
    deleteButton: {
        width: 40,
        height: 92,
        marginRight: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteIcon: {
        width: '100%',
        height: '100%',
        //borderRadius: 5
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5
    },
    deleteText: {
        fontSize: 10,
        color: '#888',
    },
});
