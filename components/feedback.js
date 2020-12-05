import React, {useState, PureComponent} from 'react'
import ViewShot from 'react-native-view-shot'
import Spinner from 'react-native-loading-spinner-overlay'
import res from './langResources'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  CheckBox,
  StatusBar,
  Button,
  TouchableHighlight,
  Dimensions,
  TouchableOpacity,
  Picker,
  Alert,
} from 'react-native'

import {Colors} from 'react-native/Libraries/NewAppScreen'
import axios from 'axios'
import {RNCamera} from 'react-native-camera'
import VideoPlayer from 'react-native-video-player'

import Sound from 'react-native-sound'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
let interval
var camera = null
export default class Feedback extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      path: '',
      label: res.resolve('submit', this.props.lang),
      camera: {
        type: RNCamera.Constants.Type.back,
        flashMode: RNCamera.Constants.FlashMode.auto,
      },
      currentTime: 0.0,
      recording: false,
      paused: false,
      stoppedRecording: false,
      finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
      hasPermission: undefined,
      nationality: '',
      gender: null,
      emotion: null,
      confidence: 0,
      age: '',
      timer: 60,
      mtop: 160,
      textValue: '',
      allEmotions: [],
    }
  }
  prepareRecordingPath (audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 16000,
      Channels: 1,
      AudioQuality: 'Low',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 16000,
    })
  }
  handleAccessToken = async () => {
    console.log(this.state.clientkey, this.state.clientSecret)
    return {
      clientkey: this.state.clientkey,
      clientSecret: this.state.clientSecret,
    }
  }
  setTextError (error) {
    this.setState({error: error})
  }
  componentDidMount () {
    this.setState({
      isRTL: this.props.lang == 'ar-EG',
      completed: false,
      selectedValue: this.props.lang,
      check: undefined,
      baseURL: this.props.baseURL,
      clientkey: this.props.clientkey,
      clientSecret: this.props.clientSecret,
    })
    if (this.props.type == 'video') {
      this.setState({mtop: 80})
    } else if (this.props.type == 'audio') {
      this.setState({mtop: 160})
    } else {
      this.setState({mtop: 160})
    }

    if (this.props.type == 'video') {
      this.setState({label: res.resolve('startRecord', this.props.lang)})
    }
    AudioRecorder.requestAuthorization().then(isAuthorised => {
      this.setState({hasPermission: isAuthorised})

      if (!isAuthorised) return

      this.prepareRecordingPath(this.state.audioPath)

      AudioRecorder.onProgress = data => {
        this.setState({currentTime: Math.floor(data.currentTime)})
      }

      AudioRecorder.onFinished = data => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === 'ios') {
          this._finishRecording(
            data.status === 'OK',
            data.audioFileURL,
            data.audioFileSize,
          )
        }
      }
    })
  }
  componentWillUnmount () {}

  _renderButton (title, onPress, active) {
    var style = active ? styles.activeButtonText : styles.buttonText

    return (
      <TouchableHighlight style={styles.button} onPress={onPress}>
        <Text style={style}>{title}</Text>
      </TouchableHighlight>
    )
  }

  _renderPauseButton (onPress, active) {
    var style = active ? styles.activeButtonText : styles.buttonText
    var title = this.state.paused ? 'RESUME' : 'PAUSE'
    return (
      <TouchableHighlight style={styles.button} onPress={onPress}>
        <Text style={style}>{title}</Text>
      </TouchableHighlight>
    )
  }

  async _pause () {
    if (!this.state.recording) {
      console.warn("Can't pause, not recording!")
      return
    }

    try {
      const filePath = await AudioRecorder.pauseRecording()
      this.setState({paused: true})
    } catch (error) {
      console.error(error)
    }
  }

  async _resume () {
    if (!this.state.paused) {
      console.warn("Can't resume, not paused!")
      return
    }

    try {
      await AudioRecorder.resumeRecording()
      this.setState({paused: false})
    } catch (error) {
      console.error(error)
    }
  }

  async _stop () {
    if (!this.state.recording) {
      console.warn("Can't stop, not recording!")
      return
    }

    this.setState({
      stoppedRecording: true,
      recording: false,
      paused: false,
      isPlaying: false,
    })

    try {
      const filePath = await AudioRecorder.stopRecording()

      if (Platform.OS === 'android') {
        this._finishRecording(true, filePath)
      }
      return filePath
    } catch (error) {
      console.error(error)
    }
  }

  async _play () {
    if (this.state.recording) {
      await this._stop()
    }

    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      var sound = new Sound(this.state.audioPath, '', error => {
        if (error) {
          console.log('failed to load the sound', error)
        }
      })

      setTimeout(
        (() => {
          this.setState({isPlaying: true})
          sound.play(success => {
            if (success) {
              this.setState({isPlaying: false})
              console.log('successfully finished playing')
            } else {
              console.log('playback failed due to audio decoding errors')
            }
          })
        }).bind(this),
        100,
      )
    }, 100)
  }

  handleSubmitAudio = async () => {
    this.setTextError(null)
    if (this.state.currentTime <= 5) {
      this.setTextError(res.resolve('SecAud', this.props.lang))
      this.setSubmitLoading(false)
    } else if (!this.state.stoppedRecording) {
      this.setTextError(res.resolve('PRA', this.props.lang))
    } else {
      this.setSubmitLoading(true)
      try {
        let filename = this.state.audioPath.replace(/^.*[\\\/]/, '')
        var bodyFormData = new FormData()
        bodyFormData.append('name', filename)
        console.log(this.state.audioPath, filename)
        // bodyFormData.append('file', audioFile)
        bodyFormData.append('file', {
          name: filename,
          uri: 'file://' + this.state.audioPath,
          type: 'audio/aac',
        })
        bodyFormData.append('type', 'A')
        bodyFormData.append('orgId', 'AFZ')
        bodyFormData.append('language', this.state.selectedValue)
        console.log(JSON.stringify(bodyFormData), this.state.baseURL)

        let responseInt = await axios({
          method: 'post',
          url: `${this.state.baseURL}/PUBLIC/Feedback/quickFeedback`,
          data: bodyFormData,
          timeout: 15000,
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(await this.handleAccessToken()),
          },
        })
        bodyFormData.append('interactionId', responseInt.data.interactionId)

        console.log(
          'upload response',
          `${this.state.baseURL}/PUBLIC/Feedback/quickFeedback`,
          JSON.stringify(responseInt.data),
        )
        if (responseInt.status == 200) {
          if (responseInt.data.errorCode && responseInt.data.errorCode == 201) {
            this.setTextError(responseInt.data.errorDescription)
            this.setSubmitLoading(false)
          } else {
            this.setTextError(null)
            if (responseInt.data.detectedMajorSentimentAudio) {
              switch (responseInt.data.detectedMajorSentimentAudio) {
                case 'negative':
                  this.setInteractionId(responseInt.data.interactionId, 'Sad')
                  this.setSubmitLoading(false)
                  break
                default:
                  this.setInteractionId(responseInt.data.interactionId)
                  this.setSubmitLoading(false)
                  break
              }
            } else {
              this.setInteractionId(responseInt.data.interactionId)
              this.setSubmitLoading(false)
            }

            await axios({
              method: 'post',
              url: `${this.state.baseURL}/PUBLIC/Feedback/uploadInteraction`,
              data: bodyFormData,
              headers: {
                'Content-Type': 'multipart/form-data',
                ...(await this.handleAccessToken()),
              },
            })
          }
        }
      } catch (err) {
        console.log('audio error------------', err.stack)
        this.setSubmitLoading(false)
        this.setTextError(res.resolve('ERECA', this.props.lang))
      }
    }
  }

  async _record () {
    if (this.state.recording) {
      console.warn('Already recording!')
      return
    }

    if (!this.state.hasPermission) {
      console.warn("Can't record, no permission granted!")
      return
    }

    if (this.state.stoppedRecording) {
      this.prepareRecordingPath(this.state.audioPath)
    }

    this.setState({recording: true, paused: false})

    try {
      const filePath = await AudioRecorder.startRecording()
    } catch (error) {
      console.error(error)
    }
  }
  setOther (flag, sentiment) {
    if (sentiment == 'positive') {
      this.setState({other: flag, check: 'otherpositive'})
    } else {
      this.setState({other: flag, check: 'other'})
    }
  }
  setCompleted (flag) {
    this.setState({completed: flag})
  }
  _finishRecording (didSucceed, filePath, fileSize) {
    this.setState({finished: didSucceed})
    console.log(
      `Finished recording of duration ${
        this.state.currentTime
      } seconds at path: ${filePath} and size of ${fileSize || 0} bytes`,
    )
  }

  handleSatisfaction = async (value, userEmotion) => {
    console.log('Satisfaction called', value, userEmotion)
    if (value != 'No') {
      this.setSubmitLoading(true)
    }
    let type
    switch (this.props.type) {
      case 'text':
        type = 'T'
        break
      case 'video':
        type = 'V'
        break
      case 'audio':
        type = 'A'
        break
    }
    if (value == 'No') {
      this.setOther(true, userEmotion)
    }
    if (value == 'Yes') {
      try {
        let intId = this.state.interactionId
        let response = await axios({
          method: 'post',
          url: `${this.state.baseURL}/PUBLIC/Feedback/submitInteraction`,
          data: {
            //   ...info,
            type,
            interactionId: intId,
            customerProvidedSentiment: userEmotion,
            // indexId:indexResposne.indexId,
          },
          headers: {
            'Content-Type': 'application/json',
            ...(await this.handleAccessToken()),
          },
        })
        console.log('Submit response---------------TEXT----->', response)
        if (response.status == 200) {
          this.setSubmitLoading(false)
          this.setCompleted(true)
          Alert.alert(
            res.resolve('alert', this.props.lang),
            res.resolve('feedSubmitted', this.props.lang),
          )
          this.props.endFlow()
        }
      } catch (err) {
        Alert.alert(
          res.resolve('alert', this.props.lang),
          res.resolve('feedSubmittedErr', this.props.lang),
        )
        this.setSubmitLoading(false)
      }
    }
  }

  setSubmitLoading (flag) {
    this.setState({flag: flag})
  }
  setInteractionId (id, sentiment = 'Happy') {
    console.log('HAAAAA')
    this.setState({
      interactionId: id,
      check: sentiment,
      type: undefined,
      showUploadVideo: false,
    })
  }
  componentWillUnmount () {
    clearInterval(interval)
  }
  handleFaceCapture = async uri => {
    try {
      let filename = uri.replace(/^.*[\\\/]/, '')
      let bodyFormData = new FormData()
      bodyFormData.append('file', {
        name: filename,
        uri: uri,
        type: 'image/png',
      })
      this.setState({captured: uri})
      // bodyFormData.append('file', file)
      console.log(
        'reqsent!',
        `${this.props.baseURL}/PUBLIC/Feedback/faceAttributes`,
      )
      let response = await axios({
        method: 'post',
        url: `${this.props.baseURL}/PUBLIC/Feedback/faceAttributes`,
        data: bodyFormData,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(await this.handleAccessToken()),
        },
      })
      console.log('response!', response)
      if (response.status == 200) {
        if (response.data.faceResponse.length > 0) {
          this.setState([
            ...this.state.faceResponses,
            ...[response.data.faceResponse.faceAttributes],
          ])
          aggregateFaceResponses([
            ...this.state.faceResponses,
            ...[response.data.faceResponse.faceAttributes],
          ])

          // setFaceResponses([...faceResponses,...[response.data.faceResponse.faceAttributes]]);
          // aggregateFaceResponses([...faceResponses,...[response.data.faceResponse.faceAttributes]]);
        }
      }
    } catch (err) {
      console.log('response!', err)
      console.log('Error in uploading face photo', err.stack)
    }
  }

  aggregateFaceResponses = faceResponses => {
    let emotion = {
      negative: 0,
      positive: 0,
      neutral: 0,
    }
    let confidence = 0
    let age = 0
    let gender = null
    let majorEmotion = null

    faceResponses.forEach(response => {
      console.log(response.emotion)
      gender = response.gender
      age += response.age
    })

    let response = faceResponses[faceResponses.length - 1]

    Object.keys(response.emotion).map(o => {
      if (
        o == 'anger' ||
        o == 'contempt' ||
        o == 'disgust' ||
        o == 'fear' ||
        o == 'sadness'
      ) {
        console.log('negtiave case---->', o)
        emotion['negative'] += response.emotion[o]
      } else if (o == 'happiness' || o == 'surprise') {
        console.log('postive case---->', o)
        emotion['positive'] += response.emotion[o]
      } else {
        console.log('neutral case---->', o)
        emotion['neutral'] += response.emotion[o]
      }
    })

    console.log('all scores---------->', emotion)
    console.log('total confidence')

    Object.keys(emotion).map(o => {
      console.log(o, 'emotion key')
      console.log(confidence, 'confidence')
      console.log(majorEmotion, 'majorEmotion')
      if (emotion[o] > confidence) {
        confidence = emotion[o]
        majorEmotion = o
      }
    })

    age = age / faceResponses.length

    console.log({
      ...info,
      age,
      gender,
      confidence: confidence * 100,
      emotion: majorEmotion,
    })

    allEmotions = [...allEmotions, ...[majorEmotion]]
    console.log('all Emotions----------->', allEmotions)
    // setAllEmotions(allEmotions1);

    this.setState({
      allEmotions,
      ...info,
      age,
      gender,
      confidence: confidence * 100,
      emotion: majorEmotion,
    })
  }
  handleSubmit = async () => {
    this.setTextError(null)

    if (!this.state.textValue) {
      this.setTextError(res.resolve('Fback', this.props.lang))
    } else {
      this.setSubmitLoading(true)
      try {
        console.log(
          JSON.stringify({
            method: 'post',
            url: `${this.state.baseURL}/PUBLIC/Feedback/quickFeedback`,
            data: {
              type: 'T',
              orgId: 'AFZ',
              language: this.state.selectedValue,
              textData: {
                documents: [
                  {
                    id: '1',
                    text: this.state.textValue,
                  },
                ],
              },
            },
            headers: {
              'Content-Type': 'application/json',
              ...(await this.handleAccessToken()),
            },
          }),
        )

        let response = await axios({
          method: 'post',
          url: `${this.state.baseURL}/PUBLIC/Feedback/quickFeedback`,
          data: {
            type: 'T',
            orgId: 'AFZ',
            language: this.state.selectedValue,
            textData: {
              documents: [
                {
                  id: '1',
                  text: this.state.textValue,
                },
              ],
            },
          },
          headers: {
            'Content-Type': 'application/json',
            ...(await this.handleAccessToken()),
          },
        })

        if (response.data) {
          console.log('text upload response', response.data)
          this.setSubmitLoading(false)
          if (response.data.errorCode == 201) {
            this.setTextError(response.data.errorDescription)
          } else {
            this.setTextError(null)
            switch (response.data.detectedMajorSentimentText) {
              case 'negative':
                this.setInteractionId(response.data.interactionId, 'Sad')
                break
              default:
                this.setInteractionId(response.data.interactionId)
                break
            }

            await axios({
              method: 'post',
              url: `${this.state.baseURL}/PUBLIC/Feedback/uploadInteraction`,
              data: {
                type: 'T',
                orgId: 'AFZ',
                interactionId: response.data.interactionId,
                textData: {
                  documents: [
                    {
                      id: '1',
                      text: this.state.textValue,
                    },
                  ],
                },
              },
              headers: {
                'Content-Type': 'application/json',
                ...(await this.handleAccessToken()),
              },
            })
          }
        }
      } catch (err) {
        console.log(err)
        this.setSubmitLoading(false)
        this.setTextError('Error in uploading Feedback')
      }
    }
  }
  rendertext (type) {
    switch (type) {
      case 'text':
        return (
          <>
            <View style={{flex: 1, padding: 10}}>
              <TextInput
                multiline={true}
                numberOfLines={10}
                style={{
                  ...styles.textArea,
                  textAlign: this.state.isRTL ? 'right' : 'left',
                }}
                value={this.state.textValue}
                placeholder={res.resolve('EnterFBack', this.props.lang)}
                maxLength={500}
                onChangeText={textValue => {
                  console.log(textValue)
                  //this.setState({ textValue });
                  console.log(String(this.state.textValue).length)
                  // if (String(this.state.textValue).length < 500) {
                  this.setState({textValue})
                  // }
                }}
              />
              <Text style={{color: 'grey', fontStyle: 'italic'}}>
                {500 - String(this.state.textValue).length}{' '}
                {res.resolve('CRemain', this.props.lang)}
              </Text>
              {this.state.error && (
                <Text style={{color: 'red', fontStyle: 'italic'}}>
                  {this.state.error}
                </Text>
              )}
            </View>
          </>
        )
      case 'player':
        return (
          <View style={{flex: 1, padding: 10}}>
            <VideoPlayer
              video={{uri: this.state.uri}}
              videoWidth={1600}
              videoHeight={900}
              thumbnail={{uri: 'https://i.picsum.photos/id/866/1600/900.jpg'}}
            />
            <Text style={{color: 'red', fontStyle: 'italic'}}>
              {this.state.error}
            </Text>
            {this.props.lang == 'en-US' && (
              <View
                style={{
                  flexDirection: 'row',
                  left: 10,
                }}>
                <CheckBox
                  value={this.state.isSelected}
                  onValueChange={vaue => {
                    this.setState({isSelected: vaue})
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
                  I consent usage of this recorded data for the purpose of
                  quality assurance.
                </Text>
              </View>
            )}
            {this.props.lang == 'ar-EG' && (
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 10,
                }}>
                <CheckBox
                  value={this.state.isSelected}
                  onValueChange={vaue => {
                    this.setState({isSelected: vaue})
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
                  أوافق على استخدام هذه البيانات المسجلة لأغراض ضمان الجودة
                  والتدريب
                </Text>
              </View>
            )}
          </View>
        )
      case 'audio':
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
                  {res.resolve('HNR', this.props.lang)}
                </Text>
                <>
                  {this.props.type != 'text' && (
                    <Picker
                      itemStyle={{padding: 0, margin: 0, left: 0, right: 0}}
                      selectedValue={this.state.selectedValue}
                      //mode="dropdown"
                      style={{
                        height: 20,
                        width:
                          this.props.lang == 'ar-EG'
                            ? Dimensions.get('window').width
                            : 120,
                        left:
                          this.props.lang == 'ar-EG'
                            ? Dimensions.get('window').width / 2 - 60
                            : 0,
                        // right: this.props.lang == 'ar-EG' ? 20 : 0,
                        color: '#0054ad',
                        borderColor: '#333',
                        // backgroundColor: 'transparent',
                        // CenterContentStyle,
                      }}
                      onValueChange={(itemValue, itemIndex) => {
                        console.log(itemValue)
                        this.setState({selectedValue: itemValue})
                      }}>
                      <Picker.Item
                        label={res.resolve('AR', this.props.lang)}
                        value='ar-EG'
                        // style={{ textAlign: 'center' }}
                      />
                      <Picker.Item
                        label={res.resolve('English', this.props.lang)}
                        value='en-US'
                      />
                      <Picker.Item
                        label={res.resolve('Urdu', this.props.lang)}
                        value='hi-IN'
                      />
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
                    this._record()
                  }}
                  onPressOut={() => {
                    this._stop()
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
                  {!this.state.isPlaying && (
                    <Text style={styles.progressText}>
                      {60 -
                        this.state.currentTime +
                        ' ' +
                        res.resolve('secRem', this.props.lang)}
                    </Text>
                  )}
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 10,
                    }}
                  />
                  {!this.state.isPlaying && (
                    <Button
                      title={res.resolve('Play', this.props.lang)}
                      color='rgb(94, 212, 228);'
                      onPress={() => {
                        // this.setState({isAudio: true, transparent: false})
                        this._play()
                      }}
                      disabled={!this.state.stoppedRecording}
                    />
                  )}
                  {/* {this.state.isPlaying && (
                    <Text style={styles.progressText}>
                      {' '}
                      {res.resolve('audPlaying', this.props.lang)}
                    </Text>
                  )} */}
                </View>
              </View>
              <Text style={{color: 'red', fontStyle: 'italic', padding: 22}}>
                {this.state.error}
              </Text>
              {this.props.lang == 'en-US' && (
                <View
                  style={{
                    flexDirection: 'row',
                    left: 10,
                  }}>
                  <CheckBox
                    value={this.state.isSelected}
                    onValueChange={vaue => {
                      this.setState({isSelected: vaue})
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
                    I consent usage of this recorded data for the purpose of
                    quality assurance.
                  </Text>
                </View>
              )}
              {this.props.lang == 'ar-EG' && (
                <View
                  style={{
                    flexDirection: 'row',
                    marginHorizontal: 10,
                  }}>
                  <CheckBox
                    value={this.state.isSelected}
                    onValueChange={vaue => {
                      this.setState({isSelected: vaue})
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
                    أوافق على استخدام هذه البيانات المسجلة لأغراض ضمان الجودة
                    والتدريب
                  </Text>
                </View>
              )}
            </View>
          </>
        )
      case 'video':
        return (
          <>
            <ViewShot ref='viewShot' options={{format: 'png', quality: 0.7}}>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'grey',
                  // fontStyle: 'italic',
                  padding: 5,
                  fontSize: 15,
                }}>
                {res.resolve('HNRV', this.props.lang)}
              </Text>
              <>
                {this.props.type != 'text' && (
                  <Picker
                    selectedValue={this.state.selectedValue}
                    //mode="dropdown"
                    itemStyle={{padding: 0, margin: 0, left: 0, right: 0}}
                    style={{
                      height: 20,
                      width:
                        this.props.lang == 'ar-EG'
                          ? Dimensions.get('window').width
                          : 120,
                      left:
                        this.props.lang == 'ar-EG'
                          ? Dimensions.get('window').width / 2 - 60
                          : Dimensions.get('window').width / 2 - 60,
                      // right: this.props.lang == 'ar-EG' ? 20 : 0,
                      color: '#0054ad',
                      borderColor: '#333',

                      // color: '#fff',
                      // backgroundColor: 'transparent',
                    }}
                    onValueChange={(itemValue, itemIndex) => {
                      console.log(itemValue)
                      this.setState({selectedValue: itemValue})
                    }}>
                    <Picker.Item
                      label={res.resolve('AR', this.props.lang)}
                      value='ar-EG'
                    />
                    <Picker.Item
                      label={res.resolve('English', this.props.lang)}
                      value='en-US'
                    />
                    <Picker.Item
                      label={res.resolve('Urdu', this.props.lang)}
                      value='hi-IN'
                    />
                  </Picker>
                )}
              </>

              <View
                styles={{
                  flex: 1,
                }}>
                <RNCamera
                  ref={ref => {
                    camera = ref
                  }}
                  defaultTouchToFocus
                  flashMode={this.state.camera.flashMode}
                  mirrorImage={false}
                  onFocusChanged={() => {}}
                  onZoomChanged={() => {}}
                  onCameraReady={res => console.log(res)}
                  style={{
                    // flex: 1,
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
                {!this.state.isPlaying && (
                  <Text
                    style={{
                      color: 'grey',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}>
                    {this.state.timer +
                      ' ' +
                      res.resolve('secRem', this.props.lang)}
                  </Text>
                )}
                {!this.state.error && (
                  <Text style={{color: 'red', fontStyle: 'italic'}}>
                    {this.state.error}
                  </Text>
                )}
              </View>
            </ViewShot>
          </>
        )
      // case 'audio':
      case 'Happy':
        return (
          <>
            <View style={styles.container}>
              <View style={styles.controls}>
                <View
                  style={{
                    width: 10,
                    height: 20,
                  }}
                />
                <Text
                  style={{
                    fontSize: 17,
                    // fontWeight: 900
                  }}>
                  {res.resolve('satisfied', this.props.lang)}
                </Text>
                <Image
                  style={styles.image}
                  source={
                    this.props.gender == 'female'
                      ? require('../resouces/woman-smile1.png')
                      : require('../resouces/man-smile1.png')
                  }
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // position: 'absolute',
                    width: Dimensions.get('window').width * 1,
                    height: 20,
                    marginTop: -50,
                    // display: 'flex',
                    // top: Dimensions.get('window').height * 0.30,
                    alignItems: 'center',
                    flexDirection:
                      this.props.lang == 'ar-EG' ? 'row-reverse' : 'row',
                  }}>
                  <Button
                    title={res.resolve('yes', this.props.lang)}
                    color='rgb(23, 98, 184)'
                    onPress={() => this.handleSatisfaction('Yes', 'positive')}
                    disabled={this.state.disabledVid}
                  />
                  <View
                    style={{
                      width: 10,
                      height: 10,
                    }}
                  />
                  <Button
                    title={res.resolve('no', this.props.lang)}
                    color='rgb(94, 212, 228)'
                    onPress={() => this.handleSatisfaction('No', 'negative')}
                    disabled={this.state.disabledVid}
                  />
                </View>
              </View>
              <View
                style={{
                  width: 10,
                  height: 20,
                }}
              />
            </View>
          </>
        )
      case 'Sad':
        // case 'text':
        return (
          <>
            <View style={styles.container}>
              <View style={styles.controls}>
                <View
                  style={{
                    width: 10,
                    height: 20,
                  }}
                />
                <Text
                  style={{
                    fontSize: 17,
                    // fontWeight: 900
                  }}>
                  {res.resolve('unsatisfied', this.props.lang)}
                </Text>
                <Image
                  style={styles.image}
                  source={
                    this.props.gender == 'female'
                      ? require('../resouces/woman-smile3.png')
                      : require('../resouces/man-smile3.png')
                  }
                />

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'centxer',
                    // position: 'absolute',
                    width: Dimensions.get('window').width * 1,
                    height: 20,
                    marginTop: -50,
                    // display: 'flex',
                    // top: Dimensions.get('window').height * 0.30,
                    alignItems: 'center',
                    flexDirection:
                      this.props.lang == 'ar-EG' ? 'row-reverse' : 'row',
                  }}>
                  <Button
                    title={res.resolve('yes', this.props.lang)}
                    color='rgb(23, 98, 184)'
                    style={{
                      width: 10,
                      height: 10,
                    }}
                    onPress={() => this.handleSatisfaction('Yes', 'negative')}
                    disabled={this.state.disabledVid}
                  />
                  <View
                    style={{
                      width: 10,
                      height: 10,
                    }}
                  />

                  <Button
                    title={res.resolve('no', this.props.lang)}
                    color='rgb(94, 212, 228)'
                    style={{
                      width: 10,
                      height: 10,
                    }}
                    onPress={() => this.handleSatisfaction('No', 'positive')}
                    disabled={this.state.disabledVid}
                  />
                </View>
              </View>
              <View
                style={{
                  width: 10,
                  height: 20,
                }}
              />
            </View>
          </>
        )
      case 'other':
        // case 'text':
        return (
          <>
            <View style={styles.container}>
              <View style={{...styles.controls}}>
                <View
                  style={{
                    width: 10,
                    height: 20,
                  }}
                />
                <Text
                  style={{
                    fontSize: 17,
                    // fontWeight: 900
                  }}>
                  {res.resolve('providefeed', this.props.lang)}
                </Text>
                {/* <Image
                  style={styles.image}
                  source={require('../resouces/man-smile1.png')}
                /> */}
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 210,
                }}>
                <View style={{width: 150, height: 150, textAlign: 'center'}}>
                  <TouchableOpacity
                    onPress={() => this.handleSatisfaction('Yes', 'neutral')}>
                    <Image
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 100,
                        resizeMode: 'contain',
                      }}
                      source={
                        this.props.gender == 'female'
                          ? require('../resouces/woman-smile2.png')
                          : require('../resouces/man-smile2.png')
                      }
                    />
                    <Text
                      style={{
                        textAlign: 'center',
                        marginLeft: Dimensions.get('window').width * 0.03,
                      }}>
                      {res.resolve('ok', this.props.lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    width: 10,
                    height: 10,
                  }}
                />
                <View style={{width: 150, height: 150}}>
                  <TouchableOpacity
                    onPress={() => this.handleSatisfaction('Yes', 'negative')}>
                    <Image
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 100,
                        resizeMode: 'contain',
                      }}
                      source={
                        this.props.gender == 'female'
                          ? require('../resouces/woman-smile3.png')
                          : require('../resouces/man-smile3.png')
                      }
                    />
                    <Text
                      style={{
                        textAlign: 'center',
                        marginLeft: Dimensions.get('window').width * 0.03,
                        height: 20,
                      }}>
                      {res.resolve('sad', this.props.lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  width: 10,
                  height: 20,
                }}
              />
            </View>
          </>
        )
      case 'otherpositive':
        // case 'text':
        return (
          <>
            <View style={styles.container}>
              <View style={styles.controls}>
                <View
                  style={{
                    width: 10,
                    height: 20,
                  }}
                />
                <Text
                  style={{
                    fontSize: 17,
                    // fontWeight: 900
                  }}>
                  {res.resolve('providefeed', this.props.lang)}
                </Text>
                {/* <Image
                    style={styles.image}
                    source={require('../resouces/man-smile1.png')}
                  /> */}
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 210,
                }}>
                <View style={{width: 150, height: 150, textAlign: 'center'}}>
                  <TouchableOpacity
                    onPress={() => this.handleSatisfaction('Yes', 'happy')}>
                    <Image
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 100,
                        resizeMode: 'contain',
                      }}
                      source={
                        this.props.gender == 'female'
                          ? require('../resouces/woman-smile1.png')
                          : require('../resouces/man-smile1.png')
                      }
                    />
                    <Text
                      style={{
                        textAlign: 'center',
                        marginLeft: Dimensions.get('window').width * 0.03,
                        height: 20,
                      }}>
                      {res.resolve('happy', this.props.lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    width: 10,
                    height: 10,
                  }}
                />
                <View style={{width: 150, height: 150}}>
                  <TouchableOpacity
                    onPress={() => this.handleSatisfaction('Yes', 'negative')}>
                    <Image
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 100,
                        resizeMode: 'contain',
                      }}
                      source={
                        this.props.gender == 'female'
                          ? require('../resouces/woman-smile2.png')
                          : require('../resouces/man-smile2.png')
                      }
                    />
                    <Text
                      style={{
                        textAlign: 'center',
                        marginLeft: Dimensions.get('window').width * 0.03,
                        height: 20,
                      }}>
                      {res.resolve('ok', this.props.lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  width: 10,
                  height: 50,
                }}
              />
            </View>
          </>
        )
    }
  }

  async startRecording () {
    console.log('start')
    if (this.state.showUploadVideo == true) {
      this.setState({
        type: 'video',
        // timer: 60,
        label: res.resolve('startRecord', this.props.lang),
        showUploadVideo: false,
      })
    } else if (!this.state.recording) {
      this.setState({
        recording: true,
        timer: 60,
      })
      console.log('i am here')
      interval = setInterval(
        (() => {
          if (this.state.timer % 5 == 0) {
            this.refs.viewShot.capture().then(uri => {
              if (uri) {
                console.log('captured ', uri)
                this.handleFaceCapture(uri)
              } else {
                clearInterval(interval)
              }
            })
            // this.handleFaceCapture()
          }
          if (this.state.timer == 0) {
            clearInterval(interval)
            this.stopRecording()
          } else {
            console.log(this.state.timer - 1)
            this.setState({
              timer: this.state.timer - 1,
              label: `${res.resolve('StopRecording', this.props.lang)}`,
            })
          }
        }).bind(this),
        1000,
      )
      const options = {quality: RNCamera.Constants.VideoQuality["4:3"]}
      const {uri, codec = 'mp4'} = await camera.recordAsync(options)
      console.log('URI>>>>>>', uri)

      this.setState({
        uri,
        type: 'player',
        label: res.resolve('ReRecord', this.props.lang),
        recording: false,
        showUploadVideo: true,
      })
    } else {
      clearInterval(interval)
      this.stopRecording()
    }
  }

  async stopRecording () {
    this.setState({recording: false, stopped: true})
    camera.stopRecording()
  }
  switchText () {
    console.log('stopped')
    this.setState({type: 'text', mtop: 160})
  }
  switchVideo () {
    console.log('stopped')
    this.setState({
      type: 'video',
      recording: false,
      mtop: 80,
      label: res.resolve('startRecord', this.props.lang),
    })
    console.log('stopped', JSON.stringify(this.state))
  }
  switchAudio () {
    console.log('stopped')
    this.setState({type: 'audio', mtop: 160})
  }
  setRecorded (flag) {
    this.setState({showUploadVideo: flag})
  }
  handleSubmitVideo = async () => {
    this.setTextError(null)
    console.log(this.state.timer)
    if (this.state.timer >= 55) {
      console.log('ERROR', res.resolve('SecVide', this.props.lang))
      this.setTextError(res.resolve('SecVide', this.props.lang))
    } else if (!this.state.showUploadVideo) {
      this.setTextError(res.resolve('PRV', this.props.lang))
    } else {
      this.setSubmitLoading(true)
      try {
        let bodyFormData = new FormData()
        // bodyFormData.append('file', captured);
        let filename = this.state.captured.replace(/^.*[\\\/]/, '')
        bodyFormData.append('file', {
          name: filename,
          uri: this.state.captured,
          type: 'image/png',
        })
        bodyFormData.append('type', 'V')

        let response = await axios({
          method: 'post',
          url: `${this.state.baseURL}/PUBLIC/Feedback/quickFeedback`,
          data: bodyFormData,
          headers: {
            ...(await this.handleAccessToken()),
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.status == 200) {
          console.log(
            response.data,
            'DFFFFFFFFFFFFFFFFFFFFFFFF',
            JSON.stringify(bodyFormData),
          )

          if (!this.state.allEmotions.length) {
            let allEmotions = [response.data.emotion]
            this.setState({
              allEmotions,
              ...this.state.info,
              age: response.data.age,
              gender: response.data.gender,
              emotion: response.data.emotion,
            })
          }

          try {
            var bodyFormData1 = new FormData()
            let filename = this.state.uri.replace(/^.*[\\\/]/, '')
            // uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
            bodyFormData1.append('name', filename)
            bodyFormData1.append('file', {
              name: filename,
              uri: this.state.uri,
              type: 'video/mp4',
            })
            bodyFormData1.append('orgId', 'AFZ')
            bodyFormData1.append('type', 'V')
            bodyFormData1.append('language', this.state.selectedValue)

            bodyFormData1.append('interactionId', response.data.interactionId)

            this.setRecorded(false)
            console.log(
              JSON.stringify({
                method: 'post',
                url: `${this.state.baseURL}/PUBLIC/Feedback/uploadInteraction`,
                data: bodyFormData1,
                headers: {
                  'Content-Type': 'multipart/form-data',
                  ...(await this.handleAccessToken()),
                },
              }),
            )
            setImmediate(async ()=>{
              await axios({
                method: 'post',
                url: `${this.state.baseURL}/PUBLIC/Feedback/uploadInteraction`,
                data: bodyFormData1,
                headers: {
                  'Content-Type': 'multipart/form-data',
                  ...(await this.handleAccessToken()),
                },
              })

            // console.log('upload response', response1)
            });


            if (this.state.allEmotions.includes('negative')) {Î
              this.setState({emotion: 'negative'})
              this.setInteractionId(response.data.interactionId, 'Sad')
            } else if (
              this.state.allEmotions.includes('positive') &&
              this.state.allEmotions.includes('neutral') &&
              !this.state.allEmotions.includes('negative')
            ) {
              this.setState({ emotion: 'positive'})
              this.setInteractionId(response.data.interactionId)
            } else {
              this.setState({ emotion: 'positive'})
              this.setInteractionId(response.data.interactionId)
            }
            this.setSubmitLoading(false)
           
          } catch (err) {
            console.log('Error in uploading Video first', err)
            this.setSubmitLoading(false)
          }
        }
      } catch (err) {
        console.log('Error in uploading Video second', err)
        this.setSubmitLoading(false)
        this.setTextError(res.resolve('EUV', this.props.lang))
      }
    }
  }

  render () {
    return (
      <>
        <Spinner
          visible={this.state.flag}
          textContent={res.resolve('PWT', this.props.lang)}
          textStyle={{color: '#FFF'}}
          animation='fade'
          overlayColor='#00336777'
        />
        <StatusBar barStyle='dark-content' />
        <SafeAreaView style={{marginTop: this.state.mtop}}>
          <ScrollView
            contentInsetAdjustmentBehavior='automatic'
            style={[
              styles.scrollView,
              this.state.isRTL && {transform: [{scaleX: -1}]},
            ]}>
            <View
              style={{
                backgroundColor: '#FFF',
                elevation: 5,
                padding: 10,
                borderColor: 'rgba(0, 0, 0, 0.12)',
                borderWidth: 2,
                padding: 0,
                // borderStyle: 'solid',
                borderRadius: 10,
                width: Dimensions.get('window').width * 0.93,
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row-reverse',
                }}>
                <View
                  style={{
                    width: '10%',
                    height: 50,
                    // backgroundColor: 'powderblue',
                  }}>
                  <TouchableOpacity
                    style={{
                      top: 7,
                      left: this.state.isRTL ? 'auto' : 0,
                      right: this.state.isRTL ? 10 : 'auto',

                      // left: this.state.isRTL ? 10 : 0,
                    }}
                    onPress={() => {
                      this.props.endFlow()
                    }}>
                    <Image
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 100,
                        resizeMode: 'contain',
                      }}
                      source={require('../resouces/close_blue.png')}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    // color: 'rgb(94, 212, 228)',
                    width: '90%',
                    height: 50,
                    right: this.state.isRTL ? 10 : 0,
                  }}>
                  <Text
                    style={{
                      color: '#0054ad',
                      fontSize: 18,
                      top: 10,
                      left: this.state.isRTL ? 0 : 10,
                    }}>
                    {res.resolve('snf', this.props.lang)}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  // borderColor: 'rgb(94, 212, 228)',
                  borderBottomColor: 'rgba(0, 0, 0, 0.2)',
                  borderBottomWidth: 1,
                }}
              />

              {this.rendertext(
                this.state.type || this.state.check || this.props.type,
              )}

              <View style={{flexDirection: 'row'}}>
                {this.props.type == 'text' &&
                  !this.state.check &&
                  !this.state.completed && (
                    <View style={{flex: 1, padding: 10}}>
                      <Button
                        title={this.state.label}
                        color='rgb(23, 98, 184);'
                        onPress={this.handleSubmit.bind(this)}
                        style={styles.buttonFrm}
                      />
                    </View>
                  )}
                {this.props.type == 'audio' &&
                  !this.state.check &&
                  !this.state.completed && (
                    <View style={{flex: 1, padding: 10}}>
                      <Button
                        title={res.resolve('submitFeedback', this.props.lang)}
                        color='rgb(23, 98, 184);'
                        disabled={!this.state.isSelected}
                        onPress={this.handleSubmitAudio.bind(this)}
                        style={styles.buttonFrm}
                      />
                    </View>
                  )}

                {this.props.type == 'video' &&
                  !this.state.check &&
                  !this.state.completed && (
                    <View style={{flex: 1, padding: 10}}>
                      <Button
                        title={this.state.label}
                        color='rgb(23, 98, 184);'
                        onPress={this.startRecording.bind(this)}
                        disabled={
                          this.state.disabledVid
                          // ? !this.state.isSelected
                          // : true
                        }
                        style={styles.buttonFrm}
                      />
                    </View>
                  )}
                {this.state.showUploadVideo &&
                  !this.state.check &&
                  !this.state.completed && (
                    <View style={{flex: 1, padding: 10}}>
                      <Button
                        title={res.resolve('submitFeedback', this.props.lang)}
                        color='rgb(23, 98, 184);'
                        onPress={this.handleSubmitVideo.bind(this)}
                        disabled={
                          this.state.disabledVid || !this.state.isSelected
                        }
                        style={styles.buttonFrm}
                      />
                    </View>
                  )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    )
  }
}

const styles = StyleSheet.create({
  btnAlignment: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  scrollView: {
    // backgroundColor: Colors.lighter,
  },
  buttonFrm: {
    marginTop: 20,
    padding: 20,
  },
  textArea: {
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    textAlignVertical: 'top',
    padding: 5,
    justifyContent: 'flex-start',
    // borderStyle: 'solid',
    borderRadius: 1,
  },
  imageEmotion: {
    marginTop: 20,
    top: 310,
    bottom: 310,
    left: 240,
    right: 85,
    opacity: 1,
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'contain',
    borderRadius: 100,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  image: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 285,
    marginTop: -50,
    // marginLeft: -25,
    transform: [{scale: 0.5}],
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  controls: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  progressText: {
    paddingTop: 6,
    fontSize: 15,
    color: '#777',
  },
  button: {
    padding: 20,
    backgroundColor: '#000',
  },
  disabledButtonText: {
    color: '#eee',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
  activeButtonText: {
    fontSize: 20,
    color: '#B81F00',
  },
})
