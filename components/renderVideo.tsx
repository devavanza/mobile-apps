import React, {useState, PureComponent, useRef} from 'react'
import {RNCamera} from 'react-native-camera'
import res from './langResources'
import styles from './feedbackStyle'
import {View, Text} from 'react-native'
import Dropdown from './dropdown'

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
      <View style={{...styles.controls}}>
        {type != 'text' && (

          <Dropdown
            icon='chevron-down'
            iconColor='#fff'
            itemTextStyle={{textAlign: 'center'}}
            label={res.resolve('Lang', lang)}
            useNativeDriver={true}
            value={selectedValue}
            onChangeText={(itemValue, itemIndex) => {
              console.log(itemValue)
              _this.setState({selectedValue: itemValue})
            }}
            overlayStyle={{backgroundColor: 'rgba(0, 0, 0, 0.87)'}}
            dropdownPosition={-4.5}
            dropdownOffset={{
              top: 32,
              left: lang == 'ar-EG' ? undefined : 0,
            }}
            style={{
              ...styles.tCompo3,
              height: 50,
              width: 150,
            }}
            data={[
              {
                label: res.resolve('English', lang),
                value: 'en-US',
              },
              {
                label: res.resolve('AR', lang),
                value: 'ar-EG',
              },
              {
                label: res.resolve('Urdu', lang),
                value: 'hi-IN',
              },
            ]}
          />
        )}
      </View>

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
