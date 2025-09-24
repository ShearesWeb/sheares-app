import WideButton from '@/components/Buttons/WideButton';
import { useSession } from '@/contexts/auth';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Modal from '@/components/Modals/Modal';
import ProfileImageEditor from '@/components/Images/ProfileImageEditor';
import { useTermsData } from '@/hooks/useTermsHook';
import TermsModal from '@/components/Modals/TermsModal';

export default function Settings() {
  const appVersion = Constants.expoConfig?.version;
  const { isGuest, displayName, signOut } = useSession();

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const { termsData, isLoading, error } = useTermsData();

  const openDeviceSettings = () => Linking.openSettings();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          {isGuest ? (
            <>
              <Text style={styles.displayName}>{displayName}</Text>
              <Text style={styles.email}>You are signed in as a Guest.</Text>
            </>
          ) : (
            <ProfileImageEditor
              style={styles.profileImageEditor}
            />
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeading}>Settings</Text>

          <TouchableOpacity style={styles.settingsRow} onPress={openDeviceSettings}>
            <View style={styles.settingsRowContent}>
              <Ionicons name="notifications-outline" size={24} color="#EF7C00" />
              <Text style={styles.settingsRowLabel}>Push notifications</Text>
            </View>
            <AntDesign name="right" size={20} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow} onPress={() => setIsSupportModalOpen(true)}>
            <View style={styles.settingsRowContent}>
              <AntDesign name="questioncircleo" size={24} color="#EF7C00" />
              <Text style={styles.settingsRowLabel}>Support</Text>
            </View>
            <AntDesign name="right" size={20} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => setIsTermsModalOpen(true)}
            disabled={isLoading || !!error}
          >
            <View style={styles.settingsRowContent}>
              <AntDesign name="filetext1" size={24} color="#EF7C00" />
              <Text style={styles.settingsRowLabel}>Terms and Conditions</Text>
            </View>
            <AntDesign name="right" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <WideButton variant="default" text="Logout" onPress={signOut} style={styles.logoutButton} />
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>Version {appVersion}</Text>
          <Text style={styles.metaText}>© Sheares Web {new Date().getFullYear()}</Text>
          <Text style={styles.metaText}>Made with ❤️ by the Sheares Web Team</Text>
        </View>


        <Modal visible={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} title="Need assistance?">
          <Text style={styles.modalText}>
            Feel free to contact us at <Text style={styles.modalEmail}>sheareswebteam@gmail.com</Text>
          </Text>
        </Modal>

        {termsData && (
          <TermsModal
            visible={isTermsModalOpen}
            onClose={() => setIsTermsModalOpen(false)}
            termsData={termsData}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  profileImageEditor: {
    marginVertical: 10,
  },
  displayName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  settingsSection: {
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
  },
  sectionHeading: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  settingsRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  settingsRowLabel: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    marginBottom: 20,
  },
  metaContainer: {
    marginBottom: 20,
  },
  metaText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalEmail: {
    fontWeight: 'bold',
    color: '#EF7C00',
  },
});
