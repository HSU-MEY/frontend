import { useNavigation } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const navigation = useNavigation();

    return (
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={require('@/assets/images/icons/back.png')}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
                <View style={{ width: 24 }}><Text> </Text></View>
            </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#F7FCFE', // 헤더 배경색과 동일하게
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        //borderBottomWidth: 1,
        //borderBottomColor: '#eee',
        backgroundColor: '#F7FCFE',
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 16,
        fontFamily: 'Pretendard-SemiBold',
        color: '#000',
    },
});
