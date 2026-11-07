import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { API_BASE_URL, AUTH_HEADER } from './config';

const AllUsers = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [chatType, setChatType] = useState('DM'); // 'DM' or 'GROUP'
    const [convoName, setConvoName] = useState('');
    const [creating, setCreating] = useState(false);

    const fetchUsers = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/user`, {
                headers: {
                    'Authorization': AUTH_HEADER
                }
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            const list = Array.isArray(data) ? data : (data.data || []);
            setUsers(list);
        } catch (err) {
            setError(err.message || 'Failed to load users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const toggleSelectUser = (userId) => {
        if (chatType === 'DM') {
            // In DM mode, selecting a user replaces the selection
            setSelectedUsers((prev) => (prev.includes(userId) ? [] : [userId]));
        } else {
            // In Group mode, toggle selection
            setSelectedUsers((prev) =>
                prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
            );
        }
    };

    const startNewConversation = async () => {
        if (selectedUsers.length === 0) {
            Alert.alert('Selection Required', 'Please select at least one user to start a conversation.');
            return;
        }

        if (chatType === 'GROUP' && !convoName.trim()) {
            Alert.alert('Group Name Required', 'Please provide a name for the group.');
            return;
        }

        setCreating(true);
        try {
            const defaultName = chatType === 'DM'
                ? (users.find((u) => u.id === selectedUsers[0])?.name || 'Direct Message')
                : convoName.trim();

            const response = await fetch(`${API_BASE_URL}/conversation`, {
                method: 'POST',
                headers: {
                    'Authorization': AUTH_HEADER,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: chatType,
                    name: defaultName,
                    participants_ids: selectedUsers
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create conversation');
            }

            Alert.alert('Success', 'Conversation created successfully!', [
                {
                    text: 'Open Chats',
                    onPress: () => {
                        setSelectedUsers([]);
                        setConvoName('');
                        navigation.navigate('Conversations');
                    }
                }
            ]);
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to create conversation');
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        const name = (u.name || '').toLowerCase();
        const bio = (u.bio || '').toLowerCase();
        const q = searchQuery.toLowerCase().trim();
        return name.includes(q) || bio.includes(q);
    });

    const getInitial = (name) => {
        return (name && name.length > 0) ? name[0].toUpperCase() : 'U';
    };

    return (
        <View style={styles.container}>
            {/* Top Controls: Chat Type Selector & Group Name */}
            <View style={styles.headerControlSection}>
                <View style={styles.typeSelectorRow}>
                    <TouchableOpacity
                        style={[styles.typeButton, chatType === 'DM' && styles.typeButtonActive]}
                        onPress={() => {
                            setChatType('DM');
                            if (selectedUsers.length > 1) {
                                setSelectedUsers(selectedUsers.slice(0, 1));
                            }
                        }}
                    >
                        <Text style={[styles.typeButtonText, chatType === 'DM' && styles.typeButtonTextActive]}>
                            👤 Direct Message (DM)
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.typeButton, chatType === 'GROUP' && styles.typeButtonActive]}
                        onPress={() => setChatType('GROUP')}
                    >
                        <Text style={[styles.typeButtonText, chatType === 'GROUP' && styles.typeButtonTextActive]}>
                            👥 Group Chat
                        </Text>
                    </TouchableOpacity>
                </View>

                {chatType === 'GROUP' && (
                    <TextInput
                        style={styles.groupNameInput}
                        placeholder="Enter group name..."
                        placeholderTextColor="#888"
                        value={convoName}
                        onChangeText={setConvoName}
                    />
                )}

                <View style={styles.actionRow}>
                    <Text style={styles.selectedCountText}>
                        Selected: <Text style={styles.selectedCountBold}>{selectedUsers.length}</Text> user(s)
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.createButton,
                            (selectedUsers.length === 0 || creating) && styles.createButtonDisabled
                        ]}
                        onPress={startNewConversation}
                        disabled={selectedUsers.length === 0 || creating}
                    >
                        {creating ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.createButtonText}>Create Chat 🚀</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Search users..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                        <Text style={styles.clearBtnText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.statusText}>Loading users...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => fetchUsers()}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.userList}
                    contentContainerStyle={styles.userListContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchUsers(true)}
                            colors={['#007AFF']}
                        />
                    }
                >
                    {filteredUsers.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>👤</Text>
                            <Text style={styles.emptyTitle}>No users found</Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery ? 'Try a different search keyword' : 'No users available on server.'}
                            </Text>
                        </View>
                    ) : (
                        filteredUsers.map((item) => {
                            const isSelected = selectedUsers.includes(item.id);
                            const initial = getInitial(item.name);

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.userCard, isSelected && styles.userCardSelected]}
                                    activeOpacity={0.7}
                                    onPress={() => toggleSelectUser(item.id)}
                                >
                                    <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                                        <Text style={styles.avatarText}>{initial}</Text>
                                    </View>

                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{item.name || 'Anonymous'}</Text>
                                        <Text style={styles.userBio} numberOfLines={1}>
                                            {item.bio || 'Available'}
                                        </Text>
                                    </View>

                                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA'
    },
    headerControlSection: {
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE'
    },
    typeSelectorRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#F1F3F5',
        borderWidth: 1,
        borderColor: '#E9ECEF'
    },
    typeButtonActive: {
        backgroundColor: '#E7F1FF',
        borderColor: '#007AFF'
    },
    typeButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#495057'
    },
    typeButtonTextActive: {
        color: '#007AFF'
    },
    groupNameInput: {
        height: 42,
        backgroundColor: '#F1F3F5',
        borderRadius: 8,
        paddingHorizontal: 14,
        fontSize: 14,
        color: '#212529',
        marginBottom: 10
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    selectedCountText: {
        fontSize: 13,
        color: '#6C757D'
    },
    selectedCountBold: {
        fontWeight: 'bold',
        color: '#007AFF'
    },
    createButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 8
    },
    createButtonDisabled: {
        backgroundColor: '#B0D5FF'
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE'
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#F1F3F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#212529'
    },
    clearBtn: {
        paddingHorizontal: 8
    },
    clearBtnText: {
        color: '#888',
        fontSize: 16,
        fontWeight: 'bold'
    },
    userList: {
        flex: 1
    },
    userListContent: {
        paddingVertical: 8
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 12,
        marginVertical: 4,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1
    },
    userCardSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#F0F7FF'
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#6C757D',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    avatarSelected: {
        backgroundColor: '#007AFF'
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    userInfo: {
        flex: 1
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 3
    },
    userBio: {
        fontSize: 13,
        color: '#6C757D'
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#CED4DA',
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkboxSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF'
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold'
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
        paddingTop: 80,
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
        marginBottom: 6
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#868E96',
        textAlign: 'center'
    }
});

export default AllUsers;
