//TODO Add checks to see if the sounds they pick are in their language
//TODO get rid of the crappy dropdown, make your own modal
//TODO relocate the features array to a constant in the Sounds module
import React, { useState, useLayoutEffect } from 'react';
import { Text, View, Button, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, SafeAreaView } from 'react-native';
import { TextInput, Switch, FlatList } from 'react-native-gesture-handler';
import { save } from '../reference/Storage';
import { generatePossibleStructures } from '../reference/Generator';
import { FEATURES } from '../reference/Sounds'

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

const hasEmptyFeatures = (struct) => {
  let featureArr;
  for (featureArr of struct.features) {
    if (featureArr.length === 0) {
      return true;
    }
  }
  return false;
}

function SyllableScreen({ route, navigation }) {
  const { key, secKey, data, index, inventory } = route.params;
  const currentStruct = data[index];
  const category = getCategory(secKey);

  const [isInManual, setIsInManual] = useState(currentStruct.isManual);
  const [manualEntry, setManualEntry] = useState(currentStruct.manualEntries.join());
  const [exceptionEntry, setExceptionEntry] = useState(currentStruct.exceptions.join());
  const [focused, setFocused] = useState('');

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
    setFocused('');
  }

  const Item = ({ ind }) => {
    const [selectedFeatures, setSelectedFeatures] = useState(toFlatListData(currentStruct.features[ind]));
    const [modalVisible, setModalVisible] = useState(false);

    const FeatureSelection = ({ str }) => {
      let currentArr = currentStruct.features[ind];
      let isSelected = currentArr.indexOf(str) !== -1;

      return (
        <TouchableOpacity
          style={isSelected ? styles.pressedButton : styles.unpressedButton}
          onPress={() => updateFeatures(str)}>
          <Text style={isSelected ? styles.pressedButtonText : styles.unpressedButtonText}>{'[' + str + ']'}</Text>
        </TouchableOpacity>
      )
    }

    const updateFeatures = (feature) => {
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
      <View style={{ borderWidth: 0 }}>
        <Text style={styles.letterNumber}>{currentStruct.type.includes('C') ? 'C' : 'V'} #{ind + 1}:</Text>
        <Modal
          visible={modalVisible}
          animationType={'slide'}>
          <View>
            <SafeAreaView style={styles.modalHeader}>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.button}>Done</Text>
              </TouchableOpacity>
            </SafeAreaView>
            <Text style={{ ...styles.label, textAlign: 'center', marginBottom: 10 }} > Select all features for this sound</Text>
            <FlatList
              data={toFlatListData(FEATURES)}
              renderItem={({ item }) => <FeatureSelection str={item.value} key={item.key} />} />
          </View>
        </Modal>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.modalButtonText}>Select Features</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.featuresList}>
          {selectedFeatures.map((item) => <Text style={styles.featureText} key={item.key}>{'[' + item.value + ']'}</Text>)}
        </ScrollView>
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
        <View style={styles.modeView}>
          <Text style={styles.label}>Please enter all possible syllables:</Text>
          <TextInput
            style={focused === 'manual' ? { ...styles.input, ...styles.focusedInput, height: '50%' } : { ...styles.input, height: '50%' }}
            value={manualEntry}
            autoCorrect={false}
            placeholder={'pl,pr,kl,kr,...'}
            onFocus={() => setFocused('manual')}
            onBlur={() => setFocused('')}
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
          <ScrollView
            contentContainerStyle={styles.scrollWrapper}>
            {currentStruct.features.map((item, index) => <Item ind={index} key={index.toString()} />)}
          </ScrollView>
          <Text style={styles.label}>Exceptions:</Text>
          <TextInput
            style={focused === 'exceptions' ? { ...styles.input, ...styles.focusedInput, height: '25%' } : { ...styles.input, height: '25%' }}
            value={exceptionEntry}
            autoCorrect={false}
            onFocus={() => setFocused('exceptions')}
            onBlur={() => setFocused('')}
            multiline={true}
            placeholder={'pl,pr,kl,kr,...'}
            onChangeText={text => {
              currentStruct.exceptions = text.split(",");
              formatEntries(currentStruct.exceptions);
              setExceptionEntry(currentStruct.exceptions.join());
            }} />
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => {
              if (inventory.length === 0) {
                Alert.alert(
                  'Empty Sound Inventory',
                  'Please add some sounds to your sound inventory to see your possible syllable structures'
                )
              } else if (hasEmptyFeatures(currentStruct)) {
                Alert.alert(
                  'Incomplete Features',
                  'Please add features for every sound in the structure'
                )
              } else {
                Alert.alert(
                  'Possible structures',
                  'With these features, these structures are allowed: '.concat(generatePossibleStructures(currentStruct, inventory).toString())
                )
              }
            }}>
            <Text style={styles.generateButtonText}>Generate Possible Structures</Text>
          </TouchableOpacity>
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
    margin: 5,
    justifyContent: 'center'
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
  modalHeader: {
    height: 80,
    backgroundColor: 'mediumaquamarine'
  },
  button: {
    color: 'white',
    fontSize: 18,
    padding: 5,
  },
  scrollWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  letterNumber: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18
  },
  modalButton: {
    backgroundColor: 'mediumaquamarine',
    height: 20,
    width: 120,
    borderRadius: 10,
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 2,
    shadowColor: 'black',
    shadowOffset: { height: 2, width: 2 },
  },
  modalButtonText: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold'
  },
  featuresList: {
    alignItems: 'center',
    padding: 5
  },
  featureText: {
    padding: 2
  },
  pressedButton: {
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    backgroundColor: 'mediumaquamarine'
  },
  pressedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 4
  },
  unpressedButton: {
    borderWidth: 1,
    height: 40,
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  unpressedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 4
  },
  generateButton: {
    height: 40,
    width: 280,
    borderRadius: 10,
    shadowOpacity: 0.5,
    shadowRadius: 2,
    shadowColor: 'black',
    shadowOffset: { height: 2, width: 2 },
    backgroundColor: 'mediumaquamarine',
    justifyContent: 'center',
    alignSelf: 'center',
    margin: 5
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  }
})

export default SyllableScreen;

