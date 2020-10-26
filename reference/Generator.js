// Module that can be used to generate possible words and syllables
import { Alert } from 'react-native';
import { getSoundsWithProperties } from './Sounds';

// getRandomInt(cap) is a random integer between 0 up to but not including cap
const getRandomInt = (cap) => {
  return Math.floor(Math.random() * cap)
}

// If arr is an array like this ['+consonantal', '-nasal']
// then convertFeatureArray(arr) is [['consonantal', true], ['nasal', false]]
const convertFeatureArray = (arr) => {
  let convertedArr = [];
  let feature;
  for (feature of arr) {
    let value = feature.slice(0, 1);
    let bool = value === '+';
    let featureName = feature.substring(1);
    convertedArr.push([featureName, bool]);
  }
  return convertedArr;
}

// generateStructure(form, inventory) is a syllable structure (i.e. onset, nucleus, or coda)
// that conforms to the data in form and uses sounds in array inventory
const generateStructure = (form, inventory) => {
  if (JSON.stringify(form) == '{}') {
    return '';
  }

  if (form.isManual) {
    if (form.manualEntries.length == 0) {
      Alert.alert(
        "One of your structures has no manual entries"
      );
      return '';
    } else {
      return form.manualEntries[getRandomInt(form.manualEntries.length)];
    }
  } else {
    let soundFeatures;
    let structure = [];
    for (soundFeatures of form.features) {
      let validSounds = getValidSounds(soundFeatures, inventory)
      if (validSounds.length === 0) {
        Alert.alert(
          "One of your structures creates no possible syllables"
        );
        return '';
      }
      structure.push(validSounds[getRandomInt(validSounds.length)]);
    }
    if (form.exceptions.indexOf(structure.join('')) !== -1) {
      return generateStructure(form, inventory);
    } else {
      return structure.join('');
    }
  }
}

// generate(sylStructures, inventory) is a syllable that matches one of the 
// forms detailed in sylStructures and is comprised of sounds in inventory.
export const generate = (sylStructures, inventory) => {
  let onsets = sylStructures[0].data;
  let nuclei = sylStructures[1].data;
  let codas = sylStructures[2].data;

  if (onsets.length === 0 && nuclei.length === 0 && codas.length === 0) {
    Alert.alert(
      "No valid word could be created1"
    );
    return '';
  }

  let onsetCap = onsets.length;
  let nucleusCap = nuclei.length;
  let codaCap = codas.length;

  if (sylStructures[0].canHaveNullStruct === 'true') {
    onsetCap++;
  }
  if (sylStructures[1].canHaveNullStruct === 'true') {
    nucleusCap++;
  }
  if (sylStructures[2].canHaveNullStruct === 'true') {
    codaCap++;
  }

  let onsetNum = getRandomInt(onsetCap);
  let nucleusNum = getRandomInt(nucleusCap);
  let codaNum = getRandomInt(codaCap);

  let onsetForm = (onsetNum == onsets.length) ? {} : onsets[onsetNum];
  let nucleusForm = (nucleusNum == nuclei.length) ? {} : nuclei[nucleusNum];
  let codaForm = (codaNum == codas.length) ? {} : codas[codaNum];

  let onset = generateStructure(onsetForm, inventory);
  let nucleus = generateStructure(nucleusForm, inventory);
  let coda = generateStructure(codaForm, inventory);


  return onset + nucleus + coda;
}


// getValidSounds(features, inventory) is the array of sounds in inventory that match features
const getValidSounds = (features, inventory) => {
  let convertedArray = convertFeatureArray(features);
  return getSoundsWithProperties(convertedArray, inventory);
}

// generatePossibleStructures(form, inventory) is the array of all possible 
// structures that match form and are comprised of sounds in inventory
export const generatePossibleStructures = (form, inventory) => {
  let results = [];
  let possibleSoundArrays = [];
  let soundFeatures;
  for (soundFeatures of form.features) {
    possibleSoundArrays.push(getValidSounds(soundFeatures, inventory));
  }

  let indices = new Array(possibleSoundArrays.length);
  indices.fill(0);


  let finalIndices = possibleSoundArrays.map(getFinalIndex);
  if (finalIndices.indexOf(-1) !== -1) {
    return [];
  }

  while (!arraysAreEqual(indices, finalIndices)) {
    let combo = getCombo(indices, possibleSoundArrays);

    results.push(combo);
    indices = incrementIndices(indices, finalIndices);

  }

  results.push(getCombo(finalIndices, possibleSoundArrays));

  return removeExceptions(results, form.exceptions);
}

// removeExceptions(combos, exceptions) is all the elements of combos that are not also in exceptions
const removeExceptions = (combos, exceptions) => {
  let i = 0;
  while (i < combos.length) {
    if (exceptions.indexOf(combos[i]) !== -1) {
      combos.splice(i, 1);
    } else {
      i++;
    }
  }
  return combos;
}

// arraysAreEqual(arr1, arr2) is true if and only if for all e in arr1, that same e is in the same index in arr2
const arraysAreEqual = (arr1, arr2) => {
  let i;
  for (i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true;
}

// incrementIndices(indices, finalIndices) adds one to the rightmost element of
// indices, unless that index is already equal to the corresponding index in finalIndices
// in which case that index is set to 0 and the element to the left of the previous undergoes the same process
const incrementIndices = (indices, finalIndices) => {
  let done = false;
  let i = indices.length - 1;
  while (!done) {
    if (i < 0) {
      return [];
    }
    if (indices[i] == finalIndices[i]) {
      indices[i] = 0;
      i--;
    } else {
      indices[i]++;
      done = true;
    }
  }
  return indices;
}

// getFinalIndex(arr) is the index of the last element in arr
const getFinalIndex = (arr) => {
  return arr.length - 1;
}

// getCombo(indices, arrs) is the string found by combining
// the strings at arrs[i][indices[i]] for all i
const getCombo = (indices, arrs) => {
  let result = [];
  let i;
  for (i = 0; i < arrs.length; i++) {
    result.push(arrs[i][indices[i]]);
  }
  return result.join('');
}