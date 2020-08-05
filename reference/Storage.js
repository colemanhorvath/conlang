// Storage is a module to be used to save and load data from AsyncStorage
import { AsyncStorage } from 'react-native';

//load(k) is the data stored with key k if such data exists
export const load = async (k) => {
  try {
    const value = await AsyncStorage.getItem(k);
    if (value !== null) {
      return JSON.parse(value);
    }
  }
  catch (e) {
    console.log(e);
  }
}

// save(k, v) stores data v with key k
export const save = async (k, v) => {
  try {
    await AsyncStorage.setItem(k, JSON.stringify(v))
  }
  catch (e) {
    console.log(e)
  }
}

// remove(k) deletes any data stored with key k
export const remove = async (k) => {
  try {
    await AsyncStorage.removeItem(k);
  }
  catch (e) {
    console.log(e);
  }
}