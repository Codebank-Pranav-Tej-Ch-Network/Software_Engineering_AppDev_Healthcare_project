import { Stack } from 'expo-router'
import { Text, View } from 'react-native'

const index = () => {
  return (
    <View>
      <Text>index</Text>
      <Stack.Screen name="index" options={{title:"Blood Donation"}} />
    </View>
  )
}

export default index