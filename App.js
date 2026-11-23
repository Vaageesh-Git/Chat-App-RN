import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import StackNavigation from './screens/Stack';
import AllUsers from './screens/AllUsers';
import CameraScreen from './screens/CameraScreen';
import ImagePickerScreen from './screens/ImagePicker';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          initialRouteName="Conversations"
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabBarLabel,
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Conversations"
            component={StackNavigation}
            options={{
              tabBarLabel: 'Chats',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size - 4, color }}>💬</Text>
              ),
            }}
          />
          <Tab.Screen
            name="AllUsers"
            component={AllUsers}
            options={{
              headerShown: true,
              headerTitle: 'Find Users & New Chat',
              tabBarLabel: 'New Chat',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size - 4, color }}>👥</Text>
              ),
            }}
          />
          <Tab.Screen
            name="CameraScreen"
            component={CameraScreen}
            options={{
              headerShown: true,
              headerTitle: 'Camera Capture',
              tabBarLabel: 'Camera',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size - 4, color }}>📷</Text>
              ),
            }}
          />
          <Tab.Screen
            name="ImagePickerScreen"
            component={ImagePickerScreen}
            options={{
              headerShown: true,
              headerTitle: 'Media Gallery',
              tabBarLabel: 'Gallery',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size - 4, color }}>🖼️</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
