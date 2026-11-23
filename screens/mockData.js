// In-memory mock data store for offline testing or when backend host is unreachable

export const initialMockUsers = [
    { id: 1, name: 'Vaibhav Sir', bio: 'Course Instructor' },
    { id: 2, name: 'Vaageesh', bio: 'Building React Native Chat App' },
    { id: 3, name: 'Aarav Sharma', bio: 'Mobile App Developer' },
    { id: 4, name: 'Priya Patel', bio: 'UI/UX Designer' },
    { id: 5, name: 'Rohan Verma', bio: 'Full-stack Engineer' },
];

export const initialMockConversations = [
    {
        id: 1,
        name: 'General Discussion',
        createdBy: 1,
        creatorName: 'Vaibhav Sir',
        participants_ids: [1, 2, 3, 4],
    },
    {
        id: 2,
        name: 'Mobile App Project Team',
        createdBy: 2,
        creatorName: 'Vaageesh',
        participants_ids: [2, 3],
    },
    {
        id: 3,
        name: 'Design Reviews',
        createdBy: 4,
        creatorName: 'Priya Patel',
        participants_ids: [2, 4],
    },
];

export const initialMockMessages = {
    1: [
        {
            id: 'm1',
            conversation_id: 1,
            content: 'Welcome to the Chat App demo! Let us know if you have any questions.',
            isMe: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
            id: 'm2',
            conversation_id: 1,
            content: 'Hello everyone! The React Native chat interface is fully loaded.',
            isMe: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
            id: 'm3',
            conversation_id: 1,
            content: 'Great work! Try sending a picture using the camera or gallery attachment below.',
            isMe: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
    ],
    2: [
        {
            id: 'm4',
            conversation_id: 2,
            content: 'Hey Vaageesh, did you update the navigation and search filters?',
            isMe: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
            id: 'm5',
            conversation_id: 2,
            content: 'Yes, pull-to-refresh, user selection badges, and message bubbles are ready.',
            isMe: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        },
    ],
    3: [
        {
            id: 'm6',
            conversation_id: 3,
            content: 'The new UI cards and color theme look really clean!',
            isMe: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
    ],
};

// Global in-memory storage so updates persist across screen navigation in the current app session
let mockConversations = [...initialMockConversations];
let mockUsers = [...initialMockUsers];
let mockMessages = { ...initialMockMessages };

export const getMockConversations = () => [...mockConversations];

export const addMockConversation = (newConv) => {
    mockConversations = [newConv, ...mockConversations];
    return newConv;
};

export const getMockUsers = () => [...mockUsers];

export const getMockMessages = (conversationId) => {
    return mockMessages[conversationId] ? [...mockMessages[conversationId]] : [];
};

export const addMockMessage = (conversationId, message) => {
    if (!mockMessages[conversationId]) {
        mockMessages[conversationId] = [];
    }
    mockMessages[conversationId] = [...mockMessages[conversationId], message];
    return message;
};
