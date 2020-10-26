import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, Button, Text, View, AsyncStorage, Modal, StyleSheet, Platform, Alert } from 'react-native';
import { TouchableOpacity, TouchableHighlight, TextInput } from 'react-native-gesture-handler';
import { getSoundsWithProperties } from '../reference/Sounds';
import { save, load, remove } from '../reference/Storage';




// Master key used to retrieve the saved conlangs and their respective keys
const MASTERKEY = 'conlangs';
// Key used to retrieve the last used key to find a new key
const KEYOFKEYS = 'keyofkeys';


// An Item is one element of the list of conlangs
// title: String name of the conlang
// description: String description of the conlang
function Item({ title, description }) {
  return (
    <SafeAreaView style={styles.conlangInfo} >
      <Text style={styles.conlangName}>{title}</Text>
      <Text>{description}</Text>
    </SafeAreaView>
  );
}

function ConlangsScreen({ navigation }) {

  // initState() retrieves the conlang names, descriptions, and keys
  // Then it retrieves the last used key
  // The state is updated with this data.
  const initState = () => {
    let loadedLangs = load(MASTERKEY);
    loadedLangs.then((result) => {
      if (result !== undefined) {
        setLangsList(result);
      }
    }, (error) => console.log(error));

    let loadedKey = load(KEYOFKEYS);
    loadedKey.then((result) => {
      if (result !== undefined) {
        setLastKey(result);
      }
    }, (error) => console.log(error));
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [currentKey, setCurrentKey] = useState('-1');
  const [lastKey, setLastKey] = useState('-1');
  const [langsList, setLangsList] = useState([]);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [nameIsFocused, setNameIsFocused] = useState(false);
  const [descIsFocused, setDescIsFocused] = useState(false);


  // initialize the state if it's the first render
  if (isFirstRender) {
    setIsFirstRender(false);
    initState();
  }

  // loadLang(k) loads the data of the conlang with key k
  // Then it opens the Tools screen with that data
  const loadLang = (k) => {
    let loaded = load(k);
    loaded.then((result) => navigation.push('Tools', result), (error) => console.log(error));
  }

  // generateKey() is a new unique string key.
  // Updates lastKey and the data stored by KEYOFKEYS
  const generateKey = () => {
    let intK = parseInt(lastKey);
    let newIntK = intK + 1;
    let newK = newIntK.toString();
    save(KEYOFKEYS, newK);
    setLastKey(newK);
    return newK;
  }

  // createNewLang() adds a new language to the langsList
  // The data is taken from the input fields in the modal
  // A new key is generated for this conlang
  // Also the blank template of a new language is stored with the initial data
  const createNewLang = () => {
    let newKey = generateKey();
    console.log(newKey);
    langsList.push({
      key: newKey,
      title: titleInput,
      description: descriptionInput
    })
    save(newKey, {
      key: newKey,
      title: titleInput,
      description: descriptionInput,
      inventory: [],
      sylStructure: ['', '', ''],
      sylStructures: [
        {
          key: 'o',
          title: "Onsets",
          data: [],
          canHaveNullStruct: 'true'
        },
        {
          key: 'n',
          title: "Nuclei",
          data: [],
          canHaveNullStruct: 'true'
        },
        {
          key: 'c',
          title: "Codas",
          data: [],
          canHaveNullStruct: 'true'
        }
      ],
      lexicon: [],
      lastLexKey: {
        lastKey: '0'
      },
      lexiconIsSortedByEnglish: false
    });
    save(MASTERKEY, langsList);
  }

  // updateCurrentLang(isBeingDeleted) deletes the data of the currently selected conlang if isBeingDeleted
  // otherwise, the language data is updated and saved to AsyncStorage
  const updateCurrentLang = (isBeingDeleted) => {
    let i = langsList.findIndex((e) => currentKey === e.key);
    if (isBeingDeleted) {
      langsList.splice(i, 1);
      remove(currentKey);
    } else {
      langsList[i] = {
        key: currentKey,
        title: titleInput,
        description: descriptionInput
      };
    }
    save(MASTERKEY, langsList);
  }

  // deleteButton(isNew) is the button that can delete the current language if not isNew
  // otherwise nothing is returned.
  const deleteButton = (isNew) => {
    if (!isNew) {
      return <TouchableOpacity
        onPress={() => Alert.alert('Are you sure?',
          'Are you sure you want to delete this conlang? There is no way to recover saved data once deleted',
          [{
            text: 'No',
            style: 'cancel'
          },
          {
            text: 'Yes',
            onPress: () => {
              updateCurrentLang(true);
              setModalVisible(false);
            }
          }])}
        style={styles.delete}>
        <Text style={styles.deleteText}>Delete Conlang</Text>
      </TouchableOpacity>
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Modal
        visible={modalVisible}
        animationType={"slide"}>
        <View>
          <View style={styles.modalHeader}>
            <SafeAreaView style={styles.buttonWrapper}>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => {
                  setModalVisible(false)
                }}>
                <Text style={styles.button}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => {
                  (currentKey === 'new') ?
                    createNewLang()
                    : updateCurrentLang(false);
                  setModalVisible(false);
                }}>
                <Text style={styles.button}>Save</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
          <Text style={styles.inputLabel}>Name of Conlang: </Text>
          <TextInput
            style={nameIsFocused ? { ...styles.input, ...styles.focusedInput } : styles.input}
            value={titleInput}
            autoCorrect={false}
            onFocus={() => setNameIsFocused(true)}
            onBlur={() => setNameIsFocused(false)}
            onChangeText={(text) => setTitleInput(text)} />
          <Text style={styles.inputLabel}>Description of Conlang: </Text>
          <TextInput
            style={descIsFocused ? { ...styles.input, ...styles.focusedInput, ...styles.descInput } : { ...styles.input, ...styles.descInput }}
            value={descriptionInput}
            multiline={true}
            onFocus={() => setDescIsFocused(true)}
            onBlur={() => setDescIsFocused(false)}
            onChangeText={(text) => setDescriptionInput(text)} />
          {deleteButton(currentKey === 'new')}
        </View>
      </Modal>
      <FlatList
        data={langsList}
        renderItem={({ item }) =>
          <TouchableOpacity
            style={styles.conlang}
            onPress={() => loadLang(item.key)}
            onLongPress={() => {
              setTitleInput(item.title);
              setDescriptionInput(item.description);
              setCurrentKey(item.key);
              setModalVisible(true);
            }}>
            <Item title={item.title} description={item.description} />
          </TouchableOpacity>} />
      <TouchableOpacity
        style={styles.plusButton}
        onPress={() => {
          setTitleInput('');
          setDescriptionInput('');
          setCurrentKey('new');
          setModalVisible(true);
        }}>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  conlang: {
    backgroundColor: 'white',
    borderRadius: 25,
    borderLeftColor: 'mediumaquamarine',
    borderLeftWidth: 30,
    padding: 10,
    margin: 10,
    flexDirection: 'row',
    shadowOpacity: 0.75,
    shadowRadius: 3,
    shadowColor: 'black',
    shadowOffset: { height: 2, width: 2 }
  },
  conlangInfo: {
    flex: 1,
    margin: 10,
    marginLeft: 0
  },
  conlangName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  plusButton: {
    padding: 0,
    height: 70,
    width: 70,
    margin: 10,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 2,
    shadowColor: 'black',
    shadowOffset: { height: 2, width: 2 }
  },
  plus: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'mediumaquamarine'
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
    marginBottom: 0
  },
  input: {
    backgroundColor: 'white',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    padding: 5
  },
  focusedInput: {
    borderColor: 'mediumaquamarine',
    shadowOpacity: 0.5,
    shadowRadius: 2,
    shadowColor: 'black',
    shadowOffset: { height: 2, width: 2 },
  },
  descInput: {
    height: 120,
  },
  modalHeader: {
    height: 80,
    backgroundColor: 'mediumaquamarine'
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    color: 'white',
    fontSize: 18,
    padding: 5
  },
  delete: {
    backgroundColor: 'red',
    alignItems: 'center',
    alignSelf: 'center',
    width: 150,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center'
  },
  deleteText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
})

export default ConlangsScreen;