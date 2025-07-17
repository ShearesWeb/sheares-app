import InfoScreen from '@/components/Screens/InfoScreen';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Activity() {
  return (
    <SafeAreaView style={styles.container}>
      <InfoScreen
        message='This feature is still under development. Stay tuned for exciting updates!'
        description='What to expect: A tiered point system based on event participation. So better not miss out on hall events for now!' />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
});