import React from 'react'
import res from './langResources'
import styles from './feedbackStyle'
import {
  View,
  Text,
  Image,
  Button,
  Dimensions,
  TouchableOpacity,
  // Picker,
} from 'react-native'
import {Picker} from '@react-native-community/picker'
import CheckBox from '@react-native-community/checkbox'
import FastImage from 'react-native-fast-image'

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
}) => {
  return (
    <>
      <View style={styles.container}>
        <View style={{...styles.controls}}>
          <Text style={styles.tCompo1}>{res.resolve('HNR', lang)}</Text>
          <>
            {type != 'text' && (
              <Picker
                itemStyle={styles.tCompo2}
                selectedValue={selectedValue}
                style={{
                  ...styles.tCompo3,
                  width: lang == 'ar-EG' ? Dimensions.get('window').width : 120,
                  left:
                    lang == 'ar-EG'
                      ? Dimensions.get('window').width / 2 - 60
                      : 0,
                }}
                onValueChange={(itemValue, itemIndex) => {
                  console.log(itemValue)
                  _this.setState({selectedValue: itemValue})
                }}>
                <Picker.Item label={res.resolve('AR', lang)} value='ar-EG' />
                <Picker.Item
                  label={res.resolve('English', lang)}
                  value='en-US'
                />
                <Picker.Item label={res.resolve('Urdu', lang)} value='hi-IN' />
              </Picker>
            )}
          </>

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
