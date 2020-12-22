import res from './langResources'
import axios from 'axios'
import { ToastAndroid } from "react-native";

function setTextError(error){
    if(error){
        // ToastAndroid.show(error)
        ToastAndroid.showWithGravity(
            error,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM
          );
    }

}
const handleSubmitAudio = async function() {
  setTextError(null)
  if (this.state.currentTime <= 5) {
    setTextError(res.resolve('SecAud', this.props.lang))
    this.setSubmitLoading(false)
  } else if (!this.state.stoppedRecording) {
    setTextError(res.resolve('PRA', this.props.lang))
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
          setTextError(responseInt.data.errorDescription)
          this.setSubmitLoading(false)
        } else {
          setTextError(null)
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
      setTextError(res.resolve('ERECA', this.props.lang))
    }
  }
}

const handleSubmit = async function () {
  setTextError(null)

  if (!this.state.textValue) {
    setTextError(res.resolve('Fback', this.props.lang))
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
          setTextError(response.data.errorDescription)
        } else {
          setTextError(null)
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
      setTextError('Error in uploading Feedback')
    }
  }
}

const handleSubmitVideo = async function () {
  setTextError(null)
  console.log(this.state.timer)
  if (this.state.timer >= 55) {
    console.log('ERROR', res.resolve('SecVide', this.props.lang))
    setTextError(res.resolve('SecVide', this.props.lang))
  } else if (!this.state.showUploadVideo) {
    setTextError(res.resolve('PRV', this.props.lang))
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
        console.log(response.data, JSON.stringify(bodyFormData))
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
          bodyFormData1.append('allEmotions', this.state.allEmotions)
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
          setImmediate(async () => {
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
          })

          console.log(
            'upload response',
            this.state.allEmotions,
            this.state.allEmotions.includes('negative'),
          )
          if (this.state.allEmotions.includes('negative')) {
            this.setState({emotion: 'negative'})
            this.setInteractionId(response.data.interactionId, 'Sad')
          } else if (
            this.state.allEmotions.includes('positive') &&
            this.state.allEmotions.includes('neutral') &&
            !this.state.allEmotions.includes('negative')
          ) {
            this.setState({emotion: 'positive'})
            this.setInteractionId(response.data.interactionId)
          } else {
            this.setState({emotion: 'positive'})
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
      setTextError(res.resolve('EUV', this.props.lang))
    }
  }
}
export default {handleSubmitAudio, handleSubmit, handleSubmitVideo, }
