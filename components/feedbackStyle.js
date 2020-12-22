import {StyleSheet, Dimensions} from 'react-native'
import {Colors} from 'react-native/Libraries/NewAppScreen'


module.exports = StyleSheet.create({
  main: {color: '#FFF'},
  clear: {
    // borderColor: 'rgb(94, 212, 228)',
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 1,
  },
  main2: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
  main1: {
    backgroundColor: '#FFF',
    elevation: 5,
    padding: 10,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderWidth: 2,
    padding: 0,
    // borderStyle: 'solid',
    borderRadius: 10,
    width: Dimensions.get('window').width * 0.93,
  },
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
  clbStl: {
    width: 30,
    height: 30,
    borderRadius: 100,
    resizeMode: 'contain',
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
