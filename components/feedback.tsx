import React, {useState, PureComponent, Component} from 'react'
import ViewShot from 'react-native-view-shot'
import Spinner from 'react-native-loading-spinner-overlay'
import res from './langResources'
import styles from './feedbackStyle.ts'
import Audio from './renderAudio'
import Player from './renderPlayer'
import TextCompo from './renderText'
import Video from './renderVideo'
import api from './api'
import FastImage from 'react-native-fast-image'

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
  Button,
  TouchableHighlight,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native'
import {RNCamera} from 'react-native-camera'
import Sound from 'react-native-sound'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
import PropTypes from 'prop-types';

var interval;
global.camera=null;
export default class Feedback extends Component {
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
    this.requestLocationPermission()
    this.handleSatisfaction = api.handleSatisfaction.bind(this)
    this.handleFaceCapture = api.handleFaceCapture.bind(this)
  }
  async componentDidMount () {}
  componentWillUnmount () {
    clearInterval(interval)
  }
  async grantPermission (perm, msg) {
    let granted = await PermissionsAndroid.request(perm, {
      title: 'Feedback form',
      message: `Feedback form wants to access ${msg} `,
    })

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log(`You can use the ${msg}`)
    } else {
      console.log(`${msg} permission denied`)
      alert(`${msg} permission denied`)
    }
  }

  async requestLocationPermission () {
    try {
      this.grantPermission(PermissionsAndroid.PERMISSIONS.CAMERA, 'CAMERA')
      this.grantPermission(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        'RECORD AUDIO',
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
                <View style={styles.linebreak} />
                <Text style={styles.happyStyle}>
                  {res.resolve('satisfied', this.props.lang)}
                </Text>

                <FastImage
                  style={styles.image}
                  source={
                    this.props.gender == 'female'
                      ? require('../resouces/woman-smile1.png')
                      : require('../resouces/man-smile1.png')
                  }
                />
                <View
                  style={{
                    ...styles.yesNoStyle,
                    flexDirection:
                      this.props.lang == 'ar-EG' ? 'row-reverse' : 'row',
                  }}>
                  <Button
                    title={res.resolve('yes', this.props.lang)}
                    color='rgb(23, 98, 184)'
                    onPress={() => this.handleSatisfaction('Yes', 'positive')}
                    disabled={this.state.disabledVid}
                  />
                  <View style={styles.linebreakSml} />
                  <Button
                    title={res.resolve('no', this.props.lang)}
                    color='rgb(94, 212, 228)'
                    onPress={() => this.handleSatisfaction('No', 'negative')}
                    disabled={this.state.disabledVid}
                  />
                </View>
              </View>
              <View style={styles.linebreak} />
            </View>
          </>
        )
      case 'Sad':
        return (
          <>
            <View style={styles.container}>
              <View style={styles.controls}>
                <View style={styles.linebreak} />
                <Text style={styles.happyStyle}>
                  {res.resolve('unsatisfied', this.props.lang)}
                </Text>
                <FastImage
                  style={styles.image}
                  source={
                    this.props.gender == 'female'
                      ? require('../resouces/woman-smile3.png')
                      : require('../resouces/man-smile3.png')
                  }
                />

                <View
                  style={{
                    ...styles.yesNoStyle,
                    flexDirection:
                      this.props.lang == 'ar-EG' ? 'row-reverse' : 'row',
                  }}>
                  <Button
                    title={res.resolve('yes', this.props.lang)}
                    color='rgb(23, 98, 184)'
                    style={styles.linebreakSml}
                    onPress={() => this.handleSatisfaction('Yes', 'negative')}
                    disabled={this.state.disabledVid}
                  />
                  <View style={styles.linebreakSml} />
                  <Button
                    title={res.resolve('no', this.props.lang)}
                    color='rgb(94, 212, 228)'
                    style={styles.linebreakSml}
                    onPress={() => this.handleSatisfaction('No', 'positive')}
                    disabled={this.state.disabledVid}
                  />
                </View>
              </View>
              <View style={styles.linebreak} />
            </View>
          </>
        )
      case 'other':
        return (
          <>
            <View style={styles.container}>
              <View style={{...styles.controls}}>
                <View style={styles.linebreak} />
                <Text style={styles.happyStyle}>
                  {res.resolve('providefeed', this.props.lang)}
                </Text>
              </View>
              <View style={styles.newStyleYN}>
                <View style={styles.fCompo3}>
                  <TouchableOpacity
                    onPress={() => this.handleSatisfaction('Yes', 'neutral')}>
                    <FastImage
                      style={styles.compo1}
                      source={
                        this.props.gender == 'female'
                          ? require('../resouces/woman-smile2.png')
                          : require('../resouces/man-smile2.png')
                      }
                    />
                    <Text style={styles.compo2}>
                      {res.resolve('ok', this.props.lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.linebreakSml} />
                <View style={styles.compo3}>
                  <TouchableOpacity
                    onPress={() => this.handleSatisfaction('Yes', 'negative')}>
                    <FastImage
                      style={styles.compo4}
                      source={
                        this.props.gender == 'female'
                          ? require('../resouces/woman-smile3.png')
                          : require('../resouces/man-smile3.png')
                      }
                    />
                    <Text style={styles.compo5}>
                      {res.resolve('sad', this.props.lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.linebreak} />
            </View>
          </>
        )
      case 'otherpositive':
        return (
          <>
            <View style={styles.container}>
              <View style={styles.controls}>
                <View style={styles.linebreak} />
                <Text style={styles.happyStyle}>
                  {res.resolve('providefeed', this.props.lang)}
                </Text>
              </View>
              <View style={styles.newStyleYN}>
                <View style={styles.compo1}>
                  <TouchableOpacity
                    onPress={() => this.handleSatisfaction('Yes', 'happy')}>
                    <FastImage
                      style={styles.compo4}
                      source={
                        this.props.gender == 'female'
                          ? require('../resouces/woman-smile1.png')
                          : require('../resouces/man-smile1.png')
                      }
                    />
                    <Text style={styles.compo5}>
                      {res.resolve('happy', this.props.lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.linebreakSml} />
                <View style={styles.compo3}>
                  <TouchableOpacity
                    onPress={() => this.handleSatisfaction('Yes', 'negative')}>
                    <FastImage
                      style={styles.compo4}
                      source={
                        this.props.gender == 'female'
                          ? require('../resouces/woman-smile2.png')
                          : require('../resouces/man-smile2.png')
                      }
                    />
                    <Text style={styles.compo5}>
                      {res.resolve('ok', this.props.lang)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.compo6} />
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
      const {uri, codec = 'mp4'} = await global.camera.recordAsync(
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
    global.camera.stopRecording()
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
          textStyle={styles.compo7}
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
            <View style={styles.compo8}>
              <View style={styles.compo9}>
                <View style={styles.compo10}>
                  <TouchableOpacity
                    style={{
                      left: this.state.isRTL ? 'auto' : 0,
                      right: this.state.isRTL ? 10 : 'auto',
                      ...styles.compo11,
                    }}
                    onPress={() => {
                      this.props.endFlow()
                    }}>
                    <FastImage
                      style={styles.compo12}
                      source={require('../resouces/close_blue.png')}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{...styles.compo13, right: this.state.isRTL ? 10 : 0}}>
                  <Text
                    style={{
                      ...styles.compo14,
                      left: this.state.isRTL ? 0 : 10,
                    }}>
                    {res.resolve('snf', this.props.lang)}
                  </Text>
                </View>
              </View>
              <View style={styles.compo15} />
              {this.rendertext(
                this.state.type || this.state.check || this.props.type,
              )}
              <View style={styles.fCompo2}>
                {this.props.type == 'text' &&
                  !this.state.check &&
                  !this.state.completed && (
                    <View style={styles.fCompo1}>
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
                    <View style={styles.fCompo1}>
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
                    <View style={styles.fCompo1}>
                      <Button
                        title={this.state.label}
                        color='rgb(23, 98, 184);'
                        onPress={this.startRecording.bind(this)}
                        disabled={this.state.disabledVid}
                        style={styles.buttonFrm}
                      />
                    </View>
                  )}
                {this.state.showUploadVideo &&
                  !this.state.check &&
                  !this.state.completed && (
                    <View style={styles.fCompo1}>
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