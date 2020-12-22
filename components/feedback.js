import React, {useState, PureComponent} from 'react'
import ViewShot from 'react-native-view-shot'
import Spinner from 'react-native-loading-spinner-overlay'
import res from './langResources'
import styles from './feedbackStyle'
import Audio from './renderAudio'
import Player from './renderPlayer'
import TextCompo from './renderText'
import Video from './renderVideo'
import api from './api'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
  Button,
  TouchableHighlight,
  Dimensions,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
} from 'react-native'

import {Colors} from 'react-native/Libraries/NewAppScreen'
import axios from 'axios'
import {RNCamera} from 'react-native-camera'
import PropTypes from 'prop-types'
import Sound from 'react-native-sound'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
var interval
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
    this.handleSubmitAudio = api.handleSubmitAudio.bind(this)
    this.handleSubmit = api.handleSubmit.bind(this)
    this.handleSubmitVideo = api.handleSubmitVideo.bind(this)
    // this.setTextError=this.setTextError.bind(this)
    // this.aggregateFaceResponses = api.aggregateFaceResponses.bind(this)
    // this.handleFaceCapture = api.handleFaceCapture.bind(this)
  }
  componentDidMount () {
    // this.requestLocationPermission()
  }
  componentWillUnmount () {
    clearInterval(interval)
  }
  async grantPermission (perm, msg) {
    const granted = await PermissionsAndroid.request(perm, {
      title: 'Feedback form',
      message: `Feedback form wants to access ${msg} `,
    })

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log(`You can use the ${msg}`)
      alert(`You can use the ${msg}`)
    } else {
      console.log(`${msg} permission denied`)
      alert(`${msg} permission denied`)
    }
  }

  async requestLocationPermission () {
    try {
      this.grantPermission(PermissionsAndroid.PERMISSIONS.INTERNET, 'camera')
      this.grantPermission(PermissionsAndroid.PERMISSIONS.CAMERA, 'camera')
      this.grantPermission(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        'camera',
      )
      this.grantPermission(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        'camera',
      )
      this.grantPermission(
        PermissionsAndroid.PERMISSIONS.READ_INTERNAL_STORAGE,
        'camera',
      )
    } catch (err) {
      console.warn(err)
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
      this.setState({mtop: 80})
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

  rendertext (type) {
    switch (type) {
      case 'text':
        return (
          <TextCompo
            lang={this.props.lang}
            type={this.props.type}
            _this={this}
            isRTL={this.state.isRTL}
            textValue={this.state.textValue}
            setState={this.setState}
          />
        )
      case 'player':
        return (
          <Player
            lang={this.props.lang}
            type={this.props.type}
            uri={this.state.uri}
            isSelected={this.state.isSelected}
            setState={this.setState}
            _this={this}
          />
        )
      case 'audio':
        return (
          <Audio
            lang={this.props.lang}
            type={this.props.type}
            selectedValue={this.state.selectedValue}
            isPlaying={this.state.isPlaying}
            isSelected={this.state.isSelected}
            stoppedRecording={this.state.stoppedRecording}
            error={this.state.error}
            currentTime={this.state.currentTime}
            setTextError={this.setTextError}
            setState={this.setState}
            _this={this}
          />
        )
      case 'video':
        return (
          <ViewShot ref='viewShot' options={{format: 'png', quality: 0.7}}>
            <Video
              lang={this.props.lang}
              type={this.props.type}
              selectedValue={this.state.selectedValue}
              cameraState={this.state.camera}
              camera={camera}
              error={this.state.error}
              isPlaying={this.state.isPlaying}
              timer={this.state.timer}
              setState={this.setState}
              _this={this}
            />
          </ViewShot>
        )
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
                  }}>
                  {res.resolve('providefeed', this.props.lang)}
                </Text>
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
      const options = {quality: RNCamera.Constants.VideoQuality['4:3']}
      const {uri, codec = 'mp4'} = await this.state.cammLocal.recordAsync(
        options,
      )
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
    this.state.cammLocal.stopRecording()
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

  setSubmitLoading (flag) {
    this.setState({flag: flag})
  }
  setInteractionId (id, sentiment = 'Happy') {
    console.log('HAAAAA')
    console.log('upload response', sentiment)
    this.setState({
      interactionId: id,
      check: sentiment,
      type: undefined,
      showUploadVideo: false,
    })
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
            emotion: this.state.emotion ? this.state.emotion : null,
            confidence: this.state.confidence ? this.state.confidence : null,
            age: this.state.age ? this.state.age : null,
            gender: this.state.gender ? this.state.gender : null,
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

  handleFaceCapture = async uri => {
    try {
      let filename = uri.replace(/^.*[\\\/]/, '')
      let bodyFormData = new FormData()
      bodyFormData.append('file', {
        name: filename,
        uri: uri,
        type: 'image/png',
      })

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
        this.setState({captured: uri})
        // console.log('response.data.faceResponse.length!', response.data.faceResponse.length)
        this.aggregateFaceResponses([response.data.faceResponse.faceAttributes])
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
    let majorEmotion = 'neutral'

    faceResponses.forEach(response => {
      if (response) {
        gender = response.gender || 'male'
        age += response.age || 20
      } else {
        gender = 'male'
        age += 20
      }
    })

    let response = faceResponses[faceResponses.length - 1]
    if (response) {
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
    }
    console.log('all scores---------->', emotion)
    console.log('total confidence')

    Object.keys(emotion).map(o => {
      console.log(o, 'emotion key')
      console.log(confidence, 'confidence')
      console.log(majorEmotion, 'majorEmotion')
      if (emotion[o] > confidence && o != 'neutral') {
        confidence = emotion[o]
        majorEmotion = o
      }
    })

    age = age / faceResponses.length

    console.log({
      age,
      gender,
      confidence: confidence * 100,
      emotion: majorEmotion,
    })

    let allEmotions = [...this.state.allEmotions, ...[majorEmotion]]
    console.log('all Emotions----------->', allEmotions)
    this.setState({
      allEmotions,
      age,
      gender,
      confidence: confidence * 100,
      emotion: majorEmotion,
    })
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
                        onPress={this.handleSubmit}
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
                        onPress={this.handleSubmitAudio}
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
                        onPress={this.handleSubmitVideo}
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

Feedback.propTypes = {
  type: PropTypes.string,
  gender: PropTypes.string,
  baseURL: PropTypes.string,
  lang: PropTypes.string,
  endFlow: PropTypes.func,
  clientkey: PropTypes.string,
  clientSecret: PropTypes.string,
}
