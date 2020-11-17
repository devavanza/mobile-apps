import React, {useState, PureComponent} from 'react'
import Spinner from 'react-native-loading-spinner-overlay'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  StatusBar,
  Button,
  TouchableHighlight,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import {Colors} from 'react-native/Libraries/NewAppScreen'
import axios from 'axios'
import {RNCamera} from 'react-native-camera'
import VideoPlayer from 'react-native-video-player'

import Sound from 'react-native-sound'
import {AudioRecorder, AudioUtils} from 'react-native-audio'

var camera = null
export default class Feedback extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      path: '',
      label: 'submit',
      baseURL: 'https://avanza-training.westeurope.cloudapp.azure.com',
      camera: {
        type: RNCamera.Constants.Type.back,
        flashMode: RNCamera.Constants.FlashMode.auto,
      },
      currentTime: 0.0,
      recording: false,
      paused: false,
      stoppedRecording: false,
      finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/test.wma',
      hasPermission: undefined,
    }

    // this.audioRecorderPlayer = new AudioRecorderPlayer()
    // this.audioRecorderPlayer.setSubscriptionDuration(0.09) // optional. Default is 0.1
  }
  prepareRecordingPath (audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: 'Low',
      AudioEncoding: 'wma',
      AudioEncodingBitRate: 32000,
    })
  }
  handleAccessToken = async () => {
    try {
      let response = await axios.post(
        `${this.state.baseURL}/login`,
        {
          userId: 'admin_core',
          password:
            '2bf3e759dba1b4402707738242f46d16a629f85ab34cf9f964290c9a8c578ef9d6a196d31e694104374d82c302c73bf776f2db831fb7434ca27a3c4ddbb64006',
        },
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      // console.log(response, 'response------------------->')
      return response.data.loginResponse.data.token
    } catch (err) {
      console.log(err)
      this.setSubmitLoading(false)
      this.setTextError('Error in uploading Feedback')
    }
  }
  setTextError (error) {
    this.setState({error: error})
  }
  componentDidMount () {
    this.setState({completed: false, check: undefined})

    if (this.props.type == 'video') {
      this.setState({label: 'Start Recording'})
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

    if (!this.state.stoppedRecording) {
      this.setTextError('Please record your audio!')
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
          type: 'audio/x-wma',
        })
        bodyFormData.append('type', 'A')
        bodyFormData.append('orgId', 'AFZ')
        let response = await axios({
          method: 'post',
          url: `${this.state.baseURL}/API/Feedback/uploadInteraction`,
          data: bodyFormData,
          headers: {
            'Content-Type': 'multipart/form-data',
            token: await this.handleAccessToken(),
          },
        })
        console.log('upload response', response.data)
        if (response.status == 200) {
          this.setSubmitLoading(false)
          this.setInteractionId(response.data.id)
          // handleAudioIndex();
          // setSubmitLoading(false);
          // setEmoji(true);
        }
      } catch (err) {
        console.log(err.stack)
        this.setSubmitLoading(false)
        this.setTextError('Error in uploading audio')
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
  setOther (flag) {
    this.setState({other: flag, check: 'other'})
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
      this.setOther(true)
    }
    if (value == 'Yes') {
      try {
        let intId = this.state.interactionId
        let response = await axios({
          method: 'post',
          url: `${this.state.baseURL}/API/Feedback/submitInteraction`,
          data: {
            //   ...info,
            type,
            interactionId: intId,
            customerProvidedSentiment: userEmotion,
            // indexId:indexResposne.indexId,
          },
          headers: {
            'Content-Type': 'application/json',
            token: await this.handleAccessToken(),
          },
        })
        console.log('Submit response---------------TEXT----->', response)
        if (response.status == 200) {
          this.setSubmitLoading(false)
          this.setCompleted(true)
          alert('Your Feedback Submitted Successfully!!')
          this.props.endFlow()
        }
      } catch (err) {
        alert('Error in Submitting Feedback')
        this.setSubmitLoading(false)
      }
    }
  }

  setSubmitLoading (flag) {
    this.setState({flag: flag})
  }
  setInteractionId (id) {
    console.log('HAAAAA')
    this.setState({
      interactionId: id,
      check: 'Happy',
      type: undefined,
      showUploadVideo: false,
    })
  }
  handleSubmit = async () => {
    this.setTextError(null)

    if (!this.state.textValue) {
      this.setTextError('Please enter your feedback')
    } else {
      this.setSubmitLoading(true)
      try {
        let response = await axios({
          method: 'post',
          url: `${this.state.baseURL}/API/Feedback/uploadInteraction`,
          data: {
            type: 'T',
            orgId: 'AFZ',
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
            token: await this.handleAccessToken(),
          },
        })
        console.log('text upload response', response)
        if (response.data) {
          this.setSubmitLoading(false)
          this.setTextError(null)
          this.setInteractionId(response.data.id)
        }
      } catch (err) {
        console.log(err)
        this.setSubmitLoading(false)
        this.setTextError('Error in uploading Feedback')
      }
    }
  }
  rendertext (type) {
    // const {recording, processing} = this.state
    // Toast.show({
    //   text2: 'This is some something 👋'
    // });
    console.log('type:->', type)
    switch (type) {
      case 'text':
        return (
          <>
            <View style={{flex: 1, padding: 10}}>
              <TextInput
                multiline={true}
                numberOfLines={10}
                style={styles.textArea}
                placeholder="Enter your feedback..."
                onChangeText={textValue => {
                  console.log(textValue)
                  this.setState({textValue})
                }}
              />
              <Text style={{color: 'red', fontStyle: 'italic'}}>
                {this.state.error}
              </Text>
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
          </View>
        )
      case 'audio':
        return (
          <>
            <View style={styles.container}>
              <View style={{...styles.controls, height: 160}}>
                {/* {this._renderButton(
                  'RECORD',
                  () => {
                    this._record()
                  },
                  this.state.recording,
                )} */}
                {/* {this._renderButton('PLAY', () => {
                  this._play()
                })} */}
                {/* {this._renderButton('STOP', () => {
                  this._stop()
                })} */}
                {/* {this._renderPauseButton(() => {
                  this.state.paused ? this._resume() : this._pause()
                })} */}
                <TouchableOpacity
                  style={{
                    width: '50%',
                    height: '120%',
                    borderRadius: 100,
                    resizeMode: 'contain',
                    marginTop: 100,
                    marginLeft: 120,
                  }}
                  onPressIn={() => {
                    // this.setState({isAudio: true, transparent: false})
                    this._record()
                  }}
                  onPressOut={() => {
                    // this.setState({isAudio: true, transparent: false})
                    this._stop()
                  }}>
                  <Image
                    style={{
                      width: '50%',
                      height: '50%',
                      // borderRadius: 100,
                      // resizeMode: 'contain',
                    }}
                    source={require('../resouces/mic-audio.png')}
                  />
                </TouchableOpacity>
                {/* <Text style={styles.progressText}> */}
                {/* <Text style={{color: '#000', left: 20, top: -70, position:'absolute'}}>
                  {this.state.currentTime} s
                </Text> */}

                {/* <Text style={{...styles.progressText, top:0,left:150}}>
                  {this.state.currentTime}s
                </Text> */}

                <View
                  style={{
                    flexDirection: 'row',
                    position: 'absolute',
                    top: 140,
                  }}>
                  {!this.state.isPlaying && (
                    <Text style={styles.progressText}>
                      {this.state.currentTime + ' s'}
                    </Text>
                  )}
                  <View
                    style={{
                      width: 10,
                      height: 10,
                    }}
                  />
                  {!this.state.isPlaying && (
                    <Button
                      title={'  Play  '}
                      color='rgb(94, 212, 228);'
                      onPress={() => {
                        // this.setState({isAudio: true, transparent: false})
                        this._play()
                      }}
                      disabled={!this.state.stoppedRecording}
                    />
                  )}
                  {this.state.isPlaying && (
                    <Text style={styles.progressText}>Audio is playing!!</Text>
                  )}
                </View>
              </View>
              <Text style={{color: 'red', fontStyle: 'italic'}}>
                {this.state.error}
              </Text>
            </View>
          </>
        )
      case 'video':
        return (
          <>
            <View styles={{flex: 1}}>
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
                style={{flex: 1, height: 100, margin: 100}}
                type={RNCamera.Constants.Type.back}
                androidCameraPermissionOptions={{
                  title: 'Permission to use camera',
                  message: 'We need your permission to use your camera',
                  buttonPositive: 'Ok',
                  buttonNegative: 'Cancel',
                }}
              />
              <Text style={{color: 'red', fontStyle: 'italic'}}>
                {this.state.error}
              </Text>
            </View>
          </>
        )
      case 'Happy':
        return (
          <>
            <View style={styles.container}>
              <View style={styles.controls}>
                <Text
                  style={{
                    fontSize: 17,
                    // fontWeight: 900
                  }}>
                  Satisfied with our services?
                </Text>
                <Image
                  style={styles.image}
                  source={require('../resouces/man-smile1.png')}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  width: Dimensions.get('window').width * 1,
                  display: 'flex',
                  top: Dimensions.get('window').height * 0.3,
                  alignItems: 'center',
                }}>
                <Button
                  title={'  Yes  '}
                  color='rgb(23, 98, 184)'
                  onPress={() => this.handleSatisfaction('Yes', 'Happy')}
                  disabled={this.state.disabledVid}
                />
                <View
                  style={{
                    width: 10,
                    height: 10,
                  }}
                />
                <Button
                  title={'   NO   '}
                  color='rgb(94, 212, 228)'
                  onPress={() => this.handleSatisfaction('No')}
                  disabled={this.state.disabledVid}
                />
              </View>
            </View>
          </>
        )
      case 'other':
        return (
          <>
            <View style={styles.container}>
              <View style={styles.controls}>
                <Text
                  style={{
                    fontSize: 17,
                    // fontWeight: 900
                  }}>
                  Provide Your Feedback
                </Text>
                {/* <Image
                  style={styles.image}
                  source={require('../resouces/man-smile1.png')}
                /> */}
              </View>

              <View style={{height: 150}}>
                <TouchableOpacity
                  onPress={() => this.handleSatisfaction('Yes', 'Neutral')}>
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 100,
                      resizeMode: 'contain',
                    }}
                    source={require('../resouces/man-smile2.png')}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  width: 10,
                  height: 10,
                }}
              />
              <View style={{height: 150}}>
                <TouchableOpacity
                  onPress={() => this.handleSatisfaction('Yes', 'Sad')}>
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 100,
                      resizeMode: 'contain',
                    }}
                    source={require('../resouces/man-smile3.png')}
                  />
                </TouchableOpacity>
              </View>
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
        label: 'Start Recording',
        showUploadVideo: false,
      })
    } else if (!this.state.recording) {
      this.setState({recording: true, label: 'Stop Recording'})
      // default to mp4 for android as codec is not set
      console.log('i am here')
      const {uri, codec = 'mp4'} = await camera.recordAsync()
      console.log('URI>>>>>>', uri)

      this.setState({
        uri,
        type: 'player',
        label: 'Re-Record',
        recording: false,
        showUploadVideo: true,
      })
    } else {
      this.stopRecording()
    }
  }

  async stopRecording () {
    // this.state.recording = false
    // this.state.stopped = true
    this.setState({recording: false, stopped: true})
    camera.stopRecording()
  }
  switchText () {
    console.log('stopped')
    this.setState({type: 'text'})
  }
  switchVideo () {
    console.log('stopped')
    // camera = null
    this.setState({type: 'video', recording: false, label: 'Start Recording'})
    console.log('stopped', JSON.stringify(this.state))
  }
  switchAudio () {
    console.log('stopped')
    this.setState({type: 'audio'})
  }
  setRecorded (flag) {
    this.setState({showUploadVideo: flag})
  }

  handleSubmitVideo = async () => {
    this.setTextError(null)

    if (!this.state.showUploadVideo) {
      this.setTextError('Please record your video first!')
    } else {
      try {
        var bodyFormData = new FormData()
        let filename = this.state.uri.replace(/^.*[\\\/]/, '')
        // uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
        bodyFormData.append('name', this.state.uri)
        console.log()
        bodyFormData.append('file', {
          name: filename,
          uri: this.state.uri,
          type: 'video/mp4',
        })
        bodyFormData.append('type', 'V')
        bodyFormData.append('orgId', 'AFZ')
        console.log('Request Sent!!')
        let response = await axios({
          method: 'post',
          url: `${this.state.baseURL}/API/Feedback/uploadInteraction`,
          data: bodyFormData,
          headers: {
            'Content-Type': 'multipart/form-data',
            token: await this.handleAccessToken(),
          },
        })
        console.log('Response Recived')
        console.log('upload response>>>>|||>>>>>', response)
        if (response.status == 200) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>check status!!!!!!!?>>>>')
          this.setSubmitLoading(false)
          this.setRecorded(false)
          this.setInteractionId(response.data.id)
        }
      } catch (err) {
        console.log(err)
        this.setSubmitLoading(false)
        this.setTextError('Error in uploading video')
      }
    }
  }

  render () {
    return (
      <>
        <Spinner
          visible={this.state.flag}
          textContent={'Please wait..'}
          textStyle={{color: '#FFF'}}
          animation='fade'
          overlayColor='#00336777'
        />
        <StatusBar barStyle='dark-content' />
        <SafeAreaView style={{marginTop: 160}}>
          <ScrollView
            contentInsetAdjustmentBehavior='automatic'
            style={styles.scrollView}>
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
                width: 370,
              }}>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    padding: 10,
                    fontSize: 20,
                    textAlign: 'left',
                    // color: 'rgb(94, 212, 228);',
                    color: 'rgb(23, 98, 184)',
                  }}>
                  {'Suggestions & Feedback'}
                </Text>

                <View>
                  <TouchableOpacity
                    style={{
                      top: 7,
                      left: 85,
                    }}
                    onPress={() => {
                       this.props.endFlow();
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
              </View>
              <View
                style={{
                  borderBottomColor: 'rgba(0, 0, 0, 0.12)',
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
                        title='Submit Feedback'
                        color='rgb(23, 98, 184);'
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
                        disabled={this.state.disabledVid}
                        style={styles.buttonFrm}
                      />
                    </View>
                  )}
                {this.state.showUploadVideo &&
                  !this.state.check &&
                  !this.state.completed && (
                    <View style={{flex: 1, padding: 10}}>
                      <Button
                        title={'Submit Feedback'}
                        color='rgb(23, 98, 184);'
                        onPress={this.handleSubmitVideo.bind(this)}
                        disabled={this.state.disabledVid}
                        style={styles.buttonFrm}
                      />
                    </View>
                  )}
              </View>
            </View>
            {/* <View style={{flex: 1, padding: 10}}>
              <Button
                title={this.state.label}
                color='rgb(94, 212, 228)'
                onPress={this.startRecording.bind(this)}
                accessibilityLabel='Video'
                style={styles.buttonFrm}
              />
            </View> */}
            {/* )} */}
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
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    padding: 5,
    justifyContent: "flex-start",
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
    height: 295,
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
