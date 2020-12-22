import React from 'react'
import res from './langResources'
import styles from './feedbackStyle'
import {
  View,
  Text,
  Image,
  CheckBox,
  Button,
  Dimensions,
  TouchableOpacity,
  Picker,
} from 'react-native'


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
  _this
}) => {
  return (
    <>
      <View style={styles.container}>
        <View style={{...styles.controls}}>
          <Text
            style={{
              textAlign: 'center',
              color: 'grey',
              // fontStyle: 'italic',
              padding: 5,
              fontSize: 15,
            }}>
            {res.resolve('HNR', lang)}
          </Text>
          <>
            {type != 'text' && (
              <Picker
                itemStyle={{padding: 0, margin: 0, left: 0, right: 0}}
                selectedValue={selectedValue}
                //mode="dropdown"
                style={{
                  height: 20,
                  width: lang == 'ar-EG' ? Dimensions.get('window').width : 120,
                  left:
                    lang == 'ar-EG'
                      ? Dimensions.get('window').width / 2 - 60
                      : 0,
                  // right: lang == 'ar-EG' ? 20 : 0,
                  color: '#0054ad',
                  borderColor: '#333',
                  // backgroundColor: 'transparent',
                  // CenterContentStyle,
                }}
                onValueChange={(itemValue, itemIndex) => {
                  console.log(itemValue)
                  _this.setState({selectedValue: itemValue})
                }}>
                <Picker.Item
                  label={res.resolve('AR', lang)}
                  value='ar-EG'
                  // style={{ textAlign: 'center' }}
                />
                <Picker.Item
                  label={res.resolve('English', lang)}
                  value='en-US'
                />
                <Picker.Item label={res.resolve('Urdu', lang)} value='hi-IN' />
              </Picker>
            )}
          </>

          <TouchableOpacity
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              resizeMode: 'contain',
              marginTop: 5,
              marginLeft: '0%',
            }}
            onPressIn={() => {
              _this._record()
            }}
            onPressOut={() => {
              _this._stop()
            }}>
            <Image
              style={{
                width: '100%',
                height: '100%',
              }}
              source={require('../resouces/mic-audio.png')}
            />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              left: 0,
            }}>
            {!isPlaying && (
              <Text style={styles.progressText}>
                {60 - currentTime + ' ' + res.resolve('secRem', lang)}
              </Text>
            )}
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 10,
              }}
            />
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

        <Text style={{color: 'red', fontStyle: 'italic', padding: 22}}>
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
                width: Dimensions.get('window').width * 0.75,
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
                fontSize: 13,
                width: Dimensions.get('window').width * 0.7,
                // padding: 22,
              }}>
              أوافق على استخدام هذه البيانات المسجلة لأغراض ضمان الجودة والتدريب
            </Text>
          </View>
        )}
      </View>
    </>
  )
}

export default Audio
