//TODO update data structure and generateKey method to actually generate and keep track of unique keys
import React, { useState, useLayoutEffect } from 'react';
import { Text, View, Button, Modal, StyleSheet } from 'react-native';
import { FlatList, Switch, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { key, title, description, sylStructures, inventory, lexicon, lexiconIsSortedByEnglish } = route.params;

  const [search, setSearch] = useState('');
  const [visibleLexicon, setVisibleLexicon] = useState(sortLex([...lexicon], lexiconIsSortedByEnglish));
  const [modalVisible, setModalVisible] = useState(false);
  const [conlangAddition, setConlangAddition] = useState('');
  const [englishAddition, setEnglishAddition] = useState('');
  const [currentKey, setCurrentKey] = useState(-1);

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
  const Item = ({ current, secondary, k }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (lexiconIsSortedByEnglish) {
            setConlangAddition(secondary);
            setEnglishAddition(current);
          } else {
            setConlangAddition(current);
            setEnglishAddition(secondary);
          }
          setCurrentKey(k);
          setModalVisible(true);
        }}
      >
        <Text>{current}: {secondary}</Text>
        <Text>Key: {k}</Text>
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
          renderItem={({ item }) => <Item current={item.meaning} secondary={item.word} k={item.key} />} />
      )
    } else {
      return (
        <FlatList
          data={visibleLexicon}
          renderItem={({ item }) => <Item current={item.word} secondary={item.meaning} k={item.key} />} />
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
    return lexicon.length.toString();
  }

  const updateLex = (wrd, mean, k) => {
    if (k === -1) {
      lexicon.push({
        key: generateKey(),
        word: wrd,
        meaning: mean
      });
    } else {
      lexicon[parseInt(k)] = {
        key: k,
        word: wrd,
        meaning: mean
      };
    }
  }

  return (
    <View>
      <Text>Lexicon Screen</Text>
      <Text>Currently editing: {title}</Text>
      <Text>{description}</Text>
      <Text>Toggle which language is used for sorting:</Text>
      <Switch
        onValueChange={toggleSwitch}
        value={lexiconIsSortedByEnglish} />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
        value={search}
        autoCorrect={false}
        autoCapitalize={'none'}
        placeholder={'Search Lexicon'}
        onChangeText={text => updateSearch(text)} />
      {getCurrentList()}
      <Modal
        visible={modalVisible}
        animationType='slide'>
        <SafeAreaView>
          <Text>Word in {title}:</Text>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
            value={conlangAddition}
            autoCorrect={false}
            autoCapitalize={'none'}
            onChangeText={text => setConlangAddition(text)} />
          <Text>Meaning in English:</Text>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
            value={englishAddition}
            autoCorrect={false}
            autoCapitalize={'none'}
            onChangeText={text => setEnglishAddition(text)} />
          <Button
            title='Generate Random word'
            onPress={() => setConlangAddition(generate(sylStructures, inventory))} />
          <Button
            title='Save'
            onPress={() => {
              updateLex(conlangAddition, englishAddition, currentKey);
              updateSearch('');
              setModalVisible(false);
            }} />
          <Button
            title='Cancel'
            onPress={() => setModalVisible(false)} />
        </SafeAreaView>
      </Modal>
      <Button
        title='Add entry'
        onPress={() => {
          setConlangAddition('');
          setEnglishAddition('');
          setCurrentKey(-1);
          setModalVisible(true);
        }} />
      <Button
        title='Save'
        onPress={() => save(key, route.params)} />
      <Button
        title='Print params'
        onPress={() => console.log(route.params)} />
      <Button
        title='Back'
        onPress={() => navigation.goBack()} />
    </View>
  )
}

const styles = StyleSheet.create({
  saveButton: {
    color: 'white',
    fontSize: 18,
    padding: 4
  },
})

export default LexiconScreen;