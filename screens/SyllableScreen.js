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

function SyllableScreen({ route, navigation }) {
  const { key, title, description, data, index, inventory } = route.params;
  const currentStruct = data[index];

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
    const [selectedFeatures, setSelectedFeatures] = useState(currentStruct.features[ind].toString());

    const updateFeatures = (index, feature) => {
      let currentArr = currentStruct.features[ind];
      let i = currentArr.indexOf(feature);
      if (i === -1) {
        currentArr.push(feature);
      } else {
        currentArr.splice(i, 1);
      }
      setSelectedFeatures(currentArr.toString());
    }

    return (
      <View>
        <Text>Select Features for {currentStruct.type.includes('C') ? "Consonant" : "Vowel"} #{ind + 1}:</Text>
        <ModalDropdown
          options={features}
          onSelect={updateFeatures} />
        <Text>Current Features: {selectedFeatures}</Text>
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
    if (isInManual) {
      return (
        <View>
          <Text>Please enter all possible syllables:</Text>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
            value={manualEntry}
            autoCorrect={false}
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
        <SafeAreaView>
          <FlatList
            data={currentStruct.features}
            keyExtractor={({ index }) => index}
            renderItem={({ index }) => <Item ind={index} />} />
          <Text>Exceptions:</Text>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
            value={exceptionEntry}
            autoCorrect={false}
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
        </SafeAreaView>
      )
    }
  }

  return (
    <View>
      <Text>Syllable Screen</Text>
      <Text>Currently editing: {title}</Text>
      <Text>{description}</Text>
      <Text>Current syllable element: {currentStruct.type}</Text>
      <Switch
        onValueChange={toggleSwitch}
        value={isInManual} />
      <Text>{isInManual ? "Manual Entry Mode" : "Feature Entry Mode"}</Text>
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
})

export default SyllableScreen;

