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
import Storage, { load, save } from './reference/Storage';

const Stack = createStackNavigator();

// Master key used to retrieve the saved conlangs and their respective keys
const MASTERKEY = 'conlangs';
// Key used to retrieve the last used key to find a new key
const KEYOFKEYS = 'keyofkeys';
//Key used to check if this is a new device
const NEWUSER = 'newuser';

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
  let newUser = load(NEWUSER);
  newUser.then((result) => {
    if (result == undefined) {
      save(MASTERKEY, []);
      save(KEYOFKEYS, '-1');
      save(NEWUSER, 'False');
    }
  });
  let key = load(KEYOFKEYS);
  let langsList = load(MASTERKEY);

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
