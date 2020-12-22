import React from 'react'
import {View, Text, TextInput} from 'react-native'
import styles from './feedbackStyle'
import res from './langResources'

const TextCompo = ({lang, error, textValue,isRTL, setState,_this}) => {
  return (
    <>
      <View style={{flex: 1, padding: 10}}>
        <TextInput
          multiline={true}
          numberOfLines={10}
          style={{
            ...styles.textArea,
            textAlign: isRTL ? 'right' : 'left',
          }}
          value={textValue}
          placeholder={res.resolve('EnterFBack', lang)}
          maxLength={500}
          onChangeText={textValue => {
            console.log(textValue)
            console.log(String(textValue).length)
            _this.setState({textValue})
          }}
        />
        <Text style={{color: 'grey', fontStyle: 'italic'}}>
          {500 - String(textValue).length}{' '}
          {res.resolve('CRemain', lang)}
        </Text>
        {error && (
          <Text style={{color: 'red', fontStyle: 'italic'}}>
            {error}
          </Text>
        )}
      </View>
    </>
  )
}

export default TextCompo
