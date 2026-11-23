import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    ActivityIndicator,
    Alert,
    RefreshControl,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, AUTH_HEADER, ENABLE_MOCK_FALLBACK } from './config';
import { getMockMessages, addMockMessage } from './mockData';

const ChatScreen = ({ navigation, route }) => {
    const conversationId = route.params?.data?.conversationId || 1;
    const conversationName = route.params?.data?.name || 'Chat';
    const participants = route.params?.data?.participants || [];

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [currentMessage, setCurrentMessage] = useState('');
    const [participantsName, setParticipantsName] = useState([]);
    const [pendingImage, setPendingImage] = useState(null);
    const [sending, setSending] = useState(false);

    const scrollViewRef = useRef(null);

    const fetchMessages = async (isRefresh = false) => {
        if (!conversationId) return;
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError('');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const response = await fetch(`${API_BASE_URL}/message?conversation_id=${conversationId}`, {
                headers: {
                    'Authorization': AUTH_HEADER
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            const messageList = Array.isArray(data) ? data : (data.data || []);
            setMessages(messageList);
        } catch (err) {
            console.log('Error fetching messages, checking fallback:', err.message);
            if (ENABLE_MOCK_FALLBACK) {
                setMessages(getMockMessages(conversationId));
            } else {
                setError(err.message || 'Failed to load messages');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchParticipants = async () => {
        if (!participants || participants.length === 0) {
            setParticipantsName(['Vaibhav Sir', 'Vaageesh']);
            return;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const promises = participants.map(async (userId) => {
                const res = await fetch(`${API_BASE_URL}/user/profile?user_id=${userId}`, {
                    headers: { 'Authorization': AUTH_HEADER },
                    signal: controller.signal
                });
                if (res.ok) {
                    const u = await res.json();
                    return u.name || `User ${userId}`;
                }
                return `User ${userId}`;
            });

            const names = await Promise.all(promises);
            clearTimeout(timeoutId);
            setParticipantsName(names);
        } catch (e) {
            setParticipantsName(['Vaibhav Sir', 'Vaageesh', 'Team']);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchParticipants();
    }, [conversationId]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const sendMessage = async () => {
        const textToSend = currentMessage.trim();
        if (!textToSend && !pendingImage) return;

        setSending(true);

        const imageToSend = pendingImage ? pendingImage.base64Uri : null;

        // Optimistic UI message object
        const tempMsg = {
            id: `msg-${Date.now()}`,
            conversation_id: conversationId,
            content: textToSend,
            imageInfo: imageToSend,
            isMe: true,
            createdAt: new Date().toISOString()
        };

        setMessages((prev) => [...prev, tempMsg]);
        setCurrentMessage('');
        setPendingImage(null);

        // Save to mock store
        addMockMessage(conversationId, tempMsg);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const payload = {
                conversation_id: conversationId,
                content: textToSend || (imageToSend ? '[Image]' : ''),
            };

            if (imageToSend) {
                payload.imageInfo = imageToSend;
            }

            const response = await fetch(`${API_BASE_URL}/message`, {
                method: 'POST',
                headers: {
                    'Authorization': AUTH_HEADER,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                await fetchMessages(true);
            }
        } catch (e) {
            console.log('Message sent locally (backend unreachable):', e.message);
        } finally {
            setSending(false);
        }
    };

    const pickImageFromGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access media library is required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const base64Uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
            setPendingImage({
                uri: asset.uri,
                base64Uri: base64Uri
            });
        }
    };

    const takePhotoWithCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to use camera is required.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const base64Uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
            setPendingImage({
                uri: asset.uri,
                base64Uri: base64Uri
            });
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) {
            const now = new Date();
            return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        }
        try {
            const d = new Date(dateString);
            return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
        } catch {
            return '';
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Participants Info Banner */}
            {participantsName.length > 0 && (
                <View style={styles.participantsBanner}>
                    <Text style={styles.participantsText} numberOfLines={1}>
                        👥 {participantsName.join(', ')}
                    </Text>
                </View>
            )}

            {/* Messages Scroll Area */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.statusText}>Loading conversation...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => fetchMessages()}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messageList}
                    contentContainerStyle={styles.messageListContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchMessages(true)}
                            colors={['#007AFF']}
                        />
                    }
                >
                    {messages.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>👋</Text>
                            <Text style={styles.emptyTitle}>No messages yet</Text>
                            <Text style={styles.emptySubtitle}>Say hello to start the conversation!</Text>
                        </View>
                    ) : (
                        messages.map((item, index) => {
                            const hasImage = item.imageInfo;
                            const textContent = item.content || item.text || item.message;
                            const isMe = item.isMe !== undefined ? item.isMe : (index % 2 === 1);
                            const time = formatTime(item.createdAt || item.timestamp);

                            return (
                                <View
                                    key={item.id || index}
                                    style={[
                                        styles.messageRow,
                                        isMe ? styles.messageRowMe : styles.messageRowOther
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.bubble,
                                            isMe ? styles.bubbleMe : styles.bubbleOther
                                        ]}
                                    >
                                        {hasImage ? (
                                            <Image
                                                source={{ uri: item.imageInfo }}
                                                style={styles.messageImage}
                                                resizeMode="cover"
                                            />
                                        ) : null}

                                        {textContent ? (
                                            <Text
                                                style={[
                                                    styles.messageText,
                                                    isMe ? styles.messageTextMe : styles.messageTextOther
                                                ]}
                                            >
                                                {textContent}
                                            </Text>
                                        ) : null}

                                        <Text
                                            style={[
                                                styles.timeText,
                                                isMe ? styles.timeTextMe : styles.timeTextOther
                                            ]}
                                        >
                                            {time}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}

            {/* Pending Image Attachment Preview */}
            {pendingImage && (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: pendingImage.uri }} style={styles.previewImage} />
                    <View style={styles.previewInfo}>
                        <Text style={styles.previewTitle}>Image Ready to Send</Text>
                        <Text style={styles.previewSubtitle}>Press Send or cancel below</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.cancelImageButton}
                        onPress={() => setPendingImage(null)}
                    >
                        <Text style={styles.cancelImageText}>✕</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Input Footer */}
            <View style={styles.inputContainer}>
                <TouchableOpacity
                    style={styles.attachButton}
                    onPress={pickImageFromGallery}
                    title="Gallery"
                >
                    <Text style={styles.attachIcon}>🖼️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.attachButton}
                    onPress={takePhotoWithCamera}
                    title="Camera"
                >
                    <Text style={styles.attachIcon}>📷</Text>
                </TouchableOpacity>

                <TextInput
                    style={styles.textInput}
                    placeholder="Type a message..."
                    placeholderTextColor="#888"
                    value={currentMessage}
                    onChangeText={setCurrentMessage}
                    multiline
                />

                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!currentMessage.trim() && !pendingImage) || sending ? styles.sendButtonDisabled : {}
                    ]}
                    onPress={sendMessage}
                    disabled={(!currentMessage.trim() && !pendingImage) || sending}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.sendButtonText}>Send</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB'
    },
    participantsBanner: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE'
    },
    participantsText: {
        fontSize: 13,
        color: '#6C757D',
        fontWeight: '500'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    statusText: {
        marginTop: 12,
        fontSize: 15,
        color: '#6C757D'
    },
    errorText: {
        fontSize: 15,
        color: '#DC3545',
        textAlign: 'center',
        marginBottom: 16
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600'
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 32
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#343A40',
        marginBottom: 4
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#868E96',
        textAlign: 'center'
    },
    messageList: {
        flex: 1
    },
    messageListContent: {
        paddingHorizontal: 14,
        paddingVertical: 12
    },
    messageRow: {
        marginVertical: 4,
        flexDirection: 'row'
    },
    messageRowMe: {
        justifyContent: 'flex-end'
    },
    messageRowOther: {
        justifyContent: 'flex-start'
    },
    bubble: {
        maxWidth: '78%',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1
    },
    bubbleMe: {
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4
    },
    bubbleOther: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20
    },
    messageTextMe: {
        color: '#FFFFFF'
    },
    messageTextOther: {
        color: '#212529'
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginBottom: 6
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end'
    },
    timeTextMe: {
        color: 'rgba(255, 255, 255, 0.7)'
    },
    timeTextOther: {
        color: '#868E96'
    },
    previewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E7F1FF',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#CCE0FF'
    },
    previewImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10
    },
    previewInfo: {
        flex: 1
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#004085'
    },
    previewSubtitle: {
        fontSize: 12,
        color: '#004085'
    },
    cancelImageButton: {
        padding: 8
    },
    cancelImageText: {
        fontSize: 18,
        color: '#004085',
        fontWeight: 'bold'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE'
    },
    attachButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    attachIcon: {
        fontSize: 22
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: '#F1F3F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#212529',
        marginHorizontal: 6
    },
    sendButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sendButtonDisabled: {
        backgroundColor: '#B0D5FF'
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600'
    }
});

export default ChatScreen;
