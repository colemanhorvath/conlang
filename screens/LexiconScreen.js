import React, { useState, useLayoutEffect } from 'react';
import { Text, View, Button, Modal, StyleSheet, SafeAreaView } from 'react-native';
import { FlatList, Switch, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { generate } from '../reference/Generator';
import { save } from '../reference/Storage';

// sortLex(lex, isEnglish) is lexicon lex in alphabetical order
// If isEnglish, the English words are used for sorting, otherwise the conlang words are used
const sortLex = (lex, isEnglish) => {
  if (isEnglish) {
    return (lex.sort((a, b) => a.meaning.localeCompare(b.meaning)));
  } else {
    return (lex.sort((a, b) => a.word.localeCompare(b.word)));
  }
}

function LexiconScreen({ route, navigation }) {
  const { key, title, description, sylStructures, inventory, lexicon, lastLexKey, lexiconIsSortedByEnglish } = route.params;

  const [search, setSearch] = useState('');
  const [visibleLexicon, setVisibleLexicon] = useState(sortLex([...lexicon], lexiconIsSortedByEnglish));
  const [modalVisible, setModalVisible] = useState(false);
  const [conlangAddition, setConlangAddition] = useState('');
  const [englishAddition, setEnglishAddition] = useState('');
  const [notes, setNotes] = useState('');
  const [focused, setFocused] = useState('');
  const [currentKey, setCurrentKey] = useState('-1');

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

  // An Item is an entry in the lexicon
  // current: String of the word in the currently sorted language
  // secondary: String of the word in the not currently sorted language
  // k: String of the key of the lexicon entry
  const Item = ({ current, secondary, notes, k }) => {
    return (
      <TouchableOpacity
        style={styles.entry}
        onPress={() => {
          if (lexiconIsSortedByEnglish) {
            setConlangAddition(secondary);
            setEnglishAddition(current);
          } else {
            setConlangAddition(current);
            setEnglishAddition(secondary);
          }
          setNotes(notes);
          setCurrentKey(k);
          setModalVisible(true);
        }}
      >
        <Text style={styles.current}>{current}</Text>
        <Text style={styles.secondary}>{secondary}</Text>
      </TouchableOpacity>
    )
  }

  // toggleSwitch(newVal) sorts the lexicon by English if newVal and by the conlang otherwise
  // The state is updated to reflect this
  const toggleSwitch = (newVal) => {
    setVisibleLexicon(sortLex(lexicon.filter((a) => filterLex(a, search, newVal)), newVal));
    navigation.setParams({ lexiconIsSortedByEnglish: newVal });
  }

  // getCurrentList() is the list of all words in the lexicon, 
  // with the English entry first if lexiconIsSortedByEnglish
  // otherwise with the conlang entry first
  const getCurrentList = () => {
    if (lexiconIsSortedByEnglish) {
      return (
        <FlatList
          data={visibleLexicon}
          renderItem={({ item }) => <Item current={item.meaning} secondary={item.word} notes={item.notes} k={item.key} />} />
      )
    } else {
      return (
        <FlatList
          data={visibleLexicon}
          renderItem={({ item }) => <Item current={item.word} secondary={item.meaning} notes={item.notes} k={item.key} />} />
      )
    }
  }

  // filterLex(entry, search, isEnglish) is true if entry contains the string search
  // isEnglish determines which language is being searched
  const filterLex = (entry, search, isEnglish) => {
    if (isEnglish) {
      return entry.meaning.includes(search.toLowerCase());
    } else {
      return entry.word.includes(search.toLowerCase());
    }
  }

  // updateSearch(text) sets the state to reflect the new search and updates the visible lexicon to only show entries matching the search
  const updateSearch = (text) => {
    setSearch(text);
    setVisibleLexicon(sortLex(lexicon.filter((a) => filterLex(a, text, lexiconIsSortedByEnglish)), lexiconIsSortedByEnglish));
  }

  const generateKey = () => {
    let newKeyInt = parseInt(lastLexKey.lastKey) + 1;
    let newKey = newKeyInt.toString();
    lastLexKey.lastKey = newKey;
    return newKey;
  }

  const updateLex = (wrd, mean, note, k) => {
    if (k === '-1') {
      let newKey = generateKey();
      lexicon.push({
        key: newKey,
        word: wrd,
        meaning: mean,
        notes: note
      });
    } else {
      let idx = lexicon.findIndex((e) => e.key === k);
      lexicon[idx] = {
        key: k,
        word: wrd,
        meaning: mean,
        notes: note
      };
    }
  }

  const removeEntry = (k) => {
    let idx = lexicon.findIndex((e) => e.key === k);
    lexicon.splice(idx, 1);
    updateSearch('');
    setModalVisible(false);
  }

  const removeButton = (shouldShow) => {
    if (shouldShow) {
      return (
        <TouchableOpacity
          style={styles.delete}
          onPress={() => removeEntry(currentKey)} >
          <Text style={styles.deleteText}>Delete Word</Text>
        </TouchableOpacity>
      )
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.toggleView}>
        <Text>Sort by </Text>
        <Text style={lexiconIsSortedByEnglish ? styles.untoggledText : styles.toggledText}>{title}</Text>
        <Switch
          style={{ margin: 5 }}
          onValueChange={toggleSwitch}
          value={lexiconIsSortedByEnglish} />
        <Text style={lexiconIsSortedByEnglish ? styles.toggledText : styles.untoggledText}>English</Text>
      </View>
      <TextInput
        style={styles.searchBar}
        value={search}
        autoCorrect={false}
        autoCapitalize={'none'}
        placeholder={'Search Lexicon'}
        onChangeText={text => updateSearch(text)} />
      {getCurrentList()}
      <Modal
        visible={modalVisible}
        animationType='slide'>
        <View>
          <View style={styles.modalHeader}>
            <SafeAreaView style={styles.buttonWrapper}>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => {
                  setFocused('');
                  setModalVisible(false);
                }}>
                <Text style={styles.button}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => {
                  updateLex(conlangAddition, englishAddition, notes, currentKey);
                  setFocused('');
                  setModalVisible(false);
                  toggleSwitch(lexiconIsSortedByEnglish);
                }}>
                <Text style={styles.button}>Save</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
          <Text style={styles.inputLabel}>Word in {title}:</Text>
          <View style={styles.conlangInputWrapper}>
            <TextInput
              style={focused === 'conlang' ? { ...styles.input, ...styles.focusedInput } : styles.input}
              value={conlangAddition}
              autoCorrect={false}
              autoCapitalize={'none'}
              onFocus={() => setFocused('conlang')}
              onBlur={() => setFocused('')}
              onChangeText={text => setConlangAddition(text)} />
            <TouchableOpacity
              onPress={() => setConlangAddition(generate(sylStructures, inventory))}>
              <Text style={styles.random}>Random</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inputLabel}>Meaning in English:</Text>
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              style={focused === 'english' ? { ...styles.input, ...styles.focusedInput } : styles.input}
              value={englishAddition}
              autoCorrect={false}
              autoCapitalize={'none'}
              onFocus={() => setFocused('english')}
              onBlur={() => setFocused('')}
              onChangeText={text => setEnglishAddition(text)} />
          </View>
          <Text style={styles.inputLabel}>Notes:</Text>
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              style={focused === 'notes' ? { ...styles.input, ...styles.focusedInput, height: 200 } : { ...styles.input, height: 200 }}
              value={notes}
              autoCorrect={false}
              autoCapitalize={'none'}
              multiline={true}
              placeholder={'Part of Speech, Usage, Example Sentence, etc.'}
              onFocus={() => setFocused('notes')}
              onBlur={() => setFocused('')}
              onChangeText={text => setNotes(text)} />
          </View>
          {removeButton(currentKey !== '-1')}
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.plusButton}
        onPress={() => {
          setConlangAddition('');
          setEnglishAddition('');
          setNotes('');
          setCurrentKey('-1');
          setModalVisible(true);
        }}>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  saveButton: {
    color: 'white',
    fontSize: 18,
    padding: 4
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
  title: {
    color: 'mediumaquamarine',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  toggledText: {
    fontWeight: 'bold'
  },
  untoggledText: {
    color: 'gray',
    margin: 5
  },
  toggleView: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 15,
    padding: 5,
    margin: 5
  },
  entry: {
    borderWidth: 1,
    borderColor: 'gray',
    marginLeft: 5,
    marginRight: 5
  },
  current: {
    fontWeight: 'bold'
  },
  secondary: {
    color: 'gray'
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
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
    marginBottom: 0
  },
  input: {
    flex: 1,
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
  conlangInputWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  random: {
    color: 'mediumaquamarine',
    fontWeight: 'bold',
    margin: 5,
    fontSize: 16
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

export default LexiconScreen;