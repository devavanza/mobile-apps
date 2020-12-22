import React, {useState, PureComponent, useRef} from 'react'
import ViewShot from 'react-native-view-shot'
import {RNCamera} from 'react-native-camera'
import res from './langResources'
import styles from './feedbackStyle'
import {View, Text, Dimensions, Picker} from 'react-native'

const Video = ({
  lang,
  type,
  selectedValue,
  camera,
  cameraState,
  isPlaying,
  timer,
  setState,
  error,
  _this,
}) => {
  return (
    <>
      <Text
        style={{
          textAlign: 'center',
          color: 'grey',
          padding: 5,
          fontSize: 15,
        }}>
        {res.resolve('HNRV', lang)}
      </Text>
      <>
        {type != 'text' && (
          <Picker
            selectedValue={selectedValue}
            //mode="dropdown"
            itemStyle={{padding: 0, margin: 0, left: 0, right: 0}}
            style={{
              height: 20,
              width: lang == 'ar-EG' ? Dimensions.get('window').width : 120,
              left:
                lang == 'ar-EG'
                  ? Dimensions.get('window').width / 2 - 60
                  : Dimensions.get('window').width / 2 - 60,
              color: '#0054ad',
              borderColor: '#333',
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
            _this.setState({cammLocal: ref})
            // camera = ref
          }}
          defaultTouchToFocus
          flashMode={cameraState.flashMode}
          mirrorImage={false}
          onFocusChanged={() => {}}
          onZoomChanged={() => {}}
          onCameraReady={res => console.log(res)}
          style={{
            height: Dimensions.get('window').height * 0.5,
            width: Dimensions.get('window').width * 0.5,
            marginTop: 25,
            marginLeft: Dimensions.get('window').width * 0.21,
            borderColor: 'rgba(0, 0, 0, 0.3)',
            borderWidth: 0,
            borderRadius: 1,
          }}
          type={RNCamera.Constants.Type.front}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        />
        {!isPlaying && (
          <Text
            style={{
              color: 'grey',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}>
            {timer + ' ' + res.resolve('secRem', lang)}
          </Text>
        )}
        {error && (
          <Text style={{color: 'red', fontStyle: 'italic'}}>{error}</Text>
        )}
      </View>
    </>
  )
}

export default Video
