import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { API_BASE_URL, AUTH_HEADER } from './config';

const ConversationScreen = ({ navigation }) => {
    const [conversations, setConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchConversations = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/conversation`, {
                method: 'GET',
                headers: {
                    'Authorization': AUTH_HEADER
                }
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            const list = Array.isArray(data) ? data : (data.data || []);

            // Fetch creator names for each conversation
            const populated = await Promise.all(
                list.map(async (conv) => {
                    if (!conv.createdBy) {
                        return { ...conv, creatorName: 'Unknown' };
                    }
                    try {
                        const userRes = await fetch(`${API_BASE_URL}/user/profile?user_id=${conv.createdBy}`, {
                            headers: { 'Authorization': AUTH_HEADER }
                        });
                        if (userRes.ok) {
                            const u = await userRes.json();
                            return { ...conv, creatorName: u.name || 'User' };
                        }
                    } catch (e) {
                        console.log('Error fetching creator profile', e);
                    }
                    return { ...conv, creatorName: `User #${conv.createdBy}` };
                })
            );

            setConversations(populated);
        } catch (err) {
            setError(err.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const filteredConversations = conversations.filter(c => {
        const title = (c.name || 'Conversation').toLowerCase();
        const creator = (c.creatorName || '').toLowerCase();
        const q = searchQuery.toLowerCase().trim();
        return title.includes(q) || creator.includes(q);
    });

    const getInitial = (name) => {
        return (name && name.length > 0) ? name[0].toUpperCase() : 'C';
    };

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Search conversations..."
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
                    <Text style={styles.statusText}>Loading conversations...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => fetchConversations()}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollList}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchConversations(true)}
                            colors={['#007AFF']}
                        />
                    }
                >
                    {filteredConversations.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>💬</Text>
                            <Text style={styles.emptyTitle}>No Conversations Found</Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery ? 'Try a different search term' : 'Head over to the Users tab to start a new chat!'}
                            </Text>
                        </View>
                    ) : (
                        filteredConversations.map((item, index) => {
                            const displayName = item.name || 'General Chat';
                            const initial = getInitial(displayName);
                            return (
                                <TouchableOpacity
                                    key={item.id || index}
                                    style={styles.card}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        navigation.navigate('Chat', {
                                            data: {
                                                name: displayName,
                                                conversationId: item.id,
                                                participants: item.participants_ids || []
                                            }
                                        });
                                    }}
                                >
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{initial}</Text>
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardTitle} numberOfLines={1}>{displayName}</Text>
                                        <Text style={styles.cardSubtitle} numberOfLines={1}>
                                            Created by: {item.creatorName || 'Unknown'}
                                        </Text>
                                    </View>
                                    <Text style={styles.chevron}>›</Text>
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
    scrollList: {
        flex: 1
    },
    scrollContent: {
        paddingVertical: 8
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginHorizontal: 12,
        marginVertical: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold'
    },
    cardInfo: {
        flex: 1
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 4
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#6C757D'
    },
    chevron: {
        fontSize: 22,
        color: '#CED4DA',
        fontWeight: '600',
        marginLeft: 8
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
        textAlign: 'center',
        lineHeight: 20
    }
});

export default ConversationScreen;
