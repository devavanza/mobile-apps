import React from 'react'
import {View, Text, CheckBox, Dimensions} from 'react-native'
import VideoPlayer from 'react-native-video-player'
import styles from './feedbackStyle'
const Player = ({lang, uri, error, isSelected, setState,_this}) => {
  return (
    <View style={{flex: 1, padding: 10}}>
      <VideoPlayer
        video={{uri: uri}}
        videoWidth={1600}
        videoHeight={900}
      />
      <Text style={{color: 'red', fontStyle: 'italic'}}>
        {error}
      </Text>
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
            // style={styles.checkbox}
          />
          <Text
            style={{
              color: 'grey',
              fontStyle: 'italic',
              fontSize: 12,
              width: Dimensions.get('window').width * 0.7,
              // padding: 22,
            }}>
            I consent usage of this recorded data for the purpose of quality
            assurance.
          </Text>
        </View>
      )}
      {lang == 'ar-EG' && (
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 10,
          }}>
          <CheckBox
            value={isSelected}
            onValueChange={vaue => {
              _this.setState({isSelected: vaue})
            }}
            style={{top: 3}}
          />
          <Text
            style={{
              color: 'grey',
              // fontStyle: 'italic',
              fontSize: 15,
              width: Dimensions.get('window').width * 0.7,
              // padding: 22,
            }}>
            أوافق على استخدام هذه البيانات المسجلة لأغراض ضمان الجودة والتدريب
          </Text>
        </View>
      )}
    </View>
  )
}

export default Player
