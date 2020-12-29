import React from 'react'
import res from './langResources'
import styles from './feedbackStyle'
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  // Picker,
} from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import FastImage from 'react-native-fast-image'
import Dropdown from './dropdown'

interface PropsAudio {
  lang: string
  type: string
  selectedValue: string
  isPlaying: boolean
  isSelected: boolean
  currentTime: int
  stoppedRecording: boolean
  error: string
  setState: object
  _this: object
}
const Audio = ({
  lang,
  type,
  selectedValue,
  isPlaying,
  isSelected,
  currentTime,
  stoppedRecording,
  error,
  setState,
  _this,
}: PropsAudio) => {
  // alert(lang)
  return (
    <>
      <View style={styles.container}>
        <View style={{...styles.controls}}>
          <Text style={styles.tCompo1}>{res.resolve('HNR', lang)}</Text>
          <View
            style={{
              marginHorizontal: 4,
              marginVertical: 8,
              paddingHorizontal: 8,
            }}>
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

          <TouchableOpacity
            style={styles.tCompo4}
            onPressIn={() => {
              _this._record()
            }}
            onPressOut={() => {
              _this._stop()
            }}>
            <FastImage
              style={styles.tCompo5}
              source={require('../resouces/mic-audio.png')}
            />
          </TouchableOpacity>

          <View style={styles.tCompo6}>
            {!isPlaying && (
              <Text style={styles.progressText}>
                {60 - currentTime + ' ' + res.resolve('secRem', lang)}
              </Text>
            )}
            <View style={styles.tCompo7} />
            {!isPlaying && (
              <Button
                title={res.resolve('Play', lang)}
                color='rgb(94, 212, 228);'
                onPress={() => {
                  _this._play()
                }}
                disabled={!stoppedRecording}
              />
            )}
          </View>
        </View>

        <Text style={styles.tCompo8}>{error}</Text>
        {lang == 'en-US' && (
          <View style={styles.tCompo9}>
            <CheckBox
              value={isSelected}
              onValueChange={vaue => {
                _this.setState({isSelected: vaue})
              }}
            />
            <Text style={styles.tCompo10}>
              I consent usage of this recorded data for the purpose of quality
              assurance.
            </Text>
          </View>
        )}
        {lang == 'ar-EG' && (
          <View style={styles.tCompo9}>
            <CheckBox
              value={isSelected}
              onValueChange={vaue => {
                _this.setState({isSelected: vaue})
              }}
              style={styles.tCompo11}
            />
            <Text style={styles.tCompo13}>
              أوافق على استخدام هذه البيانات المسجلة لأغراض ضمان الجودة والتدريب
            </Text>
          </View>
        )}
      </View>
    </>
  )
}

export default Audio
