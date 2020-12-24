import { StyleSheet, Dimensions } from 'react-native'
import { Colors } from 'react-native/Libraries/NewAppScreen'

module.exports = StyleSheet.create({
  main: { color: '#FFF' },
  linebreak: {
    width: 10,
    height: 20,
  },
  linebreakSml: {
    width: 10,
    height: 10,
  },
  happyStyle: {
    fontSize: 17,
    // fontWeight: 900
  },
  newStyleYN: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 210,
  },
  compo1: { width: 150, height: 150, textAlign: 'center' },
  compo2: {
    textAlign: 'center',
    marginLeft: Dimensions.get('window').width * 0.03,
  },
  compo3: { width: 150, height: 150 },
  compo4: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    resizeMode: 'contain',
  },
  compo5: {
    textAlign: 'center',
    marginLeft: Dimensions.get('window').width * 0.03,
    height: 20,
  },
  compo6: {
    width: 10,
    height: 50,
  },
  compo7: { color: '#FFF' },
  yesNoStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width * 1,
    height: 20,
    marginTop: -50,
    alignItems: 'center',
  },
  centerVertical: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // left: Dimensions.get('window').width * 0.04
  },
  compo8: {
    backgroundColor: '#FFF',
    elevation: 5,
    padding: 10,
    textAlign: 'center',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderWidth: 2,
    padding: 0,
    // borderStyle: 'solid',
    borderRadius: 10,
    width: Dimensions.get('window').width * 0.93,
  },
  compo9: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
  compo11: {
    top: 7,
  },
  compo12: {
    width: 30,
    height: 30,
    borderRadius: 100,
    resizeMode: 'contain',
  },
  compo10: {
    width: '10%',
    height: 50,
    // backgroundColor: 'powderblue',
  },
  compo13: {
    // color: 'rgb(94, 212, 228)',
    width: '90%',
    height: 50,
  },
  compo14: {
    color: '#0054ad',
    fontSize: 18,
    top: 10,
  },
  compo15: {
    // borderColor: 'rgb(94, 212, 228)',
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 1,
  },
  tCompo1: {
    textAlign: 'center',
    color: 'grey',
    padding: 5,
    fontSize: 15,
  },
  tCompo2: {
    padding: 0,
    margin: 0,
    left: 0,
    right: 0,
    flex: 0,
    alignItems: 'center',
  },
  tcomp99: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  tCompo3: {
    height: 20,
    color: '#0054ad',
    borderColor: '#333',
    // backgroundColor: 'transparent',
  },
  clear: {
    // borderColor: 'rgb(94, 212, 228)',
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 1,
  },
  tcomp98: {
    color: 'red', fontStyle: 'italic'
  },
  tCompo4: {
    width: 200,
    height: 200,
    borderRadius: 100,
    resizeMode: 'contain',
    marginTop: 5,
    marginLeft: '0%',
  },
  tCompo5: {
    width: '100%',
    height: '100%',
  },
  tCompo6: {
    flexDirection: 'row',
    left: 0,
  },
  tCompo7: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  tCompo8: { color: 'red', fontStyle: 'italic', padding: 22 },
  tCompo9: {
    flexDirection: 'row',
    left: 10,
  },
  tCompo10: {
    color: 'grey',
    fontStyle: 'italic',
    fontSize: 12,
    width: Dimensions.get('window').width * 0.75,
  },
  tCompo11: { top: 3 },
  tCompo13: {
    color: 'grey',
    fontSize: 13,
    width: Dimensions.get('window').width * 0.7,
  },
  tCompo14: { flex: 1, padding: 10 },
  tCompo15: { color: 'grey', fontStyle: 'italic' },
  tCompo16: { color: 'red', fontStyle: 'italic' },
  tCompo17: {
    color: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  tCompo18: {
    height: Dimensions.get('window').height * 0.5,
    width: Dimensions.get('window').width * 0.5,
    marginTop: 25,
    marginLeft: Dimensions.get('window').width * 0.21,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    borderRadius: 1,
  },
  pCompo2: {
    color: 'grey',
    fontStyle: 'italic',
    fontSize: 12,
    width: Dimensions.get('window').width * 0.7,
    // padding: 22,
  },
  fCompo1: { flex: 1, padding: 10 },
  fCompo2: { flexDirection: 'row' },
  fCompo3: { width: 150, height: 150, textAlign: 'center' },
  pCompo3: {
    color: 'grey',
    // fontStyle: 'italic',
    fontSize: 15,
    width: Dimensions.get('window').width * 0.7,
    // padding: 22,
  },
  main2: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
  pCompo1: { flex: 1, padding: 10 },
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
    transform: [{ scale: 0.5 }],
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



  ///

  accessory: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  triangle: {
    width: 8,
    height: 8,
    transform: [{
      translateY: -4,
    }, {
      rotate: '45deg',
    }],
  },

  triangleContainer: {
    width: 12,
    height: 6,
    overflow: 'hidden',
    alignItems: 'center',

    backgroundColor: 'transparent', /* XXX: Required */
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  picker: {
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    borderRadius: 2,

    position: 'absolute',

    ...Platform.select({
      ios: {
        shadowRadius: 2,
        shadowColor: 'rgba(0, 0, 0, 1.0)',
        shadowOpacity: 0.54,
        shadowOffset: { width: 0, height: 2 },
      },

      android: {
        elevation: 2,
      },
    }),
  },

  item: {
    textAlign: 'left',
  },

  scroll: {
    flex: 1,
    borderRadius: 2,
  },

  scrollContainer: {
    paddingVertical: 8,
  },

})
