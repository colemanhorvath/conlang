//TODO Add checks to see if the sounds they pick are in their language
//TODO get rid of the crappy dropdown, make your own modal
//TODO relocate the features array to a constant in the Sounds module
import React, { useState, useLayoutEffect } from 'react';
import { Text, View, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Switch, FlatList } from 'react-native-gesture-handler';
import ModalDropdown from 'react-native-modal-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { save } from '../reference/Storage';
import { generatePossibleStructures } from '../reference/Generator';

const features = ['+consonantal', '-consonantal', '+syllabic', '-syllabic', '+sonorant', '-sonorant']

const toFlatListData = (arr) => {
  let data = []
  let f;
  for (f of arr) {
    data.push({
      value: f,
      key: f
    });
  }
  return data;
}

const getCategory = (key) => {
  switch (key) {
    case 'o': return 'Onset'
      break;
    case 'n': return 'Nucleus'
      break;
    case 'c': return 'Coda'
  }
}

function SyllableScreen({ route, navigation }) {
  const { key, secKey, data, index, inventory } = route.params;
  const currentStruct = data[index];
  const category = getCategory(secKey);

  const [isInManual, setIsInManual] = useState(currentStruct.isManual);
  const [manualEntry, setManualEntry] = useState(currentStruct.manualEntries.join());
  const [exceptionEntry, setExceptionEntry] = useState(currentStruct.exceptions.join());

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

  const toggleSwitch = (newVal) => {
    currentStruct.isManual = newVal;
    setIsInManual(currentStruct.isManual);
  }

  const Item = ({ ind }) => {
    const [selectedFeatures, setSelectedFeatures] = useState(toFlatListData(currentStruct.features[ind]));

    const updateFeatures = (index, feature) => {
      let currentArr = currentStruct.features[ind];
      let i = currentArr.indexOf(feature);
      if (i === -1) {
        currentArr.push(feature);
      } else {
        currentArr.splice(i, 1);
      }
      setSelectedFeatures(toFlatListData(currentArr));
    }

    return (
      <View>
        <Text>{currentStruct.type.includes('C') ? 'C' : 'V'} #{ind + 1}:</Text>
        <ModalDropdown
          options={features}
          onSelect={updateFeatures} />
        <FlatList
          listKey={ind.toString()}
          data={selectedFeatures}
          renderItem={({ item }) => <Text>{item.value}</Text>} />
      </View>
    )
  }

  const formatEntries = (arr) => {
    let i;
    for (i = 0; i < arr.length; i++) {
      arr[i] = arr[i].trim().toLowerCase();
    }
  }

  const getCurrentView = () => {
    const [isFocused, setIsFocused] = useState(false);

    if (isInManual) {
      return (
        <View style={styles.modeView}>
          <Text style={styles.label}>Please enter all possible syllables:</Text>
          <TextInput
            style={isFocused ? { ...styles.input, ...styles.focusedInput, height: '50%' } : { ...styles.input, height: '50%' }}
            value={manualEntry}
            autoCorrect={false}
            placeholder={'pl,pr,kl,kr,...'}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline={true}
            onChangeText={text => {
              currentStruct.manualEntries = text.split(",");
              formatEntries(currentStruct.manualEntries);
              setManualEntry(currentStruct.manualEntries.join());
            }} />
        </View>
      )
    }
    else {
      return (
        <View style={styles.modeView}>
          <FlatList
            contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
            data={currentStruct.features}
            keyExtractor={({ index }) => index}
            renderItem={({ index }) => <Item ind={index} />} />
          <Text style={styles.label}>Exceptions:</Text>
          <TextInput
            style={isFocused ? { ...styles.input, ...styles.focusedInput, height: '25%' } : { ...styles.input, height: '25%' }}
            value={exceptionEntry}
            autoCorrect={false}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline={true}
            onChangeText={text => {
              currentStruct.exceptions = text.split(",");
              formatEntries(currentStruct.exceptions);
              setExceptionEntry(currentStruct.exceptions.join());
            }} />
          <Button
            title='Generate possible structures'
            onPress={() => {
              Alert.alert(
                'Possible structures',
                'With these features, these structures are allowed: '.concat(generatePossibleStructures(currentStruct, inventory).toString())
              )
            }} />
        </View>
      )
    }
  }

  return (
    <View style={{}}>
      <Text style={styles.title}>{category + ' ' + currentStruct.type}</Text>
      <View style={styles.toggleView}>
        <Text style={isInManual ? styles.untoggledText : styles.toggledText}>Feature Entry Mode</Text>
        <Switch
          onValueChange={toggleSwitch}
          value={isInManual} />
        <Text style={isInManual ? styles.toggledText : styles.untoggledText}>Manual Entry Mode</Text>
      </View>
      {getCurrentView()}
      <Button
        title='Print params'
        onPress={() => console.log(route.params)} />
      <Button
        title='Save'
        onPress={() => {
          const { data, index, ...trueParams } = route.params;
          save(key, trueParams);
        }} />
      <Button
        title='Back'
        onPress={() => {
          const { data, index, ...trueParams } = route.params;
          navigation.navigate('Phonotactics', trueParams);
        }} />
    </View>
  )
}

const styles = StyleSheet.create({
  saveButton: {
    color: 'white',
    fontSize: 18,
    padding: 4
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
  title: {
    color: 'mediumaquamarine',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    margin: 10,
    marginBottom: 0
  },
  modeView: {
    padding: 10
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
})

export default SyllableScreen;

