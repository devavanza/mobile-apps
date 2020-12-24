import React, {useState, PureComponent, useRef} from 'react'
import {RNCamera} from 'react-native-camera'
import res from './langResources'
import styles from './feedbackStyle'
import {View, Text, Dimensions} from 'react-native'
import {Picker} from '@react-native-community/picker'
interface PropsVideo {
  lang: string
  type: string
  selectedValue: string
  cameraState: object
  isPlaying: boolean
  timer: int
  setState: object
  error: string
  _this: object
}
const Video = ({
  lang,
  type,
  selectedValue,
  cameraState,
  isPlaying,
  timer,
  setState,
  error,
  _this,
}: PropsVideo) => {
  return (
    <>
      <Text style={styles.tCompo1}>{res.resolve('HNRV', lang)}</Text>
      <>
        {type != 'text' && (
          <Picker
            selectedValue={selectedValue}
            itemStyle={styles.tCompo2}
            style={{
              ...styles.tCompo3,
              width: lang == 'ar-EG' ? Dimensions.get('window').width : 120,
              left:
                lang == 'ar-EG'
                  ? Dimensions.get('window').width / 2 - 60
                  : Dimensions.get('window').width / 2 - 60,
            }}
            onValueChange={(itemValue, itemIndex) => {
              console.log(itemValue)
              _this.setState({selectedValue: itemValue})
            }}>
            <Picker.Item label={res.resolve('AR', lang)} value='ar-EG' />
            <Picker.Item label={res.resolve('English', lang)} value='en-US' />
            <Picker.Item label={res.resolve('Urdu', lang)} value='hi-IN' />
          </Picker>
        )}
      </>

      <View
        styles={{
          flex: 1,
        }}>
        <RNCamera
          ref={ref => {
            // if (ref && ref.current)
            // _this.setState({cammLocal: ref})
            global.camera = ref
          }}
          defaultTouchToFocus
          flashMode={cameraState.flashMode}
          mirrorImage={false}
          onFocusChanged={() => {}}
          onZoomChanged={() => {}}
          onCameraReady={res => console.log(res)}
          style={styles.tCompo18}
          type={RNCamera.Constants.Type.front}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        />
        {!isPlaying && (
          <Text style={styles.tCompo17}>
            {timer + ' ' + res.resolve('secRem', lang)}
          </Text>
        )}
        {error && <Text style={styles.tCompo16}>{error}</Text>}
      </View>
    </>
  )
}

export default Video
