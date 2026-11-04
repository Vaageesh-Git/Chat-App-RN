import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConversationScreen from './ConversationScreen';
import ChatScreen from './ChatScreen';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
    return (
        <Stack.Navigator
            initialRouteName="Conversation"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                },
                headerTintColor: '#007AFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: '#212529',
                },
                headerShadowVisible: true,
            }}
        >
            <Stack.Screen
                name="Conversation"
                component={ConversationScreen}
                options={{
                    headerTitle: 'Messages',
                }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={({ route }) => ({
                    headerTitle: route.params?.data?.name || 'Chat',
                    headerBackTitle: 'Back',
                })}
            />
        </Stack.Navigator>
    );
};

export default StackNavigation;
