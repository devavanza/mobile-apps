import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native'
import res from './langResouurces'
import {Colors} from 'react-native/Libraries/NewAppScreen'
import Feedback from './feedback.js'

export default class Wrapper extends Component {
  // initial state
  state = {
    isVisible: false,
    isAudio: false,
    isVideo: false,
    isText: false,
    transparent: true,
  }

  // hide show modal
  displayModal (show) {
    this.setState({isVisible: show})
  }
  onClickVideo () {
    this.setState({isVideo: true})
  }
  onClickAudio () {
    this.setState({isAudio: true})
  }
  onClickText () {
    this.setState({isText: true})
  }
  endFlow () {
    // alert("Your Feedback Submitted Successfully!!");
    this.setState({
      isVisible: false,
      transparent: true,
      isAudio: false,
      isVideo: false,
      isText: false,
      visibily: false,
    })
  }
  renderMain () {
    return (
      <>
        <Image
          source={require('../resouces/drawer.png')}
          style={styles.image}
        />
        <Text style={styles.imageTextExp}>
          {res.resolve('exp', this.props.lang)}
        </Text>
        <View style={styles.imageText}>
          <TouchableOpacity
            onPress={() => {
              this.setState({isText: true, transparent: false})
            }}>
            <Image
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 100,
                resizeMode: 'contain',
              }}
              source={require('../resouces/chat.jpg')}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.imageVideo}>
          <TouchableOpacity
            onPress={() => {
              this.setState({isVideo: true, transparent: false})
            }}>
            <Image
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 100,
                resizeMode: 'contain',
              }}
              source={require('../resouces/vid.jpg')}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.imageAudio}>
          <TouchableOpacity
            onPress={() => {
              this.setState({isAudio: true, transparent: false})
            }}>
            <Image
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 100,
                resizeMode: 'contain',
              }}
              source={require('../resouces/mic.jpg')}
            />
          </TouchableOpacity>
        </View>
      </>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={{
            width: Dimensions.get('window').width * 1.5,
            height: Dimensions.get('window').height * 0.5,
            top: 0,
            // borderRadius: 100,
            resizeMode: 'contain',
            position: 'absolute',
          }}
          source={require('../resouces/bak.png')}
        />
        <Modal
          animationType={'fade'}
          // transparent={this.state.transparent}
          transparent={true}
          visible={this.state.isVisible}
          onRequestClose={() => {
            Alert.alert('Modal has now been closed.')
          }}>
          {!this.state.isAudio &&
            !this.state.isVideo &&
            !this.state.isText &&
            this.renderMain()}

          {this.state.isVideo && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}>
              <Feedback
                type='video'
                gender={this.props.gender}
                baseURL={this.props.api}
                lang={this.props.lang}
                endFlow={this.endFlow.bind(this)}
                clientkey={this.props.clientkey}
                clientSecret={this.props.clientSecret}
              />
            </View>
          )}

          {this.state.isAudio && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}>
              <Feedback
                type='audio'
                gender={this.props.gender}
                baseURL={this.props.api}
                lang={this.props.lang}
                endFlow={this.endFlow.bind(this)}
                clientkey={this.props.clientkey}
                clientSecret={this.props.clientSecret}
              />
            </View>
          )}
          {this.state.isText && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.87)',
              }}>
              <Feedback
                type='text'
                gender={this.props.gender}
                baseURL={this.props.api}
                lang={this.props.lang}
                endFlow={this.endFlow.bind(this)}
                clientkey={this.props.clientkey}
                clientSecret={this.props.clientSecret}
              />
            </View>
          )}
        </Modal>
        {!this.state.visibily && (
          <TouchableOpacity
            // style={styles.button}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height * 0.5,
              top: Dimensions.get('window').height * 0.75,
              left: Dimensions.get('window').width * 0.88,
              right: 0,
              visible: false,
              // borderRadius: 100,
              // resizeMode: 'contain',
              // display: this.state.visibily ? undefined : 'none',
              position: 'absolute',
            }}
            onPress={() => {
              this.setState({visibily: true})
              this.displayModal(true)
            }}>
            <Image source={require('../resouces/feedback.png')} />
          </TouchableOpacity>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor:"#777"
  },
  buttonIcon: {
    shadowOpacity: 0.7,
  },
  button: {
    display: 'flex',
    height: 60,
    top: 300,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '20%',
    backgroundColor: '#1762B8',
    shadowColor: '#2AC062',
    shadowOpacity: 0.7,
    shadowOffset: {
      height: 10,
      width: 0,
    },
    shadowRadius: 25,
  },
  closeButton: {
    display: 'flex',
    height: 60,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3974',
    shadowColor: '#2AC062',
    shadowOpacity: 0.7,
    shadowOffset: {
      height: 10,
      width: 0,
    },
    shadowRadius: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  image: {
    marginTop: -50,
    marginBottom: 10,
    right: 0,
    left: Dimensions.get('window').width * 0.32,
    // resizeMode: 'contain',
    // width: '130%',
    // height: '100%',
  },
  close: {
    position: 'absolute',
    marginTop: 20,
    top: 310,
    bottom: 310,
    left: 390,
    right: 10,
    opacity: 1,
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'contain',
    borderRadius: 100,
  },
  imageFld: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
  },
  imageText: {
    position: 'absolute',
    marginTop: 20,
    // top: 310,
    top: Dimensions.get('window').height * 0.4,
    bottom: 310,
    left: 140,
    right: 185,
    left: Dimensions.get('window').width * 0.4,
    right: Dimensions.get('window').width * 0.4,
    opacity: 1,
    flex: 1,
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 100,
  },
  imageAudio: {
    position: 'absolute',
    marginTop: 20,
    top: Dimensions.get('window').height * 0.4,
    // top: 310,
    bottom: 310,
    // left: 220,
    // right: 105,
    left: Dimensions.get('window').width * 0.6,
    right: Dimensions.get('window').width * 0.2,
    opacity: 1,
    // flex: 1,
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 100,
  },
  imageVideo: {
    position: 'absolute',
    marginTop: 20,
    // top: 310,
    top: Dimensions.get('window').height * 0.4,
    bottom: 310,
    // left: 240,
    // right: 85,
    left: Dimensions.get('window').width * 0.8,
    right: Dimensions.get('window').width * 0.2,
    opacity: 1,
    flex: 1,
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 100,
  },
  imageTextExp: {
    position: 'absolute',
    marginTop: 20,
    // top: 310,
    top: Dimensions.get('window').height * 0.35,
    bottom: 310,
    // left: 240,
    // right: 85,
    fontSize: 16,
    left: Dimensions.get('window').width * 0.44,
    color: '#FFF',
    fontWeight: 'bold',
    // right: Dimensions.get('window').width * 0.1,
    opacity: 1,
    flex: 1,
    width: 210,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 100,
  },
  text: {
    fontSize: 24,
    marginBottom: 30,
    padding: 40,
  },
})
