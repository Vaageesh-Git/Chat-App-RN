import React, { useState } from 'react';
import { Image, View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen() {
    const [imageUri, setImageUri] = useState(null);

    const takePhotoWithCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                'Permission Denied',
                'Camera access is required to take photos.'
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            allowsMultipleSelection: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Camera Photo Capture</Text>
            <Text style={styles.subtitle}>Take live photos directly from device camera</Text>

            <TouchableOpacity style={styles.captureButton} onPress={takePhotoWithCamera}>
                <Text style={styles.captureButtonText}>📷 Open Camera & Take Photo</Text>
            </TouchableOpacity>

            {imageUri ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                    <TouchableOpacity style={styles.retakeButton} onPress={() => setImageUri(null)}>
                        <Text style={styles.retakeButtonText}>Discard & Retake</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.placeholderBox}>
                    <Text style={styles.placeholderText}>No photo taken yet</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212529',
        marginTop: 20,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#6C757D',
        textAlign: 'center',
        marginBottom: 24,
    },
    captureButton: {
        backgroundColor: '#28A745',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginBottom: 24,
    },
    captureButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    previewContainer: {
        alignItems: 'center',
    },
    image: {
        width: 260,
        height: 260,
        borderRadius: 12,
        marginBottom: 16,
    },
    retakeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    retakeButtonText: {
        color: '#DC3545',
        fontWeight: '600',
    },
    placeholderBox: {
        width: 260,
        height: 260,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#CED4DA',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#ADB5BD',
        fontSize: 15,
    },
});
