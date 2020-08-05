import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import ConlangsScreen from './screens/ConlangsScreen';
import ToolsScreen from './screens/ToolsScreen';
import PhonologyScreen from './screens/PhonologyScreen';
import PhonotacticsScreen from './screens/PhonotacticsScreen';
import SyllableScreen from './screens/SyllableScreen';
import LexiconScreen from './screens/LexiconScreen';

const Stack = createStackNavigator();

function StackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'mediumaquamarine'
        },
        headerTintColor: 'white'
      }}>
      <Stack.Screen
        name="Conlangs"
        component={ConlangsScreen} />
      <Stack.Screen
        name="Tools"
        component={ToolsScreen} />
      <Stack.Screen
        name="Phonology"
        component={PhonologyScreen} />
      <Stack.Screen
        name='Phonotactics'
        component={PhonotacticsScreen} />
      <Stack.Screen
        name='Syllable'
        component={SyllableScreen} />
      <Stack.Screen
        name='Lexicon'
        component={LexiconScreen} />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <StackScreen />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
