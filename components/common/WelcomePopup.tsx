import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Alert, BackHandler } from 'react-native';

interface WelcomePopupProps {
  visible: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ visible, onClose }) => {
  const handleDecline = () => {
    Alert.alert(
      "앱 종료",
      "필수 권한에 비동의하시면 앱을 사용할 수 없습니다. 앱을 종료하시겠습니까?",
      [
        {
          text: "취소",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "종료", onPress: () => BackHandler.exitApp() }
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>권한 설정 안내</Text>
          <Text style={styles.modalText}>
            더 나은 여행 경험을 위해 현재 위치 정보가 필요합니다. 위치 정보는 앱 사용 중에만 활용되며, 저장되지 않습니다.
          </Text>
          <Text style={styles.modalHeader}>필수적 접근 권한</Text>
          <Text style={styles.modalText}>
            위치 권한 : 현재 위치 표시 및 루트 길안내 기능 제공
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.modalButtonDisagree} onPress={handleDecline}>
              <Text style={{ color: 'white', fontFamily: 'Pretendard-SemiBold', fontSize: 20, }}>거절</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonAgree} onPress={onClose}>
              <Text style={{ color: 'white', fontFamily: 'Pretendard-SemiBold', fontSize: 20, }}>동의</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
  },
  modalHeader: {
    marginTop: 15,
    marginBottom: 5,
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
  },
  modalText: {
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButtonAgree: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,    
    width: '60%',
    alignItems: 'center',
  },
  modalButtonDisagree: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    padding: 10,
    width: '35%',
    alignItems: 'center',
  },
});

export default WelcomePopup;