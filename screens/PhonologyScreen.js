import React, { useState, useLayoutEffect, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Button, SafeAreaView, Alert } from 'react-native';
import { save } from '../reference/Storage';
import { SOUNDS } from '../reference/Sounds';
import { FlatList } from 'react-native-gesture-handler';

function PhonologyScreen({ route, navigation }) {
  const { key, title, description, inventory } = route.params;

  const [inv, setInv] = useState(inventory.toString());

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

  //addSound(symbol) adds string symbol to the inventory array if not already there
  const addSound = (symbol) => {
    if (!inventory.includes(symbol)) {
      inventory.push(symbol);
      setInv(inventory.toString());
    }
  }

  //removeSound(symbol) removes string symbol from the inventory array if present
  const removeSound = (symbol) => {
    const symbolIndex = inventory.indexOf(symbol)
    if (symbolIndex != -1) {
      inventory.splice(symbolIndex, 1);
      setInv(inventory.toString());
    }
  }

  // soundButtonPressed(symbol) removes string symbol from the inventory if present
  // otherwise it adds symbol to the inventory
  const soundButtonPressed = (symbol) => {
    const isPressed = inventory.includes(symbol);
    if (isPressed) {
      removeSound(symbol);
    }
    else {
      addSound(symbol);
    }
  }

  //clearInv() resets the inventory to containing no symbols
  const clearInv = () => {
    navigation.setParams({ inventory: [] });
    setInv('');
  }

  // An Item is a button that adds or removes its symbol to the inventory
  // symbol: the string that this button adds or removes from the inventory
  function Item({ symbol }) {
    return (
      <TouchableOpacity
        style={inv.includes(symbol) ? styles.pressedButton : styles.unpressedButton}
        onPress={() => soundButtonPressed(symbol)}>
        <Text style={inv.includes(symbol) ? styles.pressedSymbol : styles.unpressedSymbol}>{symbol}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView>
      <Text style={styles.title}>{title}</Text>
      <View
        style={styles.invAndClear}>
        <Text style={styles.inventoryTitle}>Current Inventory:</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => clearInv()}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.inventory}>{inv}</Text>
      <SafeAreaView
        style={styles.list}>
        <FlatList
          columnWrapperStyle={styles.columns}
          data={SOUNDS}
          renderItem={({ item }) => <Item symbol={item.symbol} />}
          horizontal={false}
          numColumns={5}
          keyExtractor={(item) => item.symbol} />
      </SafeAreaView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  title: {
    color: 'mediumaquamarine',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  inventoryTitle: {
    color: 'mediumaquamarine',
    fontSize: 18,
    fontWeight: 'bold'
  },
  inventory: {
    color: 'black',
    fontSize: 16,
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginRight: 5
  },
  clearText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold'
  },
  invAndClear: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  list: {
    marginBottom: 120
  },
  columns: {
    justifyContent: 'space-around'
  },
  unpressedButton: {
    height: 50,
    width: 50,
    backgroundColor: 'white',
    shadowOpacity: 0.75,
    shadowRadius: 3,
    shadowColor: 'black',
    shadowOffset: { height: 2, width: 2 },
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3
  },
  pressedButton: {
    height: 50,
    width: 50,
    backgroundColor: 'mediumaquamarine',
    shadowOpacity: 0.75,
    shadowRadius: 3,
    shadowColor: 'black',
    shadowOffset: { height: 2, width: 2 },
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3
  },
  saveButton: {
    color: 'white',
    fontSize: 18,
    padding: 4
  },
  unpressedSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'mediumaquamarine'
  },
  pressedSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  }
})

export default PhonologyScreen;