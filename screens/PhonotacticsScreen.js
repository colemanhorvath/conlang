import React, { useState, useLayoutEffect } from 'react';
import { Text, View, Button, SectionList, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { save } from '../reference/Storage';

function PhonotacticsScreen({ route, navigation }) {
  const { key, title, description, sylStructure, sylStructures } = route.params

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

  // removeElement(index) removes the last added element to
  // the onset structure if index is 0
  // the nucleus structure if index is 1
  // the coda structure if index is 2
  const removeElement = (index) => {
    let element = sylStructure[index];
    let leng = element.length;
    let syl = [sylStructure[0], sylStructure[1], sylStructure[2]];
    if (leng > 0) {
      if (element.substring(leng - 1) === ')') {
        syl[index] = element.substring(0, leng - 3);
      }
      else {
        syl[index] = element.substring(0, leng - 1);
      }
      updateCurrentLang(syl, index);
      navigation.setParams({ sylStructure: syl });
    }
  }

  // getCombinations(structure) is the array of all possible onsets/nuclei/codas
  // that can be produced from the entered structure
  const getCombinations = (structure) => {
    let combos = [];
    let noParens = structure.replace(/[()]/g, '');
    let numRequired = noParens.length - ((structure.length - noParens.length) / 2);
    while (noParens.length > 0 && noParens.length >= numRequired) {
      combos.push(noParens);
      noParens = noParens.substring(1);
    }
    return combos;
  }

  // getDefaultFeatureArray(str) is an array of empty arrays 
  // such that the length of the 2D array equals the length of string str
  const getDefaultFeatureArray = (str) => {
    let arr = [];
    let i;
    for (i = 0; i < str.length; i++) {
      arr.push([]);
    }
    return arr;
  }

  // updateCurrentLang(syllableStruct, index) adds all combos possible from syllableStruct that are not already in the conlang data
  // index is 0 if the structure is the onset, 1 if the nucleus, 2 if coda
  const updateCurrentLang = (syllableStruct, index) => {
    let combos = getCombinations(syllableStruct[index]);
    let sylElem = sylStructures[index].data;
    let i = 0;
    while (i < sylElem.length) {
      let currentSyl = sylElem[i].type;
      let comboIndex = combos.indexOf(currentSyl);
      if (comboIndex != -1) {
        combos.splice(comboIndex, 1);
        i++;
      }
      else {
        sylElem.splice(i, 1);
      }
    }
    let combo;
    for (combo of combos) {
      sylElem.push({
        type: combo,
        isManual: true,
        manualEntries: [],
        features: getDefaultFeatureArray(combo),
        exceptions: []
      })
    }
    sortData(index);
  }

  // sortData(index) sorts the structure variants and removes duplicates
  // index is 0 if the structure is the onset, 1 if the nucleus, 2 if coda
  const sortData = (index) => {
    let sylElem = sylStructures[index].data;
    sylElem.sort((a, b) => {
      let str1 = a.type;
      let str2 = b.type;
      return str1.localeCompare(str2);
    });
    let i = 0;
    while (i < sylElem.length - 1) {
      if (sylElem[i].type === sylElem[i + 1].type) {
        sylElem.splice(i, 1);
      }
      else {
        i++;
      }
    }
  }

  // An Item is a structure variant
  // title: the written form of the structure variant (e.g. CC)
  const Item = ({ title }) => {
    return (
      <SafeAreaView>
        <Text>{title}</Text>
      </SafeAreaView>
    )
  }

  return (
    <View>
      <Text>Phonotactics Screen</Text>
      <Text>Currently editing: {title}</Text>
      <Text>{description}</Text>
      <Text>{'Current syllable structure:' + sylStructure.join('')} </Text>
      <Button
        title='Add onset C'
        onPress={() => {
          let syl = [sylStructure[0] + 'C', sylStructure[1], sylStructure[2]];
          updateCurrentLang(syl, 0);
          navigation.setParams({ sylStructure: syl });
        }} />
      <Button
        title='Add optional onset (C)'
        onPress={() => {
          let syl = [sylStructure[0] + '(C)', sylStructure[1], sylStructure[2]];
          updateCurrentLang(syl, 0);
          navigation.setParams({ sylStructure: syl });
        }} />
      <Button
        title='Add vowel V'
        onPress={() => {
          let syl = [sylStructure[0], sylStructure[1] + 'V', sylStructure[2]];
          updateCurrentLang(syl, 1);
          navigation.setParams({ sylStructure: syl });
        }} />
      <Button
        title='Add optional vowel (V)'
        onPress={() => {
          let syl = [sylStructure[0], sylStructure[1] + '(V)', sylStructure[2]];
          updateCurrentLang(syl, 1);
          navigation.setParams({ sylStructure: syl });
        }} />
      <Button
        title='Add coda consonant C'
        onPress={() => {
          let syl = [sylStructure[0], sylStructure[1], sylStructure[2] + 'C'];
          updateCurrentLang(syl, 2);
          navigation.setParams({ sylStructure: syl });
        }} />
      <Button
        title='Add optional coda consonant (C)'
        onPress={() => {
          let syl = [sylStructure[0], sylStructure[1], sylStructure[2] + '(C)'];
          updateCurrentLang(syl, 2);
          navigation.setParams({ sylStructure: syl });
        }} />
      <Button
        title='Remove onset consonant'
        onPress={() => {
          removeElement(0);
        }} />
      <Button
        title='Remove vowel'
        onPress={() => {
          removeElement(1);
        }} />
      <Button
        title='Remove coda consonant'
        onPress={() => {
          removeElement(2);
        }} />
      <Button
        title='Clear Syllable Structure'
        onPress={() => {
          let syl = ['', '', ''];
          updateCurrentLang(syl, 0);
          updateCurrentLang(syl, 1);
          updateCurrentLang(syl, 2);
          navigation.setParams({ sylStructure: syl });
        }} />
      <Button
        title='Save'
        onPress={() => save(key, route.params)} />
      <Button
        title='Back'
        onPress={() => navigation.goBack()} />
      <SectionList
        sections={sylStructures}
        renderItem={({ item, section, index }) =>
          <TouchableOpacity
            onPress={() => navigation.push('Syllable', { ...route.params, ...section, index: index })}>
            < Item title={item.type} />
          </TouchableOpacity>}
        renderSectionHeader={({ section: { title } }) => (
          <Text>{title}</Text>
        )}
        keyExtractor={(item, index) => index}
      />
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

export default PhonotacticsScreen;