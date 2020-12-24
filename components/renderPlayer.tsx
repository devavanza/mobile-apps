import React from 'react'
import {View, Text, Dimensions} from 'react-native'
import CheckBox from '@react-native-community/checkbox'

import VideoPlayer from 'react-native-video-player'
import styles from './feedbackStyle'
interface PropsPlayer {
  lang: string
  uri: string
  error: string
  isSelected: boolean
  setState: object
  _this: object
}
const Player = ({
  lang,
  uri,
  error,
  isSelected,
  setState,
  _this,
}: PropsPlayer) => {
  return (
    <View style={styles.pCompo1}>
      <VideoPlayer video={{uri: uri}} videoWidth={1600} videoHeight={900} />
      <Text style={styles.tcomp98}>{error}</Text>
      {lang == 'en-US' && (
        <View
          style={{
            flexDirection: 'row',
            left: 10,
          }}>
          <CheckBox
            value={isSelected}
            onValueChange={vaue => {
              _this.setState({isSelected: vaue})
            }}
          />
          <Text style={styles.pCompo2}>
            I consent usage of this recorded data for the purpose of quality
            assurance.
          </Text>
        </View>
      )}
      {lang == 'ar-EG' && (
        <View style={styles.tcomp99}>
          <CheckBox
            value={isSelected}
            onValueChange={vaue => {
              _this.setState({isSelected: vaue})
            }}
            style={styles.tCompo11}
          />
          <Text style={styles.pCompo3}>
            أوافق على استخدام هذه البيانات المسجلة لأغراض ضمان الجودة والتدريب
          </Text>
        </View>
      )}
    </View>
  )
}

export default Player
