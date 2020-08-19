import React, { useState, useLayoutEffect } from 'react';
import { Text, View, Button, SectionList, StyleSheet, FlatList, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { save } from '../reference/Storage';

const addButtonData = [{ string: 'C', index: 0, key: 'reqOnset' }, { string: '(C)', index: 0, key: 'optOnset' }, { string: 'V', index: 1, key: 'reqNucleus' }, { string: '(V)', index: 1, key: 'optNucleus' }, { string: 'C', index: 2, key: 'reqCoda' }, { string: '(C)', index: 2, key: 'optCoda' },]

const removeButtonData = [{ index: 0, key: 'delOnset' }, { index: 1, key: 'delNucleus' }, { index: 2, key: 'delCoda' }]

const labels = [{ label: 'Onset:', key: '0' }, { label: 'Nucleus:', key: '1' }, { label: 'Coda:', key: '2' }];

function PhonotacticsScreen({ route, navigation }) {
  const { key, title, description, sylStructure, sylStructures } = route.params

  const AddButton = ({ string, index }) => {
    return (
      <TouchableOpacity
        style={{ ...styles.button, height: 50, width: 50 }}
        onPress={() => {
          let newStruct = sylStructure[index] + string;
          let syl = [...sylStructure];
          syl[index] = newStruct;
          updateCurrentLang(syl, index);
          navigation.setParams({ sylStructure: syl });
        }}>
        <Text style={styles.addButtonText}>{string}</Text>
      </TouchableOpacity>
    )
  }

  const RemoveButton = ({ index }) => {
    return (
      <TouchableOpacity
        style={{ ...styles.button, height: 30, width: 50 }}
        onPress={() => removeElement(index)}>
        <Text style={styles.removeButtonText}>⌫</Text>
      </TouchableOpacity>
    )
  }

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
      <View style={{ borderWidth: 1, padding: 3 }}>
        <Text style={{ fontSize: 16 }}>{title}</Text>
      </View>
    )
  }

  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.structLabel}>Current syllable structure:</Text>
      <View style={styles.structView}>
        <Text style={styles.currentSylStruct}>{sylStructure.join('|')} </Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            let syl = ['', '', ''];
            updateCurrentLang(syl, 0);
            updateCurrentLang(syl, 1);
            updateCurrentLang(syl, 2);
            navigation.setParams({ sylStructure: syl });
          }}>
          <Text style={styles.clearText}>X</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        contentContainerStyle={styles.buttonList}
        data={labels}
        renderItem={({ item }) => <Text style={styles.label}>{item.label}</Text>} />
      <FlatList
        contentContainerStyle={styles.buttonList}
        data={addButtonData}
        renderItem={({ item }) => <AddButton string={item.string} index={item.index} />} />
      <FlatList
        contentContainerStyle={styles.buttonList}
        data={removeButtonData}
        renderItem={({ item }) => <RemoveButton index={item.index} />} />
      <View style={styles.structView}>
        <Text style={styles.variantsLabel}>Syllable Structure Variants:</Text>
        <TouchableOpacity
          style={{ ...styles.clearButton, backgroundColor: 'blue' }}
          onPress={() => Alert.alert('Select each Syllable Structure Variant to specify its specific phonotactics')}>
          <Text style={styles.clearText}>i</Text>
        </TouchableOpacity>
      </View>
      <SectionList
        sections={sylStructures}
        contentContainerStyle={{ borderWidth: 1, margin: 5 }}
        renderItem={({ item, section, index }) =>
          <TouchableOpacity
            onPress={() => navigation.push('Syllable', { ...route.params, data: section.data, index: index, secKey: section.key })}>
            <Item title={item.type} />
          </TouchableOpacity>}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.header}>
            <Text style={styles.headerText}>{title}</Text>
          </View>
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
  button: {
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
  buttonList: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'mediumaquamarine'
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red'
  },
  clearText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
  },
  title: {
    color: 'mediumaquamarine',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  structLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  currentSylStruct: {
    width: '90%',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold'
  },
  label: {
    width: 70,
    fontStyle: 'italic',
    color: 'mediumaquamarine',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  structView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 3
  },
  clearButton: {
    height: 30,
    width: 30,
    backgroundColor: 'red',
    shadowOpacity: 0.75,
    shadowRadius: 3,
    shadowColor: 'black',
    shadowOffset: { height: 2, width: 2 },
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: 'white',
    borderWidth: 1,
    padding: 3
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  variantsLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 5,
    marginTop: 20
  }
})

export default PhonotacticsScreen;