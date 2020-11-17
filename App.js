/**
 * @format
 * @flow strict-local
 */

import React from 'react'
// import Feedback from './components/feedback.js'
import Wrapper from './components/wrapper.js'
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native'
import { WebView } from 'react-native-webview';
const fback = function () {
  return <Feedback />
}
let state = {
  isVisible: false,
}

const App: () => React$Node = () => {
   return <Wrapper
   Gender={"male"}
   language={"ar"}
   api={""}
   clientKey={""}
   />
  // return  <WebView source={{ uri: 'https://avanza-training.westeurope.cloudapp.azure.com/' }} />;
}

export default App
