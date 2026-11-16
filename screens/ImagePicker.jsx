import React, { useState } from 'react';
import { Button, View, Alert, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ImagePickerScreen = () => {
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Media Gallery Picker</Text>
            <Text style={styles.subtitle}>Select photos from your device storage to attach</Text>

            <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
                <Text style={styles.pickButtonText}>🖼️ Choose Image from Library</Text>
            </TouchableOpacity>

            {image ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: image }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.clearButton} onPress={() => setImage(null)}>
                        <Text style={styles.clearButtonText}>Remove Image</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.placeholderBox}>
                    <Text style={styles.placeholderText}>No image selected</Text>
                </View>
            )}
        </View>
    );
};

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
    pickButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        marginBottom: 24,
    },
    pickButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    previewContainer: {
        alignItems: 'center',
    },
    previewImage: {
        width: 260,
        height: 260,
        borderRadius: 12,
        marginBottom: 16,
    },
    clearButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    clearButtonText: {
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

export default ImagePickerScreen;
