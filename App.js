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
   gender={"female"}
   lang={"ar-EG"}
   api={'https://avanza-training.westeurope.cloudapp.azure.com'}
   clientkey={"3d44a382820ca884b74110fc1eebe5984f524343f78e58bd5958ea56fbf195907203c6b4b99fc40d6c5d18ec12bf41f9bde3aa84a47bf6a7b1bbb107c07937a8"}
   clientSecret={"70747a4ad98badf11465ae80f45e047a1832f1805ebe91b473295d92500a922dd9b6b41c91ebd34beb0f692b40a303a27a6910f5075c6b6897da639e85335463"}
   />
  // return  <WebView source={{ uri: 'https://avanza-training.westeurope.cloudapp.azure.com/' }} />;
}

export default App
