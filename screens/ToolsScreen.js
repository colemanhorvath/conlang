import React, { useLayoutEffect } from 'react';
import { Text, View, Button, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import { save } from '../reference/Storage';

// TOOLS is the data used to populate the Tool Button FlatList
const TOOLS = [{ name: 'Phonology', key: 'phonology' }, { name: 'Phonotactics', key: 'phonotactics' }, { name: 'Lexicon', key: 'lexicon' }]

function ToolsScreen({ route, navigation }) {
  const { key, title, description } = route.params;

  // This Effect creates a Save button in the navigation bar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            save(key, route.params);
            Alert.alert(
              'Saved',
              'Conlang saved successfully'
            )
          }} >
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      )
    }, [navigation])
  })

  // An Item is a button that leads to a specific tool screen
  // name: The name of the specific tool screen
  const Item = ({ name }) => {
    return (
      <TouchableOpacity
        style={styles.toolButton}
        onPress={() => navigation.push(name, route.params)}>
        <Text style={styles.buttonText}>{name}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <FlatList
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columns}
        numColumns={2}
        data={TOOLS}
        renderItem={({ item }) => <Item name={item.name} />} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  toolButton: {
    borderRadius: 20,
    width: 140,
    height: 140,
    margin: 10,
    backgroundColor: 'white',
    shadowOpacity: 0.75,
    shadowRadius: 3,
    shadowColor: 'black',
    shadowOffset: { height: 2, width: 2 },
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 6
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'mediumaquamarine'
  },
  columns: {
    justifyContent: 'space-around'
  },
  list: {
  },
  saveButton: {
    color: 'white',
    fontSize: 18,
    padding: 4
  },
  title: {
    color: 'mediumaquamarine',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  description: {
    fontStyle: 'italic',
    alignSelf: 'center'
  }
})

export default ToolsScreen;